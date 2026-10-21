import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import type {
  LessonInput,
  LessonOrderInput,
  LessonUpdate,
  SectionInput,
  SectionOrderInput,
  SectionUpdate,
} from './admin-course-curriculum.schemas.js';

@Injectable()
export class AdminCourseCurriculumService {
  constructor(private readonly prisma: PrismaService) {}

  async list(productId: string) {
    await this.requireCourseProduct(productId);
    const sections = await this.prisma.courseSection.findMany({
      where: { productId },
      orderBy: { sortOrder: 'asc' },
      include: { lessons: { orderBy: { sortOrder: 'asc' } } },
    });
    return sections.map((section) => ({
      id: section.id,
      productId: section.productId,
      title: section.title,
      sortOrder: section.sortOrder,
      lessons: section.lessons.map((lesson) => ({
        id: lesson.id,
        sectionId: lesson.sectionId,
        title: lesson.title,
        sortOrder: lesson.sortOrder,
        durationMinutes: lesson.durationMinutes,
      })),
    }));
  }

  async createSection(productId: string, input: SectionInput) {
    await this.requireCourseProduct(productId);
    const sortOrder =
      input.sortOrder ??
      ((
        await this.prisma.courseSection.aggregate({
          where: { productId },
          _max: { sortOrder: true },
        })
      )._max.sortOrder ?? -1) + 1;
    const section = await this.prisma.courseSection.create({
      data: { productId, title: input.title, sortOrder },
    });
    return {
      id: section.id,
      productId: section.productId,
      title: section.title,
      sortOrder: section.sortOrder,
      lessons: [] as const,
    };
  }

  async updateSection(productId: string, sectionId: string, input: SectionUpdate) {
    await this.requireSection(productId, sectionId);
    const section = await this.prisma.courseSection.update({
      where: { id: sectionId },
      data: input,
      include: { lessons: { orderBy: { sortOrder: 'asc' } } },
    });
    return {
      id: section.id,
      productId: section.productId,
      title: section.title,
      sortOrder: section.sortOrder,
      lessons: section.lessons.map((lesson) => ({
        id: lesson.id,
        sectionId: lesson.sectionId,
        title: lesson.title,
        sortOrder: lesson.sortOrder,
        durationMinutes: lesson.durationMinutes,
      })),
    };
  }

  async deleteSection(productId: string, sectionId: string) {
    await this.requireSection(productId, sectionId);
    await this.prisma.courseSection.delete({ where: { id: sectionId } });
    return { ok: true };
  }

  async reorderSections(productId: string, order: SectionOrderInput) {
    await this.requireCourseProduct(productId);
    const existing = await this.prisma.courseSection.findMany({
      where: { productId },
      select: { id: true },
    });
    assertExactIds(
      existing.map((item) => item.id),
      order.map((item) => item.id),
      'فهرست سرفصل‌ها با دوره هم‌خوانی ندارد',
    );
    await this.prisma.$transaction(
      order.map((item) =>
        this.prisma.courseSection.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        }),
      ),
    );
    return this.list(productId);
  }

  async createLesson(productId: string, sectionId: string, input: LessonInput) {
    await this.requireSection(productId, sectionId);
    const sortOrder =
      input.sortOrder ??
      ((
        await this.prisma.lesson.aggregate({
          where: { sectionId },
          _max: { sortOrder: true },
        })
      )._max.sortOrder ?? -1) + 1;
    const lesson = await this.prisma.lesson.create({
      data: {
        sectionId,
        title: input.title,
        sortOrder,
        durationMinutes: input.durationMinutes ?? null,
      },
    });
    return {
      id: lesson.id,
      sectionId: lesson.sectionId,
      title: lesson.title,
      sortOrder: lesson.sortOrder,
      durationMinutes: lesson.durationMinutes,
    };
  }

  async updateLesson(
    productId: string,
    sectionId: string,
    lessonId: string,
    input: LessonUpdate,
  ) {
    await this.requireLesson(productId, sectionId, lessonId);
    const lesson = await this.prisma.lesson.update({
      where: { id: lessonId },
      data: input,
    });
    return {
      id: lesson.id,
      sectionId: lesson.sectionId,
      title: lesson.title,
      sortOrder: lesson.sortOrder,
      durationMinutes: lesson.durationMinutes,
    };
  }

  async deleteLesson(productId: string, sectionId: string, lessonId: string) {
    await this.requireLesson(productId, sectionId, lessonId);
    await this.prisma.lesson.delete({ where: { id: lessonId } });
    return { ok: true };
  }

  async reorderLessons(productId: string, sectionId: string, order: LessonOrderInput) {
    await this.requireSection(productId, sectionId);
    const existing = await this.prisma.lesson.findMany({
      where: { sectionId },
      select: { id: true },
    });
    assertExactIds(
      existing.map((item) => item.id),
      order.map((item) => item.id),
      'فهرست درس‌ها با سرفصل هم‌خوانی ندارد',
    );
    await this.prisma.$transaction(
      order.map((item) =>
        this.prisma.lesson.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        }),
      ),
    );
    const section = await this.requireSection(productId, sectionId);
    return {
      id: section.id,
      productId: section.productId,
      title: section.title,
      sortOrder: section.sortOrder,
      lessons: (
        await this.prisma.lesson.findMany({
          where: { sectionId },
          orderBy: { sortOrder: 'asc' },
        })
      ).map((lesson) => ({
        id: lesson.id,
        sectionId: lesson.sectionId,
        title: lesson.title,
        sortOrder: lesson.sortOrder,
        durationMinutes: lesson.durationMinutes,
      })),
    };
  }

  private async requireCourseProduct(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, type: true },
    });
    if (!product) throw new NotFoundException('محصول یافت نشد');
    if (product.type !== 'COURSE') {
      throw new BadRequestException('سرفصل فقط برای محصولات از نوع دوره قابل مدیریت است');
    }
    return product;
  }

  private async requireSection(productId: string, sectionId: string) {
    await this.requireCourseProduct(productId);
    const section = await this.prisma.courseSection.findFirst({
      where: { id: sectionId, productId },
    });
    if (!section) throw new NotFoundException('سرفصل یافت نشد');
    return section;
  }

  private async requireLesson(productId: string, sectionId: string, lessonId: string) {
    await this.requireSection(productId, sectionId);
    const lesson = await this.prisma.lesson.findFirst({
      where: { id: lessonId, sectionId },
    });
    if (!lesson) throw new NotFoundException('درس یافت نشد');
    return lesson;
  }
}

function assertExactIds(existing: string[], incoming: string[], message: string) {
  if (existing.length !== incoming.length) {
    throw new BadRequestException(message);
  }
  const set = new Set(existing);
  if (incoming.some((id) => !set.has(id)) || new Set(incoming).size !== incoming.length) {
    throw new BadRequestException(message);
  }
}
