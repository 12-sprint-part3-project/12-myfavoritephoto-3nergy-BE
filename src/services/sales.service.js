import {
  findSalesListRepository,
  createSaleRepository,
  findOwnedPhotocardsRepository,
  findMySalesRepository,
  findMyPendingTradesRepository,
  findSaleDetailRepository,
  updateUserPhotocardsStatusRepository,
  findSaleForUpdateRepository,
  updateSaleRepository,
  findOnSaleUserPhotocardsRepository,
  cancelSaleRepository,
  updateUserPointBalanceRepository,
  findUserPointRepository,
  decreaseSaleRemainingQuantityRepository,
  createPointTransactionRepository,
  transferUserPhotocardsRepository,
  createSaleLogRepository,
  updateSaleStatusRepository,
  findActiveSaleByPhotocardRepository,
} from '../repositories/sales.repository.js';
import { AppError } from '../errors/AppError.js';
import { ERROR_CODES } from '../constants/errorCodes.js';
import prisma from '../lib/prisma.js';
import {
  buildFilterCounts,
  GENRE_VALUES,
  GRADE_VALUES,
  SALE_METHOD_VALUES,
  SALE_STATUS_VALUES,
} from '../helpers/buildFilterCounts.helper.js';
import { createNotificationService } from './notification.service.js';
import { NOTIFICATION_PRESET } from '../constants/notification.constants.js';
import { findUserNicknameByUuid } from '../repositories/user.repository.js';
import {
  findPendingTradesBySaleIdRepository,
  updateTradesStatusRepository,
} from '../repositories/trades.repository.js';
import { cancelPendingTradesBySoldOutService } from '../helpers/soldOut.helper.js';

export const getSalesListService = async (query) => {
  const page = Number(query.page) || 1;
  const pageSize = Number(query.pageSize) || 20;
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  const { salesList, totalCount, countBaseSales } =
    await findSalesListRepository({
      grade: query.grade,
      genre: query.genre,
      keyword: query.keyword,
      status: query.status,
      sort: query.sort,
      skip,
      take,
    });

  const sales = salesList.map((sale) => ({
    saleId: sale.id,
    price: sale.price,
    quantity: sale.quantity,
    remainingQuantity: sale.remainingQuantity,
    status: sale.status,
    grade: sale.photocard.grade,
    genre: sale.photocard.genre,
    createdAt: sale.createdAt,
    photocard: sale.photocard,
    seller: sale.seller,
  }));

  const countItems = countBaseSales.map((sale) => ({
    grade: sale.photocard.grade,
    genre: sale.photocard.genre,
    status: sale.status,
  }));

  const gradeCounts = buildFilterCounts({
    items: countItems,
    field: 'grade',
    values: GRADE_VALUES,
    responseKey: 'grade',
  });

  const genreCounts = buildFilterCounts({
    items: countItems,
    field: 'genre',
    values: GENRE_VALUES,
    responseKey: 'genre',
  });

  const saleStatusCounts = buildFilterCounts({
    items: countItems,
    field: 'status',
    values: SALE_STATUS_VALUES,
    responseKey: 'status',
  });

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    data: {
      gradeCounts,
      genreCounts,
      saleStatusCounts,
      sales,
    },
    meta: {
      page,
      pageSize,
      totalCount,
      totalPages,
      hasNextPage: page < totalPages,
    },
  };
};

export const createSaleService = async (data) => {
  const sale = await prisma.$transaction(async (tx) => {
    const existingSale = await findActiveSaleByPhotocardRepository(
      {
        userUuid: data.userUuid,
        photocardId: data.photocardId,
      },
      tx,
    );

    if (existingSale) {
      throw AppError(ERROR_CODES.DUPLICATE_SALE_PHOTOCARD);
    }

    const ownedPhotocards = await findOwnedPhotocardsRepository(
      {
        userUuid: data.userUuid,
        photocardId: data.photocardId,
        quantity: data.quantity,
      },
      tx,
    );

    if (ownedPhotocards.length === 0) {
      throw AppError(ERROR_CODES.NOT_CARD_OWNER);
    }

    if (ownedPhotocards.length < data.quantity) {
      throw AppError(ERROR_CODES.NOT_ENOUGH_QUANTITY);
    }

    const selectedUserPhotocardIds = ownedPhotocards.map((card) => card.id);

    const createdSale = await createSaleRepository(
      {
        userUuid: data.userUuid,
        photocardId: data.photocardId,
        price: data.price,
        quantity: data.quantity,
        remainingQuantity: data.quantity,
        status: 'SALE',
        desiredGrade: data.desiredGrade,
        desiredGenre: data.desiredGenre,
        desiredDescription: data.desiredDescription,
      },
      tx,
    );

    await updateUserPhotocardsStatusRepository(
      {
        userPhotocardIds: selectedUserPhotocardIds,
        status: 'ON_SALE',
      },
      tx,
    );

    return createdSale;
  });

  return {
    data: {
      sale: {
        id: sale.id,
        photocardId: sale.photocardId,
        price: sale.price,
        quantity: sale.quantity,
        remainingQuantity: sale.remainingQuantity,
        status: sale.status,
        desiredGrade: sale.desiredGrade,
        desiredGenre: sale.desiredGenre,
        desiredDescription: sale.desiredDescription,
        createdAt: sale.createdAt,
      },
    },
  };
};

export const getMySalesService = async (query) => {
  const page = Number(query.page) || 1;
  const pageSize = Number(query.pageSize) || 20;

  const [mySalesList, pendingTrades] = await Promise.all([
    findMySalesRepository({
      userUuid: query.userUuid,
      grade: query.grade,
      genre: query.genre,
      keyword: query.keyword,
    }),
    findMyPendingTradesRepository({
      userUuid: query.userUuid,
      grade: query.grade,
      genre: query.genre,
      keyword: query.keyword,
    }),
  ]);

  const mySales = mySalesList.map((sale) => ({
    saleId: sale.id,
    name: sale.photocard.name,
    imageUrl: sale.photocard.imageUrl,
    grade: sale.photocard.grade,
    genre: sale.photocard.genre,
    price: sale.price,
    remainingQuantity: sale.remainingQuantity,
    nickname: sale.seller.nickname,
    displayStatus: sale.status === 'SOLD_OUT' ? 'SOLD_OUT' : 'SALE',
    countStatus: sale.status === 'SOLD_OUT' ? 'SOLD_OUT' : 'SALE',
    saleMethod: 'SALE',
    createdAt: sale.createdAt,
  }));

  const tradePendingCards = pendingTrades.map((trade) => ({
    saleId: trade.saleId,
    tradeId: trade.id,
    offeredCardId: trade.offeredCard.id,
    name: trade.offeredCard.photocard.name,
    imageUrl: trade.offeredCard.photocard.imageUrl,
    grade: trade.offeredCard.photocard.grade,
    genre: trade.offeredCard.photocard.genre,
    price: trade.offeredCard.photocard.price,
    remainingQuantity: 1,
    nickname: trade.offeredCard.owner.nickname,
    displayStatus: 'TRADE_PENDING',
    countStatus: 'SALE',
    saleMethod: 'TRADE',
    createdAt: trade.createdAt,
  }));

  const combinedMySales = [...mySales, ...tradePendingCards];
  let filteredMySales = combinedMySales;

  if (query.saleMethod === 'SALE') {
    filteredMySales = filteredMySales.filter(
      (item) => item.displayStatus !== 'TRADE_PENDING',
    );
  }

  if (query.saleMethod === 'TRADE') {
    filteredMySales = filteredMySales.filter(
      (item) => item.displayStatus === 'TRADE_PENDING',
    );
  }

  if (query.isSoldOut === true) {
    filteredMySales = filteredMySales.filter(
      (item) => item.displayStatus === 'SOLD_OUT',
    );
  }

  if (query.isSoldOut === false) {
    filteredMySales = filteredMySales.filter(
      (item) => item.displayStatus !== 'SOLD_OUT',
    );
  }

  const sortMap = {
    latest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    oldest: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    price_asc: (a, b) => a.price - b.price,
    price_desc: (a, b) => b.price - a.price,
  };

  const sortFunction = sortMap[query.sort] || sortMap.latest;
  const sortedMySales = [...filteredMySales].sort(sortFunction);

  const gradeCounts = buildFilterCounts({
    items: filteredMySales,
    field: 'grade',
    values: GRADE_VALUES,
    responseKey: 'grade',
  });

  const genreCounts = buildFilterCounts({
    items: filteredMySales,
    field: 'genre',
    values: GENRE_VALUES,
    responseKey: 'genre',
  });

  const saleStatusCounts = buildFilterCounts({
    items: filteredMySales,
    field: 'countStatus',
    values: SALE_STATUS_VALUES,
    responseKey: 'status',
  });

  const saleMethodCounts = buildFilterCounts({
    items: filteredMySales,
    field: 'saleMethod',
    values: SALE_METHOD_VALUES,
    responseKey: 'saleMethod',
  });

  const totalCount = sortedMySales.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  const start = (page - 1) * pageSize;
  const pagedMySales = sortedMySales.slice(start, start + pageSize);
  return {
    data: {
      gradeCounts,
      genreCounts,
      saleStatusCounts,
      saleMethodCounts,
      mySales: pagedMySales,
    },
    meta: {
      page,
      pageSize,
      totalCount,
      totalPages,
      hasNextPage: page < totalPages,
    },
  };
};

export const getSaleDetailService = async (saleId) => {
  const sale = await findSaleDetailRepository(Number(saleId));

  if (!sale) {
    throw AppError(ERROR_CODES.SALE_NOT_FOUND);
  }

  const data = {
    saleId: sale.id,
    price: sale.price,
    quantity: sale.quantity,
    remainingQuantity: sale.remainingQuantity,
    status: sale.status,
    createdAt: sale.createdAt,
    updatedAt: sale.updatedAt,

    photocard: {
      id: sale.photocard.id,
      name: sale.photocard.name,
      imageUrl: sale.photocard.imageUrl,
      description: sale.photocard.description,
      grade: sale.photocard.grade,
      genre: sale.photocard.genre,
    },

    seller: {
      uuid: sale.seller.uuid,
      nickname: sale.seller.nickname,
    },

    desiredGrade: sale.desiredGrade,
    desiredGenre: sale.desiredGenre,
    desiredDescription: sale.desiredDescription,
  };

  return {
    data,
  };
};

const getEditableSale = async (saleId, userUuid) => {
  const sale = await findSaleForUpdateRepository(saleId);

  if (!sale) {
    throw AppError(ERROR_CODES.SALE_NOT_FOUND);
  }

  if (sale.userUuid !== userUuid) {
    throw AppError(ERROR_CODES.NOT_SALE_OWNER);
  }

  if (sale.status !== 'SALE') {
    throw AppError(ERROR_CODES.SALE_NOT_EDITABLE);
  }

  return sale;
};

export const updateSaleService = async (saleId, userUuid, updateData) => {
  const sale = await getEditableSale(saleId, userUuid);

  const allowedFields = [
    'price',
    'quantity',
    'desiredGrade',
    'desiredGenre',
    'desiredDescription',
  ];

  const filteredData = Object.fromEntries(
    Object.entries(updateData).filter(([key]) => allowedFields.includes(key)),
  );

  if (Object.keys(filteredData).length === 0) {
    throw AppError(ERROR_CODES.INVALID_INPUT);
  }

  if (filteredData.price !== undefined && filteredData.price < 0) {
    throw AppError(ERROR_CODES.INVALID_INPUT);
  }

  const data = await prisma.$transaction(async (tx) => {
    if (filteredData.quantity !== undefined) {
      if (filteredData.quantity < 1) {
        throw AppError(ERROR_CODES.INVALID_INPUT);
      }

      // 이미 판매된 수량 계산
      const soldQuantity = sale.quantity - sale.remainingQuantity;

      if (filteredData.quantity < soldQuantity) {
        throw AppError(ERROR_CODES.INVALID_INPUT);
      }

      // 판매 수량 증감 계산
      const quantityDiff = filteredData.quantity - sale.quantity;

      // 이미 판매된 수량은 유지한 채
      // 남은 판매 수량 재계산
      filteredData.remainingQuantity = filteredData.quantity - soldQuantity;

      // 판매 수량 증가
      // 추가 판매할 카드 수만큼 OWNED → ON_SALE 변경
      if (quantityDiff > 0) {
        // 추가 판매에 사용할 OWNED 카드 조회
        const ownedPhotocards = await findOwnedPhotocardsRepository(
          {
            userUuid,
            photocardId: sale.photocardId,
            quantity: quantityDiff,
          },
          tx,
        );

        // 추가 판매 수량보다 보유 카드가 적으면 실패
        if (ownedPhotocards.length < quantityDiff) {
          throw AppError(ERROR_CODES.NOT_ENOUGH_QUANTITY);
        }

        // 추가 판매 카드 상태를 ON_SALE로 변경
        await updateUserPhotocardsStatusRepository(
          {
            userPhotocardIds: ownedPhotocards.map((card) => card.id),
            status: 'ON_SALE',
          },
          tx,
        );
      }

      // 판매 수량 감소
      // 감소한 수량만큼 ON_SALE → OWNED 복구
      if (quantityDiff < 0) {
        // 감소한 판매 수량 절대값 계산
        const restoreQuantity = Math.abs(quantityDiff);

        // 판매 취소할 ON_SALE 카드 조회
        const onSaleCards = await findOnSaleUserPhotocardsRepository(
          {
            ownerUuid: userUuid,
            photocardId: sale.photocardId,
            quantity: restoreQuantity,
          },
          tx,
        );

        if (onSaleCards.length < restoreQuantity) {
          throw AppError(ERROR_CODES.NOT_ENOUGH_QUANTITY);
        }

        // 판매 대상 카드 상태를 OWNED로 복구
        await updateUserPhotocardsStatusRepository(
          {
            userPhotocardIds: onSaleCards.map((card) => card.id),
            status: 'OWNED',
          },
          tx,
        );
      }
    }
    const pendingTrades = await findPendingTradesBySaleIdRepository(saleId, tx);

    for (const trade of pendingTrades) {
      await createNotificationService(
        {
          userUuid: trade.proposerUuid,
          ...NOTIFICATION_PRESET.SALE_UPDATED,
          targetId: saleId,
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
    return updateSaleRepository(saleId, filteredData, tx);
  });
  return {
    data,
  };
};

export const cancelSaleService = async (saleId, userUuid) => {
  const sale = await getEditableSale(saleId, userUuid);

  // 판매글 수정과 포토카드 상태 변경을
  // 하나의 트랜잭션으로 처리
  const data = await prisma.$transaction(
    async (tx) => {
      const canceledSale = await cancelSaleRepository(saleId, tx);

      const onSaleCards = await findOnSaleUserPhotocardsRepository(
        {
          ownerUuid: sale.userUuid,
          photocardId: sale.photocardId,
          quantity: sale.remainingQuantity,
        },
        tx,
      );

      if (onSaleCards.length < sale.remainingQuantity) {
        throw AppError(ERROR_CODES.NOT_ENOUGH_QUANTITY);
      }

      const selectedUserPhotocardIds = onSaleCards.map((card) => card.id);

      await updateUserPhotocardsStatusRepository(
        {
          userPhotocardIds: selectedUserPhotocardIds,
          status: 'OWNED',
        },
        tx,
      );
      const pendingTrades = await findPendingTradesBySaleIdRepository(
        saleId,
        tx,
      );

      const pendingTradeIds = pendingTrades.map((trade) => trade.id);
      const pendingOfferedCardIds = pendingTrades.map(
        (trade) => trade.offeredCardId,
      );

      if (pendingTradeIds.length > 0) {
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

        for (const trade of pendingTrades) {
          await createNotificationService(
            {
              userUuid: trade.proposerUuid,
              ...NOTIFICATION_PRESET.SALE_STOPPED,
              targetId: saleId,
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
      }

      return canceledSale;
    },
    {
      timeout: 10000,
    },
  );

  return {
    data,
  };
};

const getPurchasableSale = async (saleId, userUuid, quantity) => {
  const sale = await findSaleForUpdateRepository(saleId);

  if (!sale) {
    throw AppError(ERROR_CODES.SALE_NOT_FOUND);
  }

  if (sale.userUuid === userUuid) {
    throw AppError(ERROR_CODES.CANNOT_PURCHASE_OWN_SALE);
  }

  if (sale.status !== 'SALE') {
    throw AppError(ERROR_CODES.SALE_NOT_PURCHASABLE);
  }

  if (sale.remainingQuantity < quantity) {
    throw AppError(ERROR_CODES.INSUFFICIENT_SALE_QUANTITY);
  }

  return sale;
};

export const purchaseSaleService = async (saleId, userUuid, quantity) => {
  // 구매 가능 여부 검증
  const sale = await getPurchasableSale(saleId, userUuid, quantity);

  const totalPrice = sale.price * quantity;

  // 구매자 포인트 조회 및 검증
  const buyerPoint = await findUserPointRepository(userUuid);

  if (!buyerPoint || buyerPoint.balance < totalPrice) {
    throw AppError(ERROR_CODES.INSUFFICIENT_POINT);
  }

  const data = await prisma.$transaction(
    async (tx) => {
      // 구매자 기본 정보 조회
      const buyer = await findUserNicknameByUuid(userUuid, tx);

      if (!buyer) {
        throw AppError(ERROR_CODES.USER_NOT_FOUND);
      }

      // 판매글 잔여 수량 조건부 차감
      const decreasedSale = await decreaseSaleRemainingQuantityRepository(
        {
          saleId: sale.id,
          quantity,
        },
        tx,
      );

      if (decreasedSale.count === 0) {
        throw AppError(ERROR_CODES.INSUFFICIENT_SALE_QUANTITY);
      }

      // 구매자 포인트 차감
      await updateUserPointBalanceRepository(
        {
          userUuid,
          amount: -totalPrice,
        },
        tx,
      );

      // 판매자 포인트 적립
      await updateUserPointBalanceRepository(
        {
          userUuid: sale.userUuid,
          amount: totalPrice,
        },
        tx,
      );

      // 구매자 포인트 거래 내역 생성
      await createPointTransactionRepository(
        {
          userUuid,
          amount: -totalPrice,
          type: 'BUY',
        },
        tx,
      );

      // 판매자 포인트 거래 내역 생성
      await createPointTransactionRepository(
        {
          userUuid: sale.userUuid,
          amount: totalPrice,
          type: 'SELL',
        },
        tx,
      );

      // 구매할 ON_SALE 포토카드 조회
      const onSaleCards = await findOnSaleUserPhotocardsRepository(
        {
          ownerUuid: sale.userUuid,
          photocardId: sale.photocardId,
          quantity,
        },
        tx,
      );

      if (onSaleCards.length < quantity) {
        throw AppError(ERROR_CODES.NOT_ENOUGH_QUANTITY);
      }

      // 구매한 포토카드 소유권 이전
      await transferUserPhotocardsRepository(
        {
          userPhotocardIds: onSaleCards.map((card) => card.id),
          ownerUuid: userUuid,
        },
        tx,
      );

      // 구매 이력 생성
      await createSaleLogRepository(
        {
          saleId: sale.id,
          buyerUuid: userUuid,
          sellerUuid: sale.userUuid,
          photocardId: sale.photocardId,
          quantity,
          price: sale.price,
        },
        tx,
      );

      // 구매자 알림 생성
      await createNotificationService(
        {
          userUuid,
          ...NOTIFICATION_PRESET.PURCHASE_COMPLETED,
          targetId: null,
          metadata: {
            actor: {
              uuid: sale.seller.uuid,
              nickname: sale.seller.nickname,
            },
            photocard: {
              id: sale.photocard.id,
              name: sale.photocard.name,
              grade: sale.photocard.grade,
            },
            quantity,
          },
        },
        tx,
      );

      // 판매자 알림 생성
      await createNotificationService(
        {
          userUuid: sale.userUuid,
          ...NOTIFICATION_PRESET.SALE_COMPLETED,
          targetId: null,
          metadata: {
            actor: {
              uuid: buyer.uuid,
              nickname: buyer.nickname,
            },
            photocard: {
              id: sale.photocard.id,
              name: sale.photocard.name,
              grade: sale.photocard.grade,
            },
            quantity,
          },
        },
        tx,
      );

      let updatedSale = await findSaleForUpdateRepository(sale.id, tx);

      // 품절 처리
      if (updatedSale.remainingQuantity === 0) {
        updatedSale = await updateSaleStatusRepository(
          {
            saleId: sale.id,
            status: 'SOLD_OUT',
          },
          tx,
        );

        await cancelPendingTradesBySoldOutService(
          {
            sale,
          },
          tx,
        );

        // 판매자 품절 알림 생성
        await createNotificationService(
          {
            userUuid: sale.userUuid,
            ...NOTIFICATION_PRESET.SOLD_OUT,
            targetId: null,
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

      return {
        sale: {
          id: updatedSale.id,
          remainingQuantity: updatedSale.remainingQuantity,
          status: updatedSale.status,
        },
        purchase: {
          quantity,
          totalPrice,
        },
        photocard: {
          id: sale.photocard.id,
          name: sale.photocard.name,
          grade: sale.photocard.grade,
        },
        buyer: {
          uuid: userUuid,
        },
        seller: {
          uuid: sale.userUuid,
        },
      };
    },
    {
      timeout: 10000,
    },
  );

  return {
    data,
  };
};
