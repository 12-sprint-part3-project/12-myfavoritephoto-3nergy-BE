import prisma from '../lib/prisma.js';

export const findSalesList = async ({
  page,
  pageSize,
  grade,
  genre,
  keyword,
  status,
}) => {
  const skip = (page - 1) * pageSize;

  const where = {
    status: status || {
      in: ['SALE', 'SOLD_OUT'],
    },

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

  const [salesList, totalCount] = await Promise.all([
    prisma.sale.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        photocard: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            grade: true,
            genre: true,
            description: true,
          },
        },

        seller: {
          select: {
            uuid: true,
            nickname: true,
          },
        },
      },
    }),
    prisma.sale.count({ where }),
  ]);

  return {
    salesList,
    totalCount,
  };
};
