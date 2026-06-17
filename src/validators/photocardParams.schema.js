import { z } from 'zod';

export const photocardIdParamsSchema = z.object({
  photocardId: z.coerce.number().int().positive(),
});
