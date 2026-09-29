import { z } from 'zod';

const slug = z
  .string()
  .trim()
  .min(2)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'فقط حروف کوچک انگلیسی، عدد و خط تیره');
const optionalId = z.string().min(1).nullable().optional();
const money = z.number().int().nonnegative();

const productFields = z.object({
  type: z.enum(['SINGLE_PRODUCT', 'BUNDLE', 'COURSE', 'FREE']),
  title: z.string().trim().min(2).max(160),
  slug,
  summary: z.string().trim().min(2).max(300),
  description: z.string().trim().min(2).max(20000),
  price: money,
  comparePrice: money.nullable().optional(),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).nullable().optional(),
  categoryId: optionalId,
  topicId: optionalId,
  isPublished: z.boolean(),
  isFeatured: z.boolean(),
});
export const productInputSchema = productFields.extend({
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
});
export const productUpdateSchema = productFields.partial();

const categoryFields = z.object({
  name: z.string().trim().min(2).max(80),
  slug,
  description: z.string().trim().max(500).nullable().optional(),
  parentId: optionalId,
});
export const categoryInputSchema = categoryFields;
export const categoryUpdateSchema = categoryFields.partial();

export const userUpdateSchema = z
  .object({
    role: z.enum(['USER', 'ADMIN']).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((value) => value.role !== undefined || value.isActive !== undefined, {
    message: 'حداقل یک فیلد لازم است',
  });

const faqFields = z.object({
  question: z.string().trim().min(3).max(300),
  answer: z.string().trim().min(3).max(4000),
  sortOrder: z.number().int().min(0).max(10000),
  isPublished: z.boolean(),
});
export const faqInputSchema = faqFields.extend({
  sortOrder: z.number().int().min(0).max(10000).default(0),
  isPublished: z.boolean().default(true),
});
export const faqUpdateSchema = faqFields.partial();

export const adminListQuerySchema = z.object({
  q: z.string().trim().min(1).max(80).optional(),
  status: z.string().trim().min(1).max(20).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type ProductInput = z.infer<typeof productInputSchema>;
export type ProductUpdate = z.infer<typeof productUpdateSchema>;
export type CategoryInput = z.infer<typeof categoryInputSchema>;
export type CategoryUpdate = z.infer<typeof categoryUpdateSchema>;
export type UserUpdate = z.infer<typeof userUpdateSchema>;
export type FaqInput = z.infer<typeof faqInputSchema>;
export type FaqUpdate = z.infer<typeof faqUpdateSchema>;
export type AdminListQuery = z.infer<typeof adminListQuerySchema>;
