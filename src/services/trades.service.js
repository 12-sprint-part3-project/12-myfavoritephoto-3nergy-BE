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
  findTradeByIdRepository,
  findSaleCardRepository,
  updateUserPhotocardOwnerAndStatusRepository,
  findPendingTradesBySaleRepository,
  updateTradesStatusRepository,
} from '../repositories/trades.repository.js';
import {
  decreaseSaleRemainingQuantityRepository,
  updateSaleStatusRepository,
  updateUserPhotocardsStatusRepository,
} from '../repositories/sales.repository.js';
import { NOTIFICATION_PRESET } from '../constants/notification.constants.js';
import { createNotificationService } from './notification.service.js';
import { findUserNicknameByUuid } from '../repositories/user.repository.js';
import { cancelPendingTradesBySoldOutService } from '../helpers/soldOut.helper.js';

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
    const proposer = await findUserNicknameByUuid(userUuid, tx);

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

    await createNotificationService(
      {
        userUuid: sale.userUuid,
        ...NOTIFICATION_PRESET.TRADE_PROPOSED,
        targetId: sale.id,
        metadata: {
          actor: {
            uuid: userUuid,
            nickname: proposer.nickname,
          },
          photocard: {
            id: sale.photocard.id,
            name: sale.photocard.name,
            grade: sale.photocard.grade,
          },
        },
      },
      tx,
    );

    return trade;
  });
};

// 교환 제안 취소
export const cancelTradeService = async ({ tradeId, userUuid }) => {
  return prisma.$transaction(
    async (tx) => {
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

      await createNotificationService(
        {
          userUuid: trade.receiverUuid,
          ...NOTIFICATION_PRESET.TRADE_CANCELED,
          targetId: trade.saleId,
          metadata: {
            actor: {
              uuid: trade.proposer.uuid,
              nickname: trade.proposer.nickname,
            },
            photocard: {
              id: trade.sale.photocard.id,
              name: trade.sale.photocard.name,
              grade: trade.sale.photocard.grade,
            },
          },
        },
        tx,
      );

      return {
        id: canceledTrade.id,
        status: canceledTrade.status,
      };
    },
    {
      timeout: 10000,
    },
  );
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

export const acceptTradeService = async ({ tradeId, userUuid }) => {
  return prisma.$transaction(
    async (tx) => {
      // 교환 제안 조회 및 검증
      const trade = await findTradeByIdRepository(tradeId, tx);

      if (!trade) {
        throw AppError(ERROR_CODES.TRADE_NOT_FOUND);
      }

      if (trade.receiverUuid !== userUuid) {
        throw AppError(ERROR_CODES.NOT_TRADE_RECEIVER);
      }

      if (trade.status !== 'PENDING') {
        throw AppError(ERROR_CODES.INVALID_TRADE_STATUS);
      }

      const sale = trade.sale;

      // 판매글 상태 검증
      if (sale.status !== 'SALE') {
        throw AppError(ERROR_CODES.INVALID_SALE_STATUS);
      }

      if (sale.remainingQuantity <= 0) {
        throw AppError(ERROR_CODES.INSUFFICIENT_SALE_QUANTITY);
      }

      // 제안 카드 상태 검증
      if (trade.offeredCard.status !== 'TRADE_PENDING') {
        throw AppError(ERROR_CODES.CARD_NOT_AVAILABLE_FOR_TRADE);
      }

      // 판매 중인 카드 조회
      const saleCard = await findSaleCardRepository(
        {
          ownerUuid: sale.userUuid,
          photocardId: sale.photocardId,
        },
        tx,
      );

      if (!saleCard) {
        throw AppError(ERROR_CODES.CARD_NOT_AVAILABLE_FOR_TRADE);
      }

      // 카드 소유권 교환
      await updateUserPhotocardOwnerAndStatusRepository(
        {
          id: saleCard.id,
          ownerUuid: trade.proposerUuid,
          status: 'OWNED',
        },
        tx,
      );

      await updateUserPhotocardOwnerAndStatusRepository(
        {
          id: trade.offeredCardId,
          ownerUuid: trade.receiverUuid,
          status: 'OWNED',
        },
        tx,
      );

      // 판매글 잔여 수량 차감
      const decreaseResult = await decreaseSaleRemainingQuantityRepository(
        {
          saleId: sale.id,
          quantity: 1,
        },
        tx,
      );

      if (decreaseResult.count === 0) {
        throw AppError(ERROR_CODES.INSUFFICIENT_SALE_QUANTITY);
      }

      const nextRemainingQuantity = sale.remainingQuantity - 1;

      if (nextRemainingQuantity === 0) {
        await updateSaleStatusRepository(
          {
            saleId: sale.id,
            status: 'SOLD_OUT',
          },
          tx,
        );

        await cancelPendingTradesBySoldOutService(
          {
            sale,
            excludeTradeId: tradeId,
          },
          tx,
        );
      }

      // 교환 상태 변경
      const acceptedTrade = await updateTradeStatusRepository(
        {
          tradeId,
          status: 'ACCEPTED',
        },
        tx,
      );

      // 교환 수락 알림 생성
      await createNotificationService(
        {
          userUuid: trade.proposerUuid,
          ...NOTIFICATION_PRESET.TRADE_ACCEPTED,
          targetId: null,
          metadata: {
            actor: {
              uuid: trade.receiver.uuid,
              nickname: trade.receiver.nickname,
            },
            photocard: {
              id: trade.sale.photocard.id,
              name: trade.sale.photocard.name,
              grade: trade.sale.photocard.grade,
            },
          },
        },
        tx,
      );

      return {
        id: acceptedTrade.id,
        status: acceptedTrade.status,
      };
    },
    {
      timeout: 10000,
    },
  );
};

export const rejectTradeService = async ({ tradeId, userUuid }) => {
  return prisma.$transaction(
    async (tx) => {
      const trade = await findTradeByIdRepository(tradeId, tx);

      if (!trade) {
        throw AppError(ERROR_CODES.TRADE_NOT_FOUND);
      }

      if (trade.receiverUuid !== userUuid) {
        throw AppError(ERROR_CODES.NOT_TRADE_RECEIVER);
      }

      if (trade.status !== 'PENDING') {
        throw AppError(ERROR_CODES.INVALID_TRADE_STATUS);
      }

      // 제안 카드 상태 복구
      await updateUserPhotocardStatusRepository(
        {
          id: trade.offeredCardId,
          status: 'OWNED',
        },
        tx,
      );

      // 교환 상태 변경
      const rejectedTrade = await updateTradeStatusRepository(
        {
          tradeId,
          status: 'REJECTED',
        },
        tx,
      );

      // 교환 거절 알림 생성
      await createNotificationService(
        {
          userUuid: trade.proposerUuid,
          ...NOTIFICATION_PRESET.TRADE_REJECTED,
          targetId: trade.saleId,
          metadata: {
            actor: {
              uuid: trade.receiver.uuid,
              nickname: trade.receiver.nickname,
            },
            photocard: {
              id: trade.sale.photocard.id,
              name: trade.sale.photocard.name,
              grade: trade.sale.photocard.grade,
            },
          },
        },
        tx,
      );

      return {
        id: rejectedTrade.id,
        status: rejectedTrade.status,
      };
    },
    {
      timeout: 10000,
    },
  );
};
