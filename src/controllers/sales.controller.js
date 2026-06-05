import { getSalesList } from '../services/sales.service.js';

export const getSales = async (req, res, next) => {
  try {
    const result = await getSalesList(req.validatedQuery);

    return res.status(200).json({
      success: true,
      message: '판매 목록 조회에 성공했습니다.',
      data: result.data,
      meta: result.meta,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};
