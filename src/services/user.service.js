import { ERROR_CODES } from '../constants/errorCodes.js';
import { MONTHLY_PHOTOCARD_CREATION_LIMIT } from '../constants/photocard.constants.js';
import { AppError } from '../errors/AppError.js';
import { countMonthlyCreatedPhotocards } from '../repositories/photocards.repository.js';
import { findUserByUuid } from '../repositories/user.repository.js';

export const getMyInfoUser = async (userUuid) => {
  const user = await findUserByUuid(userUuid);

  if (!user) {
    throw AppError(ERROR_CODES.USER_NOT_FOUND);
  }

  const now = new Date();

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const createdCount = await countMonthlyCreatedPhotocards({
    userUuid,
    startOfMonth,
  });

  const remainingCount = Math.max(
    0,
    MONTHLY_PHOTOCARD_CREATION_LIMIT - createdCount,
  );

  return {
    uuid: user.uuid,
    email: user.email,
    nickname: user.nickname,
    provider: user.provider,
    createdAt: user.createdAt,

    monthlyPhotocardCreationLimit: MONTHLY_PHOTOCARD_CREATION_LIMIT,

    monthlyPhotocardCreatedCount: createdCount,

    remainingPhotocardCreationCount: remainingCount,
  };
};
