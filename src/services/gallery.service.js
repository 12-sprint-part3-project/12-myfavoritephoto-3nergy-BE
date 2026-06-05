import { findCardsList } from '../repositories/gallery.repository.js';

export const getCardsList = async (query) => {
  const cardsList = await findCardsList(query);

  const items = cardsList.map((sale) => ({
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
      totalCount: cardsList.length,
      totalPages: 1,
      hasNextPage: false,
    },
  };
};
