import { ERROR_CODES } from '../constants/errorCodes.js';

export const errorHandler = (error, req, res, next) => {
  console.error(error);

  const statusCode =
    error.statusCode || ERROR_CODES.INTERNAL_SERVER_ERROR.statusCode;

  const code = error.code || ERROR_CODES.INTERNAL_SERVER_ERROR.code;

  const message = error.message || ERROR_CODES.INTERNAL_SERVER_ERROR.message;

  return res.status(statusCode).json({
    success: false,
    data: null,
    error: {
      code,
      message,
    },
  });
};
