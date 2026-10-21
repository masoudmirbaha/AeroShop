import { z } from 'zod';

const sortOrder = z.number().int().min(0).max(10000);

export const sectionInputSchema = z.object({
  title: z.string().trim().min(2).max(160),
  sortOrder: sortOrder.optional(),
});

export const sectionUpdateSchema = z
  .object({
    title: z.string().trim().min(2).max(160).optional(),
    sortOrder: sortOrder.optional(),
  })
  .refine((value) => value.title !== undefined || value.sortOrder !== undefined, {
    message: 'حداقل یک فیلد لازم است',
  });

export const lessonInputSchema = z.object({
  title: z.string().trim().min(2).max(160),
  sortOrder: sortOrder.optional(),
  durationMinutes: z.number().int().min(0).max(24 * 60).nullable().optional(),
});

export const lessonUpdateSchema = z
  .object({
    title: z.string().trim().min(2).max(160).optional(),
    sortOrder: sortOrder.optional(),
    durationMinutes: z.number().int().min(0).max(24 * 60).nullable().optional(),
  })
  .refine(
    (value) =>
      value.title !== undefined ||
      value.sortOrder !== undefined ||
      value.durationMinutes !== undefined,
    { message: 'حداقل یک فیلد لازم است' },
  );

export const sectionOrderSchema = z
  .array(
    z.object({
      id: z.string().min(1),
      sortOrder: sortOrder,
    }),
  )
  .min(1);

export const lessonOrderSchema = sectionOrderSchema;

export type SectionInput = z.infer<typeof sectionInputSchema>;
export type SectionUpdate = z.infer<typeof sectionUpdateSchema>;
export type LessonInput = z.infer<typeof lessonInputSchema>;
export type LessonUpdate = z.infer<typeof lessonUpdateSchema>;
export type SectionOrderInput = z.infer<typeof sectionOrderSchema>;
export type LessonOrderInput = z.infer<typeof lessonOrderSchema>;
