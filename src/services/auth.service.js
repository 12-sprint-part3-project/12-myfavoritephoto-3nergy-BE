import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {
  createUser,
  findeUserByNickname,
  findUserByEmail,
  createRefreshToken,
  findRefreshToken,
  deleteRefreshToken,
} from '../repositories/auth.repository.js';
import { AppError } from '../errors/AppError.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

const REFRESH_TOKEN_EXPIRES_DAYS = 7;

export const signupUser = async ({ email, password, nickname }) => {
  const existingEmailUser = await findUserByEmail(email);

  if (existingEmailUser) {
    throw AppError(ERROR_CODES.EMAIL_ALREADY_EXISTS);
  }

  const existingNicknameUser = await findeUserByNickname(nickname);

  if (existingNicknameUser) {
    throw AppError(ERROR_CODES.NICKNAME_ALREADY_EXISTS);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await createUser({
    email,
    nickname,
    passwordHash,
    provider: 'LOCAL',
  });

  return {
    user: {
      uuid: user.uuid,
      email: user.email,
      nickname: user.nickname,
      provider: user.provider,
    },
  };
};

export const loginUser = async ({ email, password }) => {
  const user = await findUserByEmail(email);

  if (!user) {
    throw AppError(ERROR_CODES.INVALID_CREDENTIALS);
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    throw AppError(ERROR_CODES.INVALID_CREDENTIALS);
  }

  const accessToken = jwt.sign(
    { userUuid: user.uuid },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
    },
  );

  const refreshToken = jwt.sign(
    { userUuid: user.uuid },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    },
  );

  await createRefreshToken(user.uuid, refreshToken, getRefreshTokenExpiresAt());

  return {
    accessToken,
    refreshToken,
    user: {
      uuid: user.uuid,
      email: user.email,
      nickname: user.nickname,
      provider: user.provider,
    },
  };
};

// Refresh Token을 검증하고 새로운 Access Token, Refresh Token을 재발급
export const refreshTokenUser = async (refreshToken) => {
  // Refresh Token 자체가 없는 경우
  if (!refreshToken) {
    throw AppError(ERROR_CODES.INVALID_REFRESH_TOKEN);
  }

  let payload;

  try {
    // JWT 서명, 만료시간 검증
    // 검증에 성공하면 payload 추출
    payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // 정상적으로 발급된 Refresh Token인지 추가 검증
    if (!payload.userUuid) {
      throw AppError(ERROR_CODES.INVALID_REFRESH_TOKEN);
    }
  } catch (error) {
    // Refresh Token 만료
    if (error.name === 'TokenExpiredError') {
      throw AppError(ERROR_CODES.REFRESH_TOKEN_EXPIRED);
    }

    // 위조되었거나 형식이 잘못된 토큰
    throw AppError(ERROR_CODES.INVALID_REFRESH_TOKEN);
  }

  // DB에 실제 저장되어 있는 Refresh Token인지 확인
  const savedRefreshToken = await findRefreshToken(refreshToken);

  if (!savedRefreshToken) {
    throw AppError(ERROR_CODES.INVALID_REFRESH_TOKEN);
  }

  // DB 기준 만료일 검증
  // JWT 만료와 별개로 DB에서도 한번 더 확인
  if (savedRefreshToken.expiresAt < new Date()) {
    // 만료된 토큰 정리
    await deleteRefreshToken(refreshToken);

    throw AppError(ERROR_CODES.REFRESH_TOKEN_EXPIRED);
  }

  // Refresh Token Rotation
  // 기존 Refresh Token은 폐기
  await deleteRefreshToken(refreshToken);

  // 새로운 Access Token 발급
  const accessToken = jwt.sign(
    { userUuid: payload.userUuid },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
    },
  );

  // 새로운 Refresh Token 발급
  const newRefreshToken = jwt.sign(
    { userUuid: payload.userUuid },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    },
  );

  // 새 Refresh Token을 DB에 저장
  await createRefreshToken(
    payload.userUuid,
    newRefreshToken,
    getRefreshTokenExpiresAt(),
  );

  // 클라이언트에 새 토큰 반환
  return {
    accessToken,
    refreshToken: newRefreshToken,
  };
};

// refreshToken 만료일 계산
const getRefreshTokenExpiresAt = () => {
  const expiresAt = new Date();
  //
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRES_DAYS);
  return expiresAt;
};
