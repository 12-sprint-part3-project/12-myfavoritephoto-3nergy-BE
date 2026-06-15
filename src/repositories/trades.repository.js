import { includes } from 'zod';
import prisma from '../lib/prisma.js';

// 받은 교환 제안 조회
export const findReceivedTradesBySaleRepository = async ({
  saleId,
  receiverUuid,
}) => {
  return prisma.trade.findMany({
    where: {
      saleId,
      receiverUuid,
      status: 'PENDING',
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      proposer: {
        select: {
          uuid: true,
          nickname: true,
        },
      },
      offeredCard: {
        include: {
          photocard: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
              grade: true,
              genre: true,
              price: true,
            },
          },
        },
      },
    },
  });
};

// 판매글 ID로 판매글을 조회
export const findSaleByIdRepository = async (saleId, tx = prisma) => {
  return tx.sale.findUnique({
    where: { id: saleId },
    select: {
      id: true,
      userUuid: true,
      status: true,
    },
  });
};

// UserPhotocard ID로 제안 카드를 조회
export const findUserPhotocardByIdRepository = async (
  userPhotocardId,
  tx = prisma,
) => {
  return tx.userPhotocard.findUnique({
    where: { id: userPhotocardId },
    select: {
      id: true,
      ownerUuid: true,
      status: true,
    },
  });
};

// 교환 제안 생성
export const createTradeRepository = async (data, tx = prisma) => {
  return tx.trade.create({
    data,
    select: {
      id: true,
      saleId: true,
      offeredCardId: true,
      description: true,
      status: true,
      createdAt: true,
    },
  });
};

// 제안 카드 상태 변경
export const updateUserPhotocardStatusRepository = async (
  { id, status },
  tx = prisma,
) => {
  return tx.userPhotocard.update({
    where: { id },
    data: { status },
  });
};

// 교환 ID 조회
export const findTradeByIdRepository = async (tradeId, tx = prisma) => {
  return tx.trade.findUnique({
    where: {
      id: tradeId,
    },
    include: {
      sale: true,
      offeredCard: true,
    },
  });
};

// 교환 제안 상태 변경
export const updateTradeStatusRepository = async (
  { tradeId, status },
  tx = prisma,
) => {
  return tx.trade.update({
    where: {
      id: tradeId,
    },
    data: {
      status,
    },
  });
};

// 특정 판매글에 내가 제시한 교환 목록 조회
export const findMyTradesBySaleRepository = async ({
  saleId,
  proposerUuid,
}) => {
  return prisma.trade.findMany({
    where: {
      saleId,
      proposerUuid,
      status: 'PENDING',
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      receiver: {
        select: {
          uuid: true,
          nickname: true,
        },
      },
      offeredCard: {
        include: {
          photocard: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
              grade: true,
              genre: true,
              price: true,
            },
          },
        },
      },
    },
  });
};

// 판매 중인 카드 1장 조회
export const findSaleCardRepository = async (
  { ownerUuid, photocardId },
  tx = prisma,
) => {
  return tx.userPhotocard.findFirst({
    where: {
      ownerUuid,
      photocardId,
      status: 'ON_SALE',
    },
  });
};

// 카드 소유자, 상태, 획득일 변경
export const updateUserPhotocardOwnerAndStatusRepository = async (
  { id, ownerUuid, status },
  tx = prisma,
) => {
  return tx.userPhotocard.update({
    where: { id },
    data: {
      ownerUuid,
      status,
      acquiredAt: new Date(),
    },
  });
};

// 같은 판매글의 PENDING 교환 제안 조회
export const findPendingTradesBySaleRepository = async (
  { saleId, tradeId },
  tx = prisma,
) => {
  return tx.trade.findMany({
    where: {
      saleId,
      status: 'PENDING',
      NOT: {
        id: tradeId,
      },
    },
    select: {
      id: true,
      offeredCardId: true,
    },
  });
};
