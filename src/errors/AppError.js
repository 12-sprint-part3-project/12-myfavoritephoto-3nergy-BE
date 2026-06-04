export const AppError = (errorInfo) => {
  const error = new Error(errorInfo.message);

  error.statusCode = errorInfo.statusCode;
  error.code = errorInfo.code;

  return error;
};
