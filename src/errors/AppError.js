export const AppError = (errorInfo) => {
  const error = new Error(errorInfo.message);

  error.statusCode = errorInfo.statusCode;
  error.code = errorInfo.code;

  if (errorInfo.nextAvailableAt) {
    error.nextAvailableAt = errorInfo.nextAvailableAt;
  }

  return error;
};
