import prisma from '../lib/prisma.js';

// uuid로 사용자 조회
export const findUserByUuid = async (uuid) => {
  return prisma.user.findUnique({
    where: {
      uuid,
    },
  });
};

// uuid로 사용자 기본 정보 조회 (알림용)
export const findUserNicknameByUuid = async (userUuid, tx = prisma) => {
  return tx.user.findUnique({
    where: {
      uuid: userUuid,
    },
    select: {
      uuid: true,
      nickname: true,
    },
  });
};
