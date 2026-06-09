import prisma from '../lib/prisma.js';

export const findMyPointByUserUuid = async (userUuid) => {
  return prisma.user.findUnique({
    where: {
      uuid: userUuid,
    },
    select: {
      nickname: true,
      point: {
        select: {
          balance: true,
        },
      },
    },
  });
};
