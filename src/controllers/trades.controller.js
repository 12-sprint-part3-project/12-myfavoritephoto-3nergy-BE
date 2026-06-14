import { getReceivedTradesBySaleService } from '../services/trades.service.js';
import { sendSuccess } from '../helpers/response.helper.js';

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
