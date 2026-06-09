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

export const createSaleRepository = async (data, tx = prisma) => {
  return tx.sale.create({
    data,
  });
};

export const findOwnedPhotocardsRepository = async (
  { userUuid, photocardId },
  tx = prisma,
) => {
  return tx.userPhotocard.findMany({
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

export const updateUserPhotocardsStatusRepository = async (
  { userPhotocardIds, status },
  tx = prisma,
) => {
  return tx.userPhotocard.updateMany({
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

export const findSaleForUpdateRepository = async (saleId) => {
  return prisma.sale.findUnique({
    where: {
      id: saleId,
    },
    select: {
      id: true,
      userUuid: true,
      status: true,
      quantity: true,
      remainingQuantity: true,
    },
  });
};

export const updateSaleRepository = async (saleId, data) => {
  return prisma.sale.update({
    where: {
      id: saleId,
    },
    data,
    select: {
      id: true,
      price: true,
      quantity: true,
      remainingQuantity: true,
      status: true,
      desiredGrade: true,
      desiredGenre: true,
      desiredDescription: true,
      updateAt: true,
    },
  });
};
