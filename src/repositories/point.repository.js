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

// 유저의 이벤트 참여 상태 조회
export const findRewardStateByUserUuid = async (userUuid, tx = prisma) => {
  return tx.rewardState.findUnique({
    where: {
      userUuid,
    },
  });
};

// 유저의 포인트를 증가시킨다.
export const increaseUserPoint = async ({ userUuid, point, tx = prisma }) => {
  return tx.userPoint.update({
    where: {
      userUuid,
    },
    data: {
      balance: {
        increment: point,
      },
    },
    select: {
      balance: true,
    },
  });
};

// 이벤트 포인트 지급 내역을 생성한다.
export const createEventPointTransaction = async ({
  userUuid,
  point,
  tx = prisma,
}) => {
  return tx.pointTransaction.create({
    data: {
      userUuid,
      amount: point,
      type: 'EVENT',
    },
  });
};

// 마지막 이벤트 참여 시간을 생성 또는 갱신한다.
export const upsertRewardState = async ({ userUuid, now, tx = prisma }) => {
  return tx.rewardState.upsert({
    where: {
      userUuid,
    },
    update: {
      lastDrawAt: now,
    },
    create: {
      userUuid,
      lastDrawAt: now,
    },
  });
};
