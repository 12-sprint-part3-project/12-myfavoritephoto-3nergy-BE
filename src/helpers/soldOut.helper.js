import { NOTIFICATION_PRESET } from '../constants/notification.constants.js';
import { updateUserPhotocardsStatusRepository } from '../repositories/sales.repository.js';
import {
  findPendingTradesBySaleRepository,
  updateTradesStatusRepository,
} from '../repositories/trades.repository.js';
import { createNotificationService } from '../services/notification.service.js';

export const cancelPendingTradesBySoldOutService = async (
  { sale, excludeTradeId },
  tx,
) => {
  const pendingTrades = await findPendingTradesBySaleRepository(
    {
      saleId: sale.id,
      tradeId: excludeTradeId,
    },
    tx,
  );

  const pendingTradeIds = pendingTrades.map((trade) => trade.id);

  const pendingOfferedCardIds = pendingTrades.map(
    (trade) => trade.offeredCardId,
  );

  if (pendingTradeIds.length === 0) {
    return;
  }

  await updateTradesStatusRepository(
    {
      tradeIds: pendingTradeIds,
      status: 'CANCELED',
    },
    tx,
  );

  await updateUserPhotocardsStatusRepository(
    {
      userPhotocardIds: pendingOfferedCardIds,
      status: 'OWNED',
    },
    tx,
  );

  for (const pendingTrade of pendingTrades) {
    await createNotificationService(
      {
        userUuid: pendingTrade.proposerUuid,
        ...NOTIFICATION_PRESET.TRADE_CANCELED_BY_SOLD_OUT,
        targetId: sale.id,
        metadata: {
          photocard: {
            id: sale.photocard.id,
            name: sale.photocard.name,
            grade: sale.photocard.grade,
          },
        },
      },
      tx,
    );
  }
};
