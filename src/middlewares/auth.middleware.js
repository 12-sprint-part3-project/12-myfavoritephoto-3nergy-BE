import jwt from 'jsonwebtoken';
import { AppError } from '../errors/AppError.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw AppError(ERROR_CODES.ACCESS_TOKEN_MISSING);
    }

    const accessToken = authHeader.split(' ')[1];

    const payload = jwt.verify(accessToken, process.env.JWT_SECRET);

    req.user = {
      userId: payload.userUuid,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(AppError(ERROR_CODES.ACCESS_TOKEN_EXPIRED));
    }

    if (error.name === 'JsonWebTokenError') {
      return next(AppError(ERROR_CODES.INVALID_ACCESS_TOKEN));
    }

    next(error);
  }
};
