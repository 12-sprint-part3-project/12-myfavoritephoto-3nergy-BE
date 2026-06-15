import { z } from 'zod';

export const notificationIdParamSchema = z.object({
  notificationId: z.coerce
    .number({
      error: '알림 ID는 숫자여야 합니다.',
    })
    .int('알림 ID는 정수여야 합니다.')
    .positive('알림 ID는 양수여야 합니다.'),
});
