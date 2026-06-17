import {
  getSalesListService,
  createSaleService,
  getMySalesService,
  getSaleDetailService,
  updateSaleService,
  cancelSaleService,
  purchaseSaleService,
} from '../services/sales.service.js';
import {
  sendSuccess,
  sendSuccessWithMeta,
} from '../helpers/response.helper.js';

export const getSalesController = async (req, res, next) => {
  try {
    console.time('getSalesList');

    const result = await getSalesListService(req.validatedQuery);

    console.timeEnd('getSalesList');

    return sendSuccessWithMeta(res, 200, result.data, result.meta);
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

    return sendSuccess(res, 201, result.data);
  } catch (error) {
    next(error);
  }
};

export const getMySalesController = async (req, res, next) => {
  try {
    console.time('getMySalesList');

    const result = await getMySalesService({
      userUuid: req.user.userUuid,
      ...req.validatedQuery,
    });

    console.timeEnd('getMySalesList');

    return sendSuccessWithMeta(res, 200, result.data, result.meta);
  } catch (error) {
    next(error);
  }
};

export const getSaleDetailController = async (req, res, next) => {
  try {
    const { saleId } = req.params;

    const result = await getSaleDetailService(Number(saleId));

    return sendSuccess(res, 200, result.data);
  } catch (error) {
    next(error);
  }
};

export const updateSaleController = async (req, res, next) => {
  try {
    const { saleId } = req.params;
    const { userUuid } = req.user;

    const result = await updateSaleService(Number(saleId), userUuid, req.body);

    return sendSuccess(res, 200, result.data);
  } catch (error) {
    next(error);
  }
};

export const cancelSaleController = async (req, res, next) => {
  try {
    const { saleId } = req.params;
    const { userUuid } = req.user;

    const result = await cancelSaleService(Number(saleId), userUuid);

    return sendSuccess(res, 200, result.data);
  } catch (error) {
    next(error);
  }
};

export const purchaseSaleController = async (req, res, next) => {
  try {
    const { saleId } = req.params;
    const { userUuid } = req.user;
    const { quantity } = req.body;

    const result = await purchaseSaleService(
      Number(saleId),
      userUuid,
      quantity,
    );

    return sendSuccess(res, 200, result.data);
  } catch (error) {
    next(error);
  }
};
