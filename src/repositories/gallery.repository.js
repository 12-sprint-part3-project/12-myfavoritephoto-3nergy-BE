import prisma from '../lib/prisma.js';

export const findCardsList = async ({ userUuid }) => {
  return prisma.userPhotocard.findMany({
    where: {
      ownerUuid: userUuid,
      status: 'OWNED',
    },
    orderBy: {
      createdAt: 'desc',
    },
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
  });
};
