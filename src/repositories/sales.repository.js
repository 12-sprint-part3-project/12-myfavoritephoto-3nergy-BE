import { buildPhotocardFilter } from '../helpers/buildPhotocardFilter.helper.js';
import prisma from '../lib/prisma.js';
import {
  cancelSaleSelect,
  myPendingTradeInclude,
  mySaleListInclude,
  ownedPhotocardSelect,
  saleCountsSelect,
  saleDetailInclude,
  saleForUpdateSelect,
  saleListInclude,
  saleStatusSelect,
  updateSaleSelect,
  userPhotocardIdSelect,
} from '../selectors/sales.selector.js';

const buildSaleOrderBy = (sort) => {
  const orderByMap = {
    latest: { createdAt: 'desc' },
    oldest: { createdAt: 'asc' },
    price_asc: { price: 'asc' },
    price_desc: { price: 'desc' },
  };

  return orderByMap[sort] || orderByMap.latest;
};

// 전체 판매 목록 조회
export const findSalesListRepository = async ({
  grade,
  genre,
  keyword,
  status,
  sort,
  skip,
  take,
}) => {
  const where = {
    status: status || {
      in: ['SALE', 'SOLD_OUT'],
    },
    photocard: buildPhotocardFilter({ grade, genre, keyword }),
  };

  const salesList = await prisma.sale.findMany({
    where,
    orderBy: buildSaleOrderBy(sort),
    skip,
    take,
    include: saleListInclude,
  });

  const totalCount = await prisma.sale.count({
    where,
  });

  const countBaseSales = await prisma.sale.findMany({
    where,
    select: saleCountsSelect,
  });

  return { salesList, totalCount, countBaseSales };
};

// 판매 등록
export const createSaleRepository = async (data, tx = prisma) => {
  return tx.sale.create({
    data,
  });
};

// 판매할 OWNED 포토카드 조회
export const findOwnedPhotocardsRepository = async (
  { userUuid, photocardId, quantity },
  tx = prisma,
) => {
  return tx.userPhotocard.findMany({
    where: {
      ownerUuid: userUuid,
      photocardId,
      status: 'OWNED',
    },
    select: ownedPhotocardSelect,
    take: quantity,
  });
};

// 포토카드 상태 변경
export const updateUserPhotocardsStatusRepository = async (
  { userPhotocardIds, status },
  tx = prisma,
) => {
  return tx.userPhotocard.updateMany({
    where: {
      id: {
        in: userPhotocardIds,
      },
    },
    data: {
      status,
    },
  });
};

// 내 판매 목록 조회
export const findMySalesRepository = async ({
  userUuid,
  grade,
  genre,
  keyword,
}) => {
  const where = {
    userUuid,
    status: {
      in: ['SALE', 'SOLD_OUT'],
    },
    photocard: buildPhotocardFilter({ grade, genre, keyword }),
  };

  return prisma.sale.findMany({
    where,
    include: mySaleListInclude,
  });
};

// 내 교환 제안 대기 목록 조회
export const findMyPendingTradesRepository = async ({
  userUuid,
  grade,
  genre,
  keyword,
}) => {
  return prisma.trade.findMany({
    where: {
      proposerUuid: userUuid,
      status: 'PENDING',
      offeredCard: {
        photocard: buildPhotocardFilter({ grade, genre, keyword }),
      },
    },
    include: myPendingTradeInclude,
  });
};

// 판매 상세 조회
export const findSaleDetailRepository = async (saleId) => {
  return prisma.sale.findUnique({
    where: {
      id: saleId,
    },
    include: saleDetailInclude,
  });
};

// 수정할 판매글 조회
export const findSaleForUpdateRepository = async (saleId, tx = prisma) => {
  return tx.sale.findUnique({
    where: {
      id: saleId,
    },
    select: saleForUpdateSelect,
  });
};

// 판매글 수정
export const updateSaleRepository = async (saleId, data, tx = prisma) => {
  return tx.sale.update({
    where: {
      id: saleId,
    },
    data,
    select: updateSaleSelect,
  });
};

// 판매 취소
export const cancelSaleRepository = async (saleId, tx = prisma) => {
  return tx.sale.update({
    where: {
      id: saleId,
    },
    data: {
      status: 'CANCELED',
    },
    select: cancelSaleSelect,
  });
};

// ON_SALE 포토카드 조회
export const findOnSaleUserPhotocardsRepository = async (
  { ownerUuid, photocardId, quantity },
  tx = prisma,
) => {
  return tx.userPhotocard.findMany({
    where: {
      ownerUuid,
      photocardId,
      status: 'ON_SALE',
    },
    select: userPhotocardIdSelect,
    take: quantity,
  });
};

// 포인트 조회
export const findUserPointRepository = async (userUuid, tx = prisma) => {
  return tx.userPoint.findUnique({
    where: {
      userUuid,
    },
  });
};

// 유저 포인트 증감
export const updateUserPointBalanceRepository = async (
  { userUuid, amount },
  tx = prisma,
) => {
  return tx.userPoint.update({
    where: {
      userUuid,
    },
    data: {
      balance: {
        increment: amount,
      },
    },
  });
};

// 포인트 거래 내역 생성
export const createPointTransactionRepository = async (data, tx = prisma) => {
  return tx.pointTransaction.create({
    data,
  });
};

// 구매한 포토카드 소유권 이전
export const transferUserPhotocardsRepository = async (
  { userPhotocardIds, ownerUuid },
  tx = prisma,
) => {
  return tx.userPhotocard.updateMany({
    where: {
      id: {
        in: userPhotocardIds,
      },
    },
    data: {
      ownerUuid,
      status: 'OWNED',
      acquiredAt: new Date(),
    },
  });
};

// 구매 이력 생성
export const createSaleLogRepository = async (data, tx = prisma) => {
  return tx.saleLog.create({
    data,
  });
};

// 판매글 잔여 수량 차감
export const decreaseSaleRemainingQuantityRepository = async (
  { saleId, quantity },
  tx = prisma,
) => {
  return tx.sale.updateMany({
    where: {
      id: saleId,
      status: 'SALE',
      remainingQuantity: {
        gte: quantity,
      },
    },
    data: {
      remainingQuantity: {
        decrement: quantity,
      },
    },
  });
};

// 판매글 상태 변경
export const updateSaleStatusRepository = async (
  { saleId, status },
  tx = prisma,
) => {
  return tx.sale.update({
    where: {
      id: saleId,
    },
    data: {
      status,
    },
    select: saleStatusSelect,
  });
};

// 이미 판매 중인 포토카드 조회
export const findActiveSaleByPhotocardRepository = async (
  { userUuid, photocardId },
  tx = prisma,
) => {
  return tx.sale.findFirst({
    where: {
      userUuid,
      photocardId,
      status: 'SALE',
    },
    select: {
      id: true,
    },
  });
};
