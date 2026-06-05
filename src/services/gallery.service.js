import { findCardsList } from '../repositories/gallery.repository.js';

export const getCardsList = async (query) => {
  const cardsList = await findCardsList(query);

  const cardMap = new Map();

  cardsList.forEach((card) => {
    const photocard = card.photocard;

    if (!cardMap.has(photocard.id)) {
      cardMap.set(photocard.id, {
        id: photocard.id,
        name: photocard.name,
        imageUrl: photocard.imageUrl,
        grade: photocard.grade,
        genre: photocard.genre,
        price: photocard.price,
        quantity: 0,
        creatorNickname: photocard.creator.nickname,
      });
    }

    cardMap.get(photocard.id).quantity += 1;
  });

  const photocards = Array.from(cardMap.values());

  return {
    data: {
      photocards,
    },
    meta: {
      page: Number(query.page) || 1,
      pageSize: Number(query.pageSize) || 20,
      totalCount: photocards.length,
      totalPages: 1,
      hasNextPage: false,
    },
  };
};
