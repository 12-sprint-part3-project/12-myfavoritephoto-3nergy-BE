import prisma from '../lib/prisma.js';
import { ERROR_CODES } from '../constants/errorCodes.js';
import { AppError } from '../errors/AppError.js';
import {
  createEventPointTransaction,
  findMyPointByUserUuid,
  findRewardStateByUserUuid,
  increaseUserPoint,
  upsertRewardState,
} from '../repositories/point.repository.js';

const EVENT_COOLDOWN_MS = 60 * 60 * 1000; // 1시간
const MIN_EVENT_POINT = 10;
const MAX_EVENT_POINT = 50;

export const getMyPoint = async (userUuid) => {
  const userPoint = await findMyPointByUserUuid(userUuid);

  if (!userPoint) {
    throw AppError(ERROR_CODES.USER_NOT_FOUND);
  }

  return {
    nickname: userPoint.nickname,
    point: userPoint.point?.balance ?? 0,
  };
};

// 이벤트 지급 포인트를 랜덤으로 결정한다.
const getRandomEventPoint = () => {
  return (
    Math.floor(Math.random() * (MAX_EVENT_POINT - MIN_EVENT_POINT + 1)) +
    MIN_EVENT_POINT
  );
};

// 마지막 참여 시간 기준으로 다음 참여 가능 시간을 계산한다.
const getNextAvailableAt = (lastDrawAt) => {
  return new Date(lastDrawAt.getTime() + EVENT_COOLDOWN_MS);
};

// 이벤트 참여 가능 여부를 검증한다.
const validateEventAvailability = (rewardState, now) => {
  if (!rewardState) return;

  const nextAvailableAt = getNextAvailableAt(rewardState.lastDrawAt);

  if (now < nextAvailableAt) {
    throw AppError({ ...ERROR_CODES.EVENT_NOT_AVAILABLE, nextAvailableAt });
  }
};

// 이벤트 포인트 지급 전체 흐름을 처리한다.
export const rewardEventPointUser = async (userUuid) => {
  const now = new Date();

  // 이벤트 지급 포인트를 랜덤으로 결정한다.
  const point = getRandomEventPoint();

  // 참여 상태 조회, 참여 가능 여부 검증, 포인트 지급을 하나의 트랜잭션으로 처리한다.
  const { balance } = await prisma.$transaction(async (tx) => {
    // 마지막 이벤트 참여 상태 조회
    const rewardState = await findRewardStateByUserUuid(userUuid, tx);

    // 1시간 참여 제한 검증
    validateEventAvailability(rewardState, now);

    // 유저 포인트 증가
    const updatedUserPoint = await increaseUserPoint({
      userUuid,
      point,
      tx,
    });

    // 이벤트 포인트 지급 내역 생성
    await createEventPointTransaction({
      userUuid,
      point,
      tx,
    });

    // 마지막 이벤트 참여 시간 생성 또는 갱신
    await upsertRewardState({
      userUuid,
      now,
      tx,
    });

    return {
      balance: updatedUserPoint.balance,
    };
  });

  const nextAvailableAt = getNextAvailableAt(now);

  return {
    point,
    balance,
    nextAvailableAt,
  };
};
