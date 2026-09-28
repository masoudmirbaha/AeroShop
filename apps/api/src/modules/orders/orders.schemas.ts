import { z } from 'zod';

export const checkoutSchema = z.object({
  result: z.enum(['SUCCESS', 'FAILED']).default('SUCCESS'),
});
