import { z } from 'zod';

export const createTradeBodySchema = z.object({
  offeredCardId: z
    .number()
    .int('교환 제안 카드 ID는 정수여야 합니다.')
    .positive('교환 제안 카드 ID는 양수여야 합니다.'),

  description: z
    .string()
    .trim()
    .min(1, '교환 제안 내용을 입력해 주세요.')
    .max(300, '교환 제안 내용은 300자 이하여야 합니다.'),
});
