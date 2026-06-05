import { findCardsList } from '../repositories/gallery.repository.js';

export const getCardsList = async (query) => {
  const page = Number(query.page) || 1;
  const pageSize = Number(query.pageSize) || 20;

  const { cardsList } = await findCardsList({
    page,
    pageSize,
    grade: query.grade,
    genre: query.genre,
    keyword: query.keyword,
    sort: query.sort,
  });

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
        description: photocard.description,
        quantity: 0,
        creatorNickname: photocard.creator.nickname,
      });
    }

    cardMap.get(photocard.id).quantity += 1;
  });

  const photocards = Array.from(cardMap.values());

  const gradeCounts = {
    common: 0,
    rare: 0,
    super_rare: 0,
    legendary: 0,
  };

  photocards.forEach((card) => {
    gradeCounts[card.grade] += card.quantity;
  });

  const formattedGradeCounts = Object.entries(gradeCounts).map(
    ([grade, count]) => ({
      grade,
      count,
    }),
  );

  return {
    data: {
      gradeCounts: formattedGradeCounts,
      photocards,
    },
    meta: {
      page,
      pageSize,
      totalCount: photocards.length,
      totalPages: 1,
      hasNextPage: false,
    },
  };
};
