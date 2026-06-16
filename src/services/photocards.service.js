import { ERROR_CODES } from '../constants/errorCodes.js';
import { AppError } from '../errors/AppError.js';
import {
  countMonthlyCreatedPhotocards,
  createPhotocardWithUserCards,
  findCardsListRepository,
} from '../repositories/photocards.repository.js';
import { getStartOfMonthKST } from '../helpers/date.helper.js';
import {
  buildFilterCounts,
  GENRE_VALUES,
  GRADE_VALUES,
} from '../helpers/buildFilterCounts.helper.js';

const MONTHLY_PHOTOCARD_CREATION_LIMIT = 3000; // 월 3장 제한

export const getCardsListService = async (query) => {
  const page = Number(query.page) || 1;
  const pageSize = Number(query.pageSize) || 20;

  const { cardsList } = await findCardsListRepository({
    userUuid: query.userUuid,
    grade: query.grade,
    genre: query.genre,
    keyword: query.keyword,
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
        acquiredAt: card.acquiredAt,
      });
    }

    const mappedCard = cardMap.get(photocard.id);

    mappedCard.quantity += 1;
    mappedCard.userPhotocardIds.push(card.id);

    if (new Date(card.acquiredAt) > new Date(mappedCard.acquiredAt)) {
      mappedCard.acquiredAt = card.acquiredAt;
    }
  });

  const photocards = Array.from(cardMap.values());

  const gradeCounts = buildFilterCounts({
    items: photocards,
    field: 'grade',
    values: GRADE_VALUES,
    responseKey: 'grade',
    countField: 'quantity',
  });

  const genreCounts = buildFilterCounts({
    items: photocards,
    field: 'genre',
    values: GENRE_VALUES,
    responseKey: 'genre',
    countField: 'quantity',
  });

  const sortMap = {
    latest: (a, b) => new Date(b.acquiredAt) - new Date(a.acquiredAt),
    oldest: (a, b) => new Date(a.acquiredAt) - new Date(b.acquiredAt),
    price_asc: (a, b) => a.price - b.price,
    price_desc: (a, b) => b.price - a.price,
  };

  const sortFunction = sortMap[query.sort] || sortMap.latest;
  const sortedPhotocards = [...photocards].sort(sortFunction);

  const totalCount = sortedPhotocards.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  const start = (page - 1) * pageSize;
  const pagedPhotocards = sortedPhotocards.slice(start, start + pageSize);

  return {
    data: {
      gradeCounts,
      genreCounts,
      photocards: pagedPhotocards,
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
