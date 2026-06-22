import { buildPhotocardFilter } from '../helpers/buildPhotocardFilter.helper.js';
import prisma from '../lib/prisma.js';
import {
  cardListInclude,
  createdPhotocardSelect,
} from '../selectors/photocards.selector.js';

export const findCardsListRepository = async ({
  userUuid,
  grade,
  genre,
  keyword,
  excludeOnSale = false,
}) => {
  const where = {
    ownerUuid: userUuid,
    status: 'OWNED',
    photocard: {
      ...buildPhotocardFilter({ grade, genre, keyword }),
      ...(excludeOnSale && {
        sales: {
          none: {
            userUuid,
            status: 'SALE',
          },
        },
      }),
    },
  };

  const cardsList = await prisma.userPhotocard.findMany({
    where,
    include: cardListInclude,
  });

  return {
    cardsList,
  };
};

// 이번 달 사용자가 생성한 포토카드 개수 조회
export const countMonthlyCreatedPhotocards = async ({
  userUuid,
  startOfMonth,
}) => {
  return prisma.photocard.count({
    where: {
      creatorUuid: userUuid,
      createdAt: {
        gte: startOfMonth,
      },
    },
  });
};

// 포토카드 생성
export const createPhotocardRepository = async (
  { userUuid, name, grade, genre, price, totalQuantity, imageUrl, description },
  tx = prisma,
) => {
  return tx.photocard.create({
    data: {
      creatorUuid: userUuid,
      name,
      grade,
      genre,
      price,
      totalQuantity,
      imageUrl,
      description,
    },
    select: createdPhotocardSelect,
  });
};

// 생성자 소유 카드 발급
export const createUserPhotocardsRepository = async (
  userPhotocardsData,
  tx = prisma,
) => {
  return tx.userPhotocard.createMany({
    data: userPhotocardsData,
  });
};

// OWNED 상태 포토카드 수량 조회
export const countOwnedPhotocardRepository = async ({
  userUuid,
  photocardId,
}) => {
  return prisma.userPhotocard.count({
    where: {
      ownerUuid: userUuid,
      photocardId,
      status: 'OWNED',
    },
  });
};
