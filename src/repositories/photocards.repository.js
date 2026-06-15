import { buildPhotocardFilter } from '../helpers/buildPhotocardFilter.helper.js';
import prisma from '../lib/prisma.js';

export const findCardsListRepository = async ({
  userUuid,
  grade,
  genre,
  keyword,
}) => {
  const where = {
    ownerUuid: userUuid,
    status: 'OWNED',

    photocard: buildPhotocardFilter({ grade, genre, keyword }),
  };

  const cardsList = await prisma.userPhotocard.findMany({
    where,

    include: {
      photocard: {
        select: {
          id: true,
          name: true,
          imageUrl: true,
          grade: true,
          genre: true,
          price: true,
          description: true,
        },
      },

      owner: {
        select: {
          uuid: true,
          nickname: true,
        },
      },
    },
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

// 포토카드 생성 및 생성자 소유 카드 발급
export const createPhotocardWithUserCards = async ({
  userUuid,
  name,
  grade,
  genre,
  price,
  totalQuantity,
  imageUrl,
  description,
}) => {
  return prisma.$transaction(async (tx) => {
    const photocard = await tx.photocard.create({
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
      select: {
        id: true,
        name: true,
        grade: true,
        genre: true,
        price: true,
        totalQuantity: true,
        imageUrl: true,
        description: true,
        createdAt: true,
      },
    });

    const userPhotocardsData = Array.from(
      {
        length: totalQuantity,
      },
      (_, index) => ({
        photocardId: photocard.id,
        ownerUuid: userUuid,
        serialNumber: index + 1,
        status: 'OWNED',
        acquiredAt: new Date(),
      }),
    );

    const issuedCards = await tx.userPhotocard.createMany({
      data: userPhotocardsData,
    });

    return {
      photocard,
      issuedQuantity: issuedCards.count,
    };
  });
};
