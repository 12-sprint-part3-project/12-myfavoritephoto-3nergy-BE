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
