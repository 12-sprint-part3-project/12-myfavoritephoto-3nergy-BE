// 공통 성공 응답 반환
export const sendSuccess = (res, statusCode, data = null) => {
  return res.status(statusCode).json({
    success: true,
    data,
    error: null,
  });
};

// 페이징 응답
export const sendSuccessWithMeta = (
  res,
  statusCode,
  data = null,
  meta = null,
) => {
  return res.status(statusCode).json({
    success: true,
    data,
    meta,
    error: null,
  });
};
