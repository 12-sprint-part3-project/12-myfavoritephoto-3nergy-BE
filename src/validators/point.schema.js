import { z } from 'zod';

export const eventPointBodySchema = z.object({
  boxNumber: z.coerce
    .number()
    .int('상자 번호는 정수여야 합니다.')
    .min(1, '상자 번호는 1~3 사이여야 합니다.')
    .max(3, '상자 번호는 1~3 사이여야 합니다.'),
});
