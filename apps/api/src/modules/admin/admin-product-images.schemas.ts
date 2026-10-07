import { z } from 'zod';

export const productImageOrderSchema = z
  .array(
    z.object({
      id: z.string().min(1),
      sortOrder: z.number().int().min(0).max(10000),
    }),
  )
  .max(100);

export type ProductImageOrderInput = z.infer<typeof productImageOrderSchema>;
