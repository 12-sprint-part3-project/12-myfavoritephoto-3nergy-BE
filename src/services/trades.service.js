import { findReceivedTradesBySaleRepository } from '../repositories/trades.repository.js';

export const getReceivedTradesBySaleService = async ({ saleId, userUuid }) => {
  const trades = await findReceivedTradesBySaleRepository({
    saleId,
    receiverUuid: userUuid,
  });

  return trades.map((trade) => ({
    id: trade.id,
    status: trade.status,
    offeredCard: {
      id: trade.offeredCard.photocard.id,
      userPhotocardId: trade.offeredCard.id,
      name: trade.offeredCard.photocard.name,
      imageUrl: trade.offeredCard.photocard.imageUrl,
      grade: trade.offeredCard.photocard.grade,
      genre: trade.offeredCard.photocard.genre,
      price: trade.offeredCard.photocard.price,
      description: trade.description,
    },
    proposer: {
      uuid: trade.proposer.uuid,
      nickname: trade.proposer.nickname,
    },
    createdAt: trade.createdAt,
  }));
};
