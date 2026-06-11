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
} from '../repositories/sales.repository.js';
import { AppError } from '../errors/AppError.js';
import { ERROR_CODES } from '../constants/errorCodes.js';
import prisma from '../lib/prisma.js';

export const getSalesListService = async (query) => {
  const page = Number(query.page) || 1;
  const pageSize = Number(query.pageSize) || 20;

  const { salesList, totalCount } = await findSalesListRepository({
    page,
    pageSize,
    grade: query.grade,
    genre: query.genre,
    keyword: query.keyword,
    status: query.status,
    sort: query.sort,
  });

  const data = salesList.map((sale) => ({
    saleId: sale.id,
    price: sale.price,
    quantity: sale.quantity,
    remainingQuantity: sale.remainingQuantity,
    status: sale.status,
    createdAt: sale.createdAt,
    photocard: sale.photocard,
    seller: sale.seller,
  }));

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    data,
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

  const mySalesList = await findMySalesRepository({
    userUuid: query.userUuid,
    grade: query.grade,
    genre: query.genre,
    keyword: query.keyword,
  });

  const pendingTrades = await findMyPendingTradesRepository({
    userUuid: query.userUuid,
    grade: query.grade,
    genre: query.genre,
    keyword: query.keyword,
  });

  const mySales = mySalesList.map((sale) => ({
    id: sale.id,
    name: sale.photocard.name,
    imageUrl: sale.photocard.imageUrl,
    grade: sale.photocard.grade,
    genre: sale.photocard.genre,
    price: sale.price,
    remainingQuantity: sale.remainingQuantity,
    nickname: sale.seller.nickname,
    displayStatus: sale.status === 'SOLD_OUT' ? 'SOLD_OUT' : 'SALE',
    createdAt: sale.createdAt,
  }));

  const tradePendingCards = pendingTrades.map((trade) => ({
    id: trade.offeredCard.id,
    name: trade.offeredCard.photocard.name,
    imageUrl: trade.offeredCard.photocard.imageUrl,
    grade: trade.offeredCard.photocard.grade,
    genre: trade.offeredCard.photocard.genre,
    price: trade.offeredCard.photocard.price,
    remainingQuantity: 1,
    nickname: trade.offeredCard.owner.nickname,
    displayStatus: 'TRADE_PENDING',
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

  const gradeCounts = {
    common: 0,
    rare: 0,
    super_rare: 0,
    legendary: 0,
  };

  sortedMySales.forEach((card) => {
    gradeCounts[card.grade] += card.remainingQuantity;
  });

  const formattedGradeCounts = Object.entries(gradeCounts).map(
    ([grade, count]) => ({
      grade,
      count,
    }),
  );

  const totalCount = sortedMySales.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  const start = (page - 1) * pageSize;
  const pagedMySales = sortedMySales.slice(start, start + pageSize);

  return {
    data: {
      gradeCounts: formattedGradeCounts,
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

  if (filteredData.quantity !== undefined) {
    if (filteredData.quantity < 1) {
      throw AppError(ERROR_CODES.INVALID_INPUT);
    }

    const soldQuantity = sale.quantity - sale.remainingQuantity;

    if (filteredData.quantity < soldQuantity) {
      throw AppError(ERROR_CODES.INVALID_INPUT);
    }

    filteredData.remainingQuantity = filteredData.quantity - soldQuantity;
  }

  const data = await updateSaleRepository(saleId, filteredData);

  return {
    data,
  };
};

export const cancelSaleService = async (saleId, userUuid) => {
  const sale = await getEditableSale(saleId, userUuid);

  const data = await prisma.$transaction(async (tx) => {
    const canceledSale = await cancelSaleRepository(saleId, tx);

    const onSaleCards = await findOnSaleUserPhotocardsRepository(
      {
        ownerUuid: sale.userUuid,
        photocardId: sale.photocardId,
        quantity: sale.quantity,
      },
      tx,
    );

    if (onSaleCards.length < sale.quantity) {
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

    return canceledSale;
  });

  return {
    data,
  };
};
