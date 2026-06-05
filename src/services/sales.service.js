import { findSalesList } from '../repositories/sales.repository.js';

export const getSalesList = async (query) => {
  const salesList = await findSalesList(query);

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

  return {
    data: {
      items,
    },
    meta: {
      page: Number(query.page) || 1,
      pageSize: Number(query.pageSize) || 20,
      totalCount: salesList.length,
      totalPages: 1,
      hasNextPage: false,
    },
  };
};
0;
