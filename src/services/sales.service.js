import { findSalesList } from '../repositories/sales.repository.js';

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
