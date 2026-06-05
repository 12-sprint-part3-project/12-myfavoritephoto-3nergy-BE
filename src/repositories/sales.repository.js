import prisma from '../lib/prisma.js';

export const findSalesList = async ({ page, pageSize, grade }) => {
  const skip = (page - 1) * pageSize;

  const where = {
    status: {
      in: ['SALE', 'SOLD_OUT'],
    },
    ...(grade && {
      photocard: {
        grade,
      },
    }),
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
