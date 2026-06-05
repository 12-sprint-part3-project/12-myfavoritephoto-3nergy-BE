import prisma from '../lib/prisma.js';

export const findSalesList = async () => {
  return prisma.sale.findMany({
    where: {
      status: {
        in: ['SALE', 'SOLD_OUT'],
      },
    },
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
  });
};
