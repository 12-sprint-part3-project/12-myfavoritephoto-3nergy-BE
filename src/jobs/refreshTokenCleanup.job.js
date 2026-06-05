import cron from 'node-cron';
import { deleteExpiredRefreshTokens } from '../repositories/auth.repository.js';

export const startRefreshTokenCleanupJob = () => {
  // 매일 새벽 3시에 만료된 Refresh Token 정리
  cron.schedule('0 3 * * *', async () => {
    try {
      const result = await deleteExpiredRefreshTokens();

      console.log(`[CRON] 만료된 Refresh Token ${result.count}개 삭제`);
    } catch (error) {
      console.error('[CRON] Refresh Token 정리 실패:', error);
    }
  });
};
