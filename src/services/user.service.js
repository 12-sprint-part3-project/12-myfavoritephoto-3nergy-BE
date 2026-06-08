import { ERROR_CODES } from '../constants/errorCodes.js';
import { AppError } from '../errors/AppError.js';
import { findUserByUuid } from '../repositories/user.repository.js';

export const getMyInfoUser = async (userUuid) => {
  const user = await findUserByUuid(userUuid);

  if (!user) {
    throw AppError(ERROR_CODES.USER_NOT_FOUND);
  }

  return {
    uuid: user.uuid,
    email: user.email,
    nickname: user.nickname,
    provider: user.provider,
    createdAt: user.createdAt,
  };
};
