import { z } from 'zod';

export const getSalesListQuerySchema = z.object({
  keyword: z.string().optional(),
  grade: z.enum(['common', 'rare', 'super_rare', 'legendary']).optional(),
  genre: z
    .enum([
      'album',
      'special',
      'landscape',
      'season_greeting',
      'fan_meeting',
      'concert',
      'md',
      'collage',
      'branding',
      'etc',
    ])
    .optional(),
  status: z.enum(['SALE', 'SOLD_OUT']).optional(),
  sort: z.enum(['latest', 'oldest', 'price_asc', 'price_desc']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
