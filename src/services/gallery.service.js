import { findCardsList } from '../repositories/gallery.repository.js';

export const getCardsList = async (query) => {
  const cardsList = await findCardsList(query);

  const photocards = cardsList.map((card) => ({
    id: card.photocard.id,
    name: card.photocard.name,
    imageUrl: card.photocard.imageUrl,
    grade: card.photocard.grade,
    genre: card.photocard.genre,
    price: card.photocard.price,
    quantity: 1,
    creatorNickname: card.photocard.creator.nickname,
  }));

  return {
    data: {
      photocards,
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
