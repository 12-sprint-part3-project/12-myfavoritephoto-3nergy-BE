import { z } from 'zod';

const requiredString = (message) =>
  z.preprocess((value) => value ?? '', z.string().trim().min(1, { message }));

export const createPhotocardBodySchema = z.object({
  name: requiredString('포토카드 이름은 필수입니다.').pipe(
    z.string().max(100, { message: '포토카드 이름은 100자 이하여야 합니다.' }),
  ),

  grade: z.enum(['common', 'rare', 'super_rare', 'legendary'], {
    message: '올바르지 않은 등급입니다.',
  }),

  genre: z.enum(
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
      message: '올바르지 않은 장르입니다.',
    },
  ),

  price: z.coerce
    .number()
    .int('가격은 정수여야 합니다.')
    .min(0, '가격은 0 이상이어야 합니다.'),

  totalQuantity: z.coerce
    .number()
    .int('총 발행 수량은 정수여야 합니다.')
    .min(1, '총 발행 수량은 1 이상이어야 합니다.')
    .max(10, '카드당 최대 10장까지만 발행할 수 있습니다.'),

  imageUrl: requiredString('이미지 URL은 필수입니다.').pipe(
    z
      .string()
      .max(500, { message: '이미지 URL은 500자 이하여야 합니다.' })
      .pipe(
        z.url({
          message: '올바른 이미지 URL 형식이어야 합니다.',
        }),
      ),
  ),

  description: z
    .string()
    .trim()
    .max(300, '설명은 300자 이하여야 합니다.')
    .optional(),
});
