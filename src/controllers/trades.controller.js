import {
  getReceivedTradesBySaleService,
  createTradeService,
} from '../services/trades.service.js';
import { sendSuccess } from '../helpers/response.helper.js';

// 해당 판매글에 들어온 교환 제안 목록 조회
export const getReceivedTradesBySaleController = async (req, res, next) => {
  try {
    const trades = await getReceivedTradesBySaleService({
      saleId: Number(req.params.saleId),
      userUuid: req.user.userUuid,
    });

    return sendSuccess(res, 200, {
      trades,
    });
  } catch (error) {
    next(error);
  }
};

// 특정 판매글에 대한 교환 제안을 생성
export const createTradeController = async (req, res, next) => {
  try {
    const trade = await createTradeService({
      saleId: Number(req.params.saleId),
      userUuid: req.user.userUuid,
      offeredCardId: req.body.offeredCardId,
      description: req.body.description,
    });

    return sendSuccess(res, 201, trade);
  } catch (error) {
    next(error);
  }
};
