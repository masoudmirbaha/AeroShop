import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../../common/roles.decorator.js';
import { RolesGuard } from '../../common/roles.guard.js';
import { JwtAuthGuard } from '../../common/jwt-auth.guard.js';
import type { PrismaService } from '../../prisma/prisma.service.js';
import { AdminCourseCurriculumService } from './admin-course-curriculum.service.js';
import {
  lessonInputSchema,
  sectionInputSchema,
  sectionUpdateSchema,
} from './admin-course-curriculum.schemas.js';

describe('course curriculum schemas', () => {
  it('accepts a valid section title', () => {
    expect(sectionInputSchema.parse({ title: 'فصل اول' })).toEqual({ title: 'فصل اول' });
  });

  it('rejects an empty section update', () => {
    expect(sectionUpdateSchema.safeParse({}).success).toBe(false);
  });

  it('rejects a negative lesson duration', () => {
    expect(lessonInputSchema.safeParse({ title: 'درس', durationMinutes: -1 }).success).toBe(false);
  });
});

describe('admin course curriculum authorization', () => {
  function mockContext(user?: { sub: string; role: string }) {
    return {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({
          user,
          headers: {},
          cookies: {},
        }),
      }),
    } as unknown as ExecutionContext;
  }

  it('rejects anonymous and non-admin callers', () => {
    const reflector = {
      getAllAndOverride: vi.fn((key: string) => (key === ROLES_KEY ? ['ADMIN'] : undefined)),
    };
    const guard = new RolesGuard(reflector as unknown as Reflector);
    expect(() => guard.canActivate(mockContext())).toThrow(UnauthorizedException);
    expect(() => guard.canActivate(mockContext({ sub: 'u1', role: 'USER' }))).toThrow(
      ForbiddenException,
    );
  });

  it('rejects anonymous JWT access', () => {
    const reflector = { getAllAndOverride: vi.fn(() => false) };
    const jwt = { verify: vi.fn() };
    const guard = new JwtAuthGuard(jwt as never, reflector as unknown as Reflector);
    expect(() => guard.canActivate(mockContext())).toThrow(UnauthorizedException);
  });
});

describe('AdminCourseCurriculumService', () => {
  let prisma: {
    product: { findUnique: ReturnType<typeof vi.fn> };
    courseSection: {
      findMany: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
      aggregate: ReturnType<typeof vi.fn>;
    };
    lesson: {
      findMany: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
      aggregate: ReturnType<typeof vi.fn>;
    };
    $transaction: ReturnType<typeof vi.fn>;
  };
  let service: AdminCourseCurriculumService;

  beforeEach(() => {
    prisma = {
      product: { findUnique: vi.fn() },
      courseSection: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        aggregate: vi.fn(),
      },
      lesson: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        aggregate: vi.fn(),
      },
      $transaction: vi.fn(async (ops: unknown[]) => ops),
    };
    service = new AdminCourseCurriculumService(prisma as unknown as PrismaService);
  });

  it('returns 404 when the product is missing', async () => {
    prisma.product.findUnique.mockResolvedValueOnce(null);
    await expect(service.list('p1')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects curriculum edits for non-course products', async () => {
    prisma.product.findUnique.mockResolvedValueOnce({ id: 'p1', type: 'SINGLE_PRODUCT' });
    await expect(service.createSection('p1', { title: 'فصل' })).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(prisma.courseSection.create).not.toHaveBeenCalled();
  });

  it('creates a section with the next sortOrder', async () => {
    prisma.product.findUnique.mockResolvedValueOnce({ id: 'p1', type: 'COURSE' });
    prisma.courseSection.aggregate.mockResolvedValueOnce({ _max: { sortOrder: 2 } });
    prisma.courseSection.create.mockResolvedValueOnce({
      id: 's1',
      productId: 'p1',
      title: 'فصل تازه',
      sortOrder: 3,
    });

    await expect(service.createSection('p1', { title: 'فصل تازه' })).resolves.toMatchObject({
      id: 's1',
      sortOrder: 3,
      lessons: [],
    });
    expect(prisma.courseSection.create).toHaveBeenCalledWith({
      data: { productId: 'p1', title: 'فصل تازه', sortOrder: 3 },
    });
  });

  it('creates a lesson under a section', async () => {
    prisma.product.findUnique.mockResolvedValueOnce({ id: 'p1', type: 'COURSE' });
    prisma.courseSection.findFirst.mockResolvedValueOnce({
      id: 's1',
      productId: 'p1',
      title: 'فصل',
      sortOrder: 0,
    });
    prisma.lesson.aggregate.mockResolvedValueOnce({ _max: { sortOrder: null } });
    prisma.lesson.create.mockResolvedValueOnce({
      id: 'l1',
      sectionId: 's1',
      title: 'درس ۱',
      sortOrder: 0,
      durationMinutes: 15,
    });

    await expect(
      service.createLesson('p1', 's1', { title: 'درس ۱', durationMinutes: 15 }),
    ).resolves.toMatchObject({ id: 'l1', durationMinutes: 15 });
  });

  it('returns 404 when deleting a lesson from the wrong section', async () => {
    prisma.product.findUnique.mockResolvedValueOnce({ id: 'p1', type: 'COURSE' });
    prisma.courseSection.findFirst.mockResolvedValueOnce({
      id: 's1',
      productId: 'p1',
      title: 'فصل',
      sortOrder: 0,
    });
    prisma.lesson.findFirst.mockResolvedValueOnce(null);
    await expect(service.deleteLesson('p1', 's1', 'l-missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
