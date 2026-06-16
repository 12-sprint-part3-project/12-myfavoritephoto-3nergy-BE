import { ERROR_CODES } from '../constants/errorCodes.js';
import { AppError } from '../errors/AppError.js';

export const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body ?? {});

    if (!result.success) {
      const message = result.error.issues[0].message;

      return next(AppError({ ...ERROR_CODES.INVALID_INPUT, message }));
    }

    req.body = result.data;
    next();
  };
};

export const validateQuery = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      const message = result.error.issues[0].message;

      return next(AppError({ ...ERROR_CODES.INVALID_INPUT, message }));
    }

    req.validatedQuery = result.data;
    next();
  };
};

export const validateParams = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      const message = result.error.issues[0].message;

      return next(AppError({ ...ERROR_CODES.INVALID_INPUT, message }));
    }

    req.params = result.data;
    next();
  };
};
