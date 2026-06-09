import { z } from 'zod';

export const createSaleBodySchema = z.object({
  photocardId: z.coerce
    .number()
    .int()
    .positive('포토카드 ID는 1 이상이어야 합니다.'),

  price: z.coerce.number().int().min(0, '판매 가격은 0 이상이어야 합니다.'),

  quantity: z.coerce.number().int().min(1, '판매 수량은 1 이상이어야 합니다.'),

  desiredGrade: z.enum(['common', 'rare', 'super_rare', 'legendary'], {
    message: '올바르지 않은 희망 등급입니다.',
  }),

  desiredGenre: z.enum(
    [
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
    ],
    {
      message: '올바르지 않은 희망 장르입니다.',
    },
  ),

  desiredDescription: z
    .string()
    .trim()
    .min(1, '희망 설명을 입력해 주세요.')
    .max(300, '희망 설명은 300자 이하여야 합니다.'),
});
