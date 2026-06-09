import { buildPhotocardFilter } from '../helpers/buildPhotocardFilter.helper.js';
import prisma from '../lib/prisma.js';

export const findSalesListRepository = async ({
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

export const createSaleRepository = async ({
  userUuid,
  photocardId,
  price,
  quantity,
  remainingQuantity,
  status,
  desiredGrade,
  desiredGenre,
  desiredDescription,
}) => {
  return prisma.sale.create({
    data: {
      userUuid,
      photocardId,
      price,
      quantity,
      remainingQuantity,
      status,
      desiredGrade,
      desiredGenre,
      desiredDescription,
    },
  });
};

export const findOwnedPhotocardsRepository = async ({
  userUuid,
  photocardId,
}) => {
  return prisma.userPhotocard.findMany({
    where: {
      ownerUuid: userUuid,
      photocardId,
      status: 'OWNED',
    },
    select: {
      id: true,
      photocardId: true,
    },
  });
};

export const updateUserPhotocardsStatusRepository = async ({
  userPhotocardIds,
  status,
}) => {
  return prisma.userPhotocard.updateMany({
    where: {
      id: {
        in: userPhotocardIds,
      },
    },
    data: {
      status,
    },
  });
};

export const findMySalesRepository = async ({
  userUuid,
  grade,
  genre,
  keyword,
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

export const findMyPendingTradesRepository = async ({
  userUuid,
  grade,
  genre,
  keyword,
}) => {
  return prisma.trade.findMany({
    where: {
      proposerUuid: userUuid,
      status: 'PENDING',
      offeredCard: {
        photocard: buildPhotocardFilter({ grade, genre, keyword }),
      },
    },
    include: {
      offeredCard: {
        include: {
          photocard: true,
          owner: {
            select: {
              nickname: true,
            },
          },
        },
      },
    },
  });
};

export const findSaleDetailRepository = async (saleId) => {
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
