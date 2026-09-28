import { z } from 'zod';

export const createRequestSchema = z.object({
  serviceSlug: z.string().min(1),
  subject: z.string().trim().min(3).max(160),
  message: z.string().trim().min(10).max(4000),
});

export const messageSchema = z.object({
  body: z.string().trim().min(1).max(4000),
});

export const updateRequestSchema = z.object({
  status: z.enum([
    'NEW',
    'REVIEWING',
    'QUOTED',
    'IN_PROGRESS',
    'DELIVERED',
    'CLOSED',
  ]),
  quotedAmount: z.number().int().nonnegative().optional(),
});
