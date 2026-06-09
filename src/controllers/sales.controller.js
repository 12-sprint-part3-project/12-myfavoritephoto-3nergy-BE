import {
  getSalesListService,
  getSaleDetailService,
  getMySalesService,
  createSaleService,
} from '../services/sales.service.js';

export const getSalesController = async (req, res, next) => {
  try {
    const result = await getSalesListService(req.validatedQuery);

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

export const createSaleController = async (req, res, next) => {
  try {
    const result = await createSaleService({
      userUuid: req.user.userUuid,
      ...req.body,
    });

    return res.status(201).json({
      success: true,
      message: '판매 등록이 완료되었습니다.',
      data: result.data,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

export const getMySalesController = async (req, res, next) => {
  try {
    const result = await getMySalesService({
      userUuid: req.user.userUuid,
      ...req.validatedQuery,
    });

    return res.status(200).json({
      success: true,
      message: '나의 판매 조회에 성공했습니다.',
      data: result.data,
      meta: result.meta,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

export const getSaleDetailController = async (req, res, next) => {
  try {
    const { saleId } = req.params;

    const result = await getSaleDetailService(Number(saleId));

    return res.status(200).json({
      success: true,
      message: '판매 상세 조회에 성공했습니다.',
      data: result.data,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};
