import prisma from '../lib/prisma.js';

export const findReceivedTradesBySaleRepository = async ({
  saleId,
  receiverUuid,
}) => {
  return prisma.trade.findMany({
    where: {
      saleId,
      receiverUuid,
      status: 'PENDING',
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      proposer: {
        select: {
          uuid: true,
          nickname: true,
        },
      },
      offeredCard: {
        include: {
          photocard: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
              grade: true,
              genre: true,
              price: true,
            },
          },
        },
      },
    },
  });
};
