import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { IS_PUBLIC } from './public.decorator.js';
import type { AuthUser } from '../modules/auth/auth.types.js';
import { ACCESS_COOKIE } from '../modules/auth/auth.cookies.js';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
      context.getHandler(),
      context.getClass(),
    ]);
    const request = context.switchToHttp().getRequest<Request>();
    const header = request.headers.authorization;
    const bearer = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
    const token = request.cookies?.[ACCESS_COOKIE] ?? bearer;

    if (!token) {
      if (isPublic) return true;
      throw new UnauthorizedException('وارد حساب کاربری شوید');
    }

    try {
      request.user = this.jwt.verify<AuthUser>(token);
      return true;
    } catch {
      if (isPublic) return true;
      throw new UnauthorizedException('نشست شما منقضی شده است');
    }
  }
}
