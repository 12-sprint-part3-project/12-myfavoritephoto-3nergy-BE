import { z } from 'zod';

export const photocardIdParamsSchema = z.object({
  photocardId: z.coerce.number().int().positive(),
});

export const saleIdParamsSchema = z.object({
  saleId: z.coerce.number().int().positive(),
});
