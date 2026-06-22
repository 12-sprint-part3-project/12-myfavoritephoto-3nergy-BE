import { z } from 'zod';

const photocardQueryFields = {
  keyword: z.string().optional(),
  grade: z
    .enum(['common', 'rare', 'super_rare', 'legendary'], {
      message: '올바르지 않은 등급입니다.',
    })
    .optional(),
  genre: z
    .enum(
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
    )
    .optional(),
  sort: z
    .enum(['latest', 'oldest', 'price_asc', 'price_desc'], {
      message: '올바르지 않은 정렬 방식입니다.',
    })
    .optional(),
  page: z.coerce
    .number()
    .int()
    .min(1, '페이지 번호는 1 이상이어야 합니다.')
    .default(1),
  pageSize: z.coerce
    .number()
    .int()
    .min(1, '페이지 크기는 1 이상이어야 합니다.')
    .max(100, '페이지 크기는 100 이하여야 합니다.')
    .default(20),
};

export const getSalesListQuerySchema = z.object({
  ...photocardQueryFields,

  status: z
    .enum(['SALE', 'SOLD_OUT'], {
      message: '올바르지 않은 판매 상태입니다.',
    })
    .optional(),
});

export const getGalleryListQuerySchema = z.object({
  ...photocardQueryFields,

  excludeOnSale: z
    .enum(['true', 'false'])
    .optional()
    .transform((value) => value === 'true'),
});

export const getMySalesQuerySchema = z.object({
  ...photocardQueryFields,

  saleMethod: z
    .enum(['SALE', 'TRADE'], {
      message: '올바르지 않은 판매 방법입니다.',
    })
    .optional(),

  isSoldOut: z
    .enum(['true', 'false'], {
      message: '올바르지 않은 매진 여부입니다.',
    })
    .transform((value) => value === 'true')
    .optional(),
});
