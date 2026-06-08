import { buildPhotocardFilter } from '../lib/buildPhotocardFilter.js';
import prisma from '../lib/prisma.js';

export const findSalesList = async ({
  page,
  pageSize,
  grade,
  genre,
  keyword,
  status,
  sort,
}) => {
  const skip = (page - 1) * pageSize;

  const where = {
    status: status || {
      in: ['SALE', 'SOLD_OUT'],
    },

    photocard: buildPhotocardFilter({ grade, genre, keyword }),
  };

  const orderByMap = {
    latest: { createdAt: 'desc' },
    oldest: { createdAt: 'asc' },
    price_asc: { price: 'asc' },
    price_desc: { price: 'desc' },
  };

  const orderBy = orderByMap[sort] || {
    createdAt: 'desc',
  };

  const [salesList, totalCount] = await Promise.all([
    prisma.sale.findMany({
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

export const findMySales = async ({
  userUuid,
  grade,
  genre,
  keyword,
  sort,
}) => {
  const where = {
    userUuid,
    photocard: buildPhotocardFilter({ grade, genre, keyword }),
  };

  return prisma.sale.findMany({
    where,
    include: {
      photocard: true,
      seller: {
        select: {
          nickname: true,
        },
      },
    },
  });
};

export const findSaleDetail = async (saleId) => {
  return prisma.sale.findUnique({
    where: {
      id: saleId,
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
  });
};
