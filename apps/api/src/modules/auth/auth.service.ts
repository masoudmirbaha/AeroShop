import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes } from 'node:crypto';
import argon2 from 'argon2';
import type { Response } from 'express';
import type { Env } from '../../config/env.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { UsersService } from '../users/users.service.js';
import { clearAuthCookies, setAuthCookies } from './auth.cookies.js';
import type { LoginInput, RegisterInput } from './auth.schemas.js';

const REFRESH_MS = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  async register(input: RegisterInput, res: Response) {
    const email = input.email.toLowerCase();
    const existing = await this.users.findByEmail(email);
    if (existing) throw new ConflictException('این ایمیل قبلاً ثبت شده است');

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash: await argon2.hash(input.password),
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
      },
    });
    await this.issue(user.id, user.role, res);
    return { user: this.users.toPublic(user) };
  }

  async login(input: LoginInput, res: Response) {
    const user = await this.users.findByEmail(input.email);
    const valid =
      user && (await argon2.verify(user.passwordHash, input.password));
    if (!user || !valid) {
      throw new UnauthorizedException('ایمیل یا رمز عبور نادرست است');
    }
    if (!user.isActive) throw new ForbiddenException('حساب کاربری غیرفعال است');
    await this.issue(user.id, user.role, res);
    return { user: this.users.toPublic(user) };
  }

  async refresh(rawToken: string | undefined, res: Response) {
    if (!rawToken) throw new UnauthorizedException('نشست یافت نشد');
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: hashToken(rawToken) },
      include: { user: true },
    });
    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('نشست منقضی شده است');
    }
    if (!stored.user.isActive) {
      throw new ForbiddenException('حساب کاربری غیرفعال است');
    }
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });
    await this.issue(stored.user.id, stored.user.role, res);
    return { user: this.users.toPublic(stored.user) };
  }

  async logout(rawToken: string | undefined, res: Response) {
    if (rawToken) {
      await this.prisma.refreshToken.updateMany({
        where: { tokenHash: hashToken(rawToken), revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
    clearAuthCookies(res, this.secure);
    return { ok: true };
  }

  async me(userId: string) {
    const user = await this.users.findById(userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('کاربر یافت نشد');
    }
    return { user: this.users.toPublic(user) };
  }

  private get secure() {
    return this.config.get('NODE_ENV', { infer: true }) === 'production';
  }

  private async issue(
    userId: string,
    role: 'USER' | 'ADMIN',
    res: Response,
  ) {
    const accessToken = await this.jwt.signAsync({ sub: userId, role });
    const refreshToken = randomBytes(32).toString('base64url');
    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: hashToken(refreshToken),
        expiresAt: new Date(Date.now() + REFRESH_MS),
      },
    });
    setAuthCookies(res, { accessToken, refreshToken }, this.secure);
  }
}

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}
