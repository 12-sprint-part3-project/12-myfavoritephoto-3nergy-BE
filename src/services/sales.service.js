import { findSalesList } from '../repositories/sales.repository.js';

export const getSalesList = async (query) => {
  const saleList = await findSalesList(query);

  return {
    data: {
      items: salesList,
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
