import prisma from '../lib/prisma.js';
import { AppError } from '../errors/AppError.js';
import { ERROR_CODES } from '../constants/errorCodes.js';
import {
  createTradeRepository,
  findSaleByIdRepository,
  findUserPhotocardByIdRepository,
  updateUserPhotocardStatusRepository,
  findReceivedTradesBySaleRepository,
  findMyTradesBySaleRepository,
  updateTradeStatusRepository,
} from '../repositories/trades.repository.js';

// 특정 판매글의 교환 제안 목록을 조회
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

// 교환 제안 생성 및 제안 카드 상태를 변경
export const createTradeService = async ({
  saleId,
  userUuid,
  offeredCardId,
  description,
}) => {
  const sale = await findSaleByIdRepository(saleId);

  if (!sale) {
    throw AppError(ERROR_CODES.SALE_NOT_FOUND);
  }

  if (sale.status !== 'SALE') {
    throw AppError(ERROR_CODES.SALE_NOT_TRADEABLE);
  }

  if (sale.userUuid === userUuid) {
    throw AppError(ERROR_CODES.CANNOT_TRADE_OWN_SALE);
  }

  const offeredCard = await findUserPhotocardByIdRepository(offeredCardId);

  if (!offeredCard) {
    throw AppError(ERROR_CODES.OFFERED_CARD_NOT_FOUND);
  }

  if (offeredCard.ownerUuid !== userUuid) {
    throw AppError(ERROR_CODES.NOT_CARD_OWNER);
  }

  if (offeredCard.status !== 'OWNED') {
    throw AppError(ERROR_CODES.CARD_NOT_AVAILABLE_FOR_TRADE);
  }

  return prisma.$transaction(async (tx) => {
    const trade = await createTradeRepository(
      {
        saleId,
        proposerUuid: userUuid,
        receiverUuid: sale.userUuid,
        offeredCardId,
        description,
        status: 'PENDING',
      },
      tx,
    );

    await updateUserPhotocardStatusRepository(
      {
        id: offeredCardId,
        status: 'TRADE_PENDING',
      },
      tx,
    );

    return trade;
  });
};

// 교환 제안 취소
export const cancelTradeService = async ({ tradeId, userUuid }) => {
  return prisma.$transaction(async (tx) => {
    const trade = await findTradeByIdRepository(tradeId, tx);

    if (!trade) {
      throw AppError(ERROR_CODES.TRADE_NOT_FOUND);
    }

    if (trade.proposerUuid !== userUuid) {
      throw AppError(ERROR_CODES.NOT_TRADE_PROPOSER);
    }

    if (trade.status !== 'PENDING') {
      throw AppError(ERROR_CODES.INVALID_TRADE_STATUS);
    }

    await updateUserPhotocardStatusRepository(
      {
        id: trade.offeredCardId,
        status: 'OWNED',
      },
      tx,
    );

    const canceledTrade = await updateTradeStatusRepository(
      {
        tradeId,
        status: 'CANCELED',
      },
      tx,
    );

    return {
      id: canceledTrade.id,
      status: canceledTrade.status,
    };
  });
};

// 특정 판매글에 내가 제시한 교환 목록 조회
export const getMyTradesBySaleService = async ({ saleId, userUuid }) => {
  const trades = await findMyTradesBySaleRepository({
    saleId,
    proposerUuid: userUuid,
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
    receiver: {
      uuid: trade.receiver.uuid,
      nickname: trade.receiver.nickname,
    },
    createdAt: trade.createdAt,
  }));
};
