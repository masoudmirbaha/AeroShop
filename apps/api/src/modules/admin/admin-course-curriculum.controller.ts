import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { Roles } from '../../common/roles.decorator.js';
import { ZodValidationPipe } from '../../common/zod-validation.pipe.js';
import {
  lessonInputSchema,
  lessonOrderSchema,
  lessonUpdateSchema,
  sectionInputSchema,
  sectionOrderSchema,
  sectionUpdateSchema,
  type LessonInput,
  type LessonOrderInput,
  type LessonUpdate,
  type SectionInput,
  type SectionOrderInput,
  type SectionUpdate,
} from './admin-course-curriculum.schemas.js';
import { AdminCourseCurriculumService } from './admin-course-curriculum.service.js';

@Roles('ADMIN')
@Controller('admin/products')
export class AdminCourseCurriculumController {
  constructor(private readonly curriculum: AdminCourseCurriculumService) {}

  @Get(':productId/sections')
  list(@Param('productId') productId: string) {
    return this.curriculum.list(productId);
  }

  @Post(':productId/sections')
  createSection(
    @Param('productId') productId: string,
    @Body(new ZodValidationPipe(sectionInputSchema)) body: SectionInput,
  ) {
    return this.curriculum.createSection(productId, body);
  }

  @Patch(':productId/sections/order')
  reorderSections(
    @Param('productId') productId: string,
    @Body(new ZodValidationPipe(sectionOrderSchema)) body: SectionOrderInput,
  ) {
    return this.curriculum.reorderSections(productId, body);
  }

  @Patch(':productId/sections/:sectionId')
  updateSection(
    @Param('productId') productId: string,
    @Param('sectionId') sectionId: string,
    @Body(new ZodValidationPipe(sectionUpdateSchema)) body: SectionUpdate,
  ) {
    return this.curriculum.updateSection(productId, sectionId, body);
  }

  @Delete(':productId/sections/:sectionId')
  deleteSection(
    @Param('productId') productId: string,
    @Param('sectionId') sectionId: string,
  ) {
    return this.curriculum.deleteSection(productId, sectionId);
  }

  @Post(':productId/sections/:sectionId/lessons')
  createLesson(
    @Param('productId') productId: string,
    @Param('sectionId') sectionId: string,
    @Body(new ZodValidationPipe(lessonInputSchema)) body: LessonInput,
  ) {
    return this.curriculum.createLesson(productId, sectionId, body);
  }

  @Patch(':productId/sections/:sectionId/lessons/order')
  reorderLessons(
    @Param('productId') productId: string,
    @Param('sectionId') sectionId: string,
    @Body(new ZodValidationPipe(lessonOrderSchema)) body: LessonOrderInput,
  ) {
    return this.curriculum.reorderLessons(productId, sectionId, body);
  }

  @Patch(':productId/sections/:sectionId/lessons/:lessonId')
  updateLesson(
    @Param('productId') productId: string,
    @Param('sectionId') sectionId: string,
    @Param('lessonId') lessonId: string,
    @Body(new ZodValidationPipe(lessonUpdateSchema)) body: LessonUpdate,
  ) {
    return this.curriculum.updateLesson(productId, sectionId, lessonId, body);
  }

  @Delete(':productId/sections/:sectionId/lessons/:lessonId')
  deleteLesson(
    @Param('productId') productId: string,
    @Param('sectionId') sectionId: string,
    @Param('lessonId') lessonId: string,
  ) {
    return this.curriculum.deleteLesson(productId, sectionId, lessonId);
  }
}
