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
export const findRewardStateByUserUuid = async (userUuid) => {
  return prisma.rewardState.findUnique({
    where: {
      userUuid,
    },
  });
};

// 이벤트 포인트 지급처리
// 1. 포인트 잔액 증가
// 2. 포인트 내역 생성
// 3. 마지막 이벤트 참여 시간 갱신
export const rewardEventPointTransaction = async ({ userUuid, point, now }) => {
  return prisma.$transaction(async (tx) => {
    const updatedUserPoint = await tx.userPoint.update({
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

    await tx.pointTransaction.create({
      data: {
        userUuid,
        amount: point,
        type: 'EVENT',
      },
    });

    await tx.rewardState.upsert({
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

    return {
      balance: updatedUserPoint.balance,
    };
  });
};
