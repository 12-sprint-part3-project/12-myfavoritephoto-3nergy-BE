import { ERROR_CODES } from '../constants/errorCodes.js';
import { AppError } from '../errors/AppError.js';
import { findMyPointByUserUuid } from '../repositories/point.repository.js';

export const getMyPoint = async (userUuid) => {
  const userPoint = await findMyPointByUserUuid(userUuid);

  if (!userPoint) {
    throw AppError(ERROR_CODES.USER_NOT_FOUND);
  }

  return {
    nickname: userPoint.nickname,
    poinst: userPoint.point?.balance ?? 0,
  };
};
