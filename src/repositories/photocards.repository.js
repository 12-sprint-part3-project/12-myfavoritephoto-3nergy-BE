import { buildPhotocardFilter } from '../helpers/buildPhotocardFilter.helper.js';
import prisma from '../lib/prisma.js';

export const findCardsListRepository = async ({
  userUuid,
  page,
  pageSize,
  grade,
  genre,
  keyword,
  sort,
}) => {
  const skip = (page - 1) * pageSize;

  const where = {
    ownerUuid: userUuid,
    status: 'OWNED',

    photocard: buildPhotocardFilter({ grade, genre, keyword }),
  };

  const orderByMap = {
    latest: {
      acquiredAt: 'desc',
    },
    oldest: {
      acquiredAt: 'asc',
    },
    price_asc: {
      photocard: {
        price: 'asc',
      },
    },
    price_desc: {
      photocard: {
        price: 'desc',
      },
    },
  };

  const orderBy = orderByMap[sort] || {
    createdAt: 'desc',
  };

  const [cardsList, totalCount] = await Promise.all([
    prisma.userPhotocard.findMany({
      where,
      skip,
      take: pageSize,
      orderBy,
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
            nickname: true,
          },
        },
      },
    }),
    prisma.userPhotocard.count({ where }),
  ]);

  return {
    cardsList,
    totalCount,
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
