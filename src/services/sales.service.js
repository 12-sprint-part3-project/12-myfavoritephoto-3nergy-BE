import {
  findSalesList,
  findSaleDetail,
} from '../repositories/sales.repository.js';
import { AppError } from '../errors/AppError.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

export const getSalesList = async (query) => {
  const page = Number(query.page) || 1;
  const pageSize = Number(query.pageSize) || 20;

  const { salesList, totalCount } = await findSalesList({
    page,
    pageSize,
    grade: query.grade,
    genre: query.genre,
    keyword: query.keyword,
    status: query.status,
    sort: query.sort,
  });

  const items = salesList.map((sale) => ({
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
    data: {
      items,
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

export const getSaleDetail = async (saleId) => {
  const sale = await findSaleDetail(Number(saleId));

  if (!sale) {
    throw AppError(ERROR_CODES.SALE_NOT_FOUND);
  }

  return {
    data: {
      sale: {
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
      },
    },
  };
};
