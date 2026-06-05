import prisma from '../lib/prisma.js';

export const findCardsList = async ({
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

    photocard: {
      ...(grade && { grade }),
      ...(genre && { genre }),
      ...(keyword && {
        OR: [
          {
            name: {
              contains: keyword,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: keyword,
              mode: 'insensitive',
            },
          },
        ],
      }),
    },
  };

  const orderByMap = {
    latest: { createdAt: 'desc' },
    oldest: { createdAt: 'asc' },
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
          include: {
            creator: {
              select: {
                nickname: true,
              },
            },
          },
        },
      },
    }),
  ]);

  return {
    cardsList,
    totalCount: cardsList.length,
  };
};
