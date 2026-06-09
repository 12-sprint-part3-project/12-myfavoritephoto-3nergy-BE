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
