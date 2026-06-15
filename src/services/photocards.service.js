import { ERROR_CODES } from '../constants/errorCodes.js';
import { AppError } from '../errors/AppError.js';
import {
  countMonthlyCreatedPhotocards,
  createPhotocardWithUserCards,
  findCardsListRepository,
} from '../repositories/photocards.repository.js';
import { getStartOfMonthKST } from '../helpers/date.helper.js';

const MONTHLY_PHOTOCARD_CREATION_LIMIT = 3; // 월 3장 제한

export const getCardsListService = async (query) => {
  const page = Number(query.page) || 1;
  const pageSize = Number(query.pageSize) || 20;

  const { cardsList, totalCount } = await findCardsListRepository({
    userUuid: query.userUuid,
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
        userPhotocardIds: [],
        name: photocard.name,
        imageUrl: photocard.imageUrl,
        grade: photocard.grade,
        genre: photocard.genre,
        price: photocard.price,
        description: photocard.description,
        quantity: 0,
        ownerNickname: card.owner.nickname,
      });
    }

    const mappedCard = cardMap.get(photocard.id);

    mappedCard.quantity += 1;
    mappedCard.userPhotocardIds.push(card.id);
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

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    data: {
      gradeCounts: formattedGradeCounts,
      photocards,
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

// 포토카드 생성
export const createPhotocard = async (userUuid, body) => {
  const now = new Date();

  //  매월 1일
  const startOfMonth = getStartOfMonthKST();

  const createdCount = await countMonthlyCreatedPhotocards({
    userUuid,
    startOfMonth,
  });

  if (createdCount >= MONTHLY_PHOTOCARD_CREATION_LIMIT) {
    throw AppError(ERROR_CODES.PHOTOCARD_CREATION_LIMIT_EXCEEDED);
  }

  return createPhotocardWithUserCards({
    userUuid,
    ...body,
  });
};
