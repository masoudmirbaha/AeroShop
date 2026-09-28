import { z } from 'zod';

export const productQuerySchema = z.object({
  category: z.string().optional(),
  topic: z.string().optional(),
  type: z.enum(['SINGLE_PRODUCT', 'BUNDLE', 'COURSE', 'FREE']).optional(),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  q: z.string().trim().min(1).max(80).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(48).default(12),
  sort: z.enum(['newest', 'price_asc', 'price_desc']).default('newest'),
});

export type ProductQuery = z.infer<typeof productQuerySchema>;
