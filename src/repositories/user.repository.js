import prisma from '../lib/prisma.js';

// uuid로 사용자 조회
export const findUserByUuid = async (uuid) => {
  return prisma.user.findUnique({
    where: {
      uuid,
    },
  });
};
