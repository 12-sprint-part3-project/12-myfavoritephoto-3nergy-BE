import bcrypt from 'bcrypt';
import prisma from '../lib/prisma.js';
import jwt from 'jsonwebtoken';
import {
  createUserRepository,
  createUserPointRepository,
  createRewardStateRepository,
  findUserByNickname,
  findUserByEmail,
  createRefreshToken,
  findRefreshToken,
  deleteRefreshToken,
  findUserByGoogleId,
} from '../repositories/auth.repository.js';
import { AppError } from '../errors/AppError.js';
import { ERROR_CODES } from '../constants/errorCodes.js';
import axios from 'axios';
import {
  generateAccessToken,
  generateRefreshToken,
} from '../helpers/jwt.helper.js';

export const signupUser = async ({ email, password, nickname }) => {
  const existingEmailUser = await findUserByEmail(email);

  if (existingEmailUser) {
    throw AppError(ERROR_CODES.EMAIL_ALREADY_EXISTS);
  }

  const existingNicknameUser = await findUserByNickname(nickname);

  if (existingNicknameUser) {
    throw AppError(ERROR_CODES.NICKNAME_ALREADY_EXISTS);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.$transaction(async (tx) => {
    const createdUser = await createUserRepository(
      {
        email,
        nickname,
        passwordHash,
        provider: 'LOCAL',
      },
      tx,
    );

    await createUserPointRepository(
      {
        userUuid: createdUser.uuid,
        balance: 5000,
      },
      tx,
    );

    await createRewardStateRepository(
      {
        userUuid: createdUser.uuid,
        lastDrawAt: new Date(),
      },
      tx,
    );

    return createdUser;
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

  const accessToken = generateAccessToken(user.uuid);

  const refreshToken = generateRefreshToken(user.uuid);

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

export const logoutUser = async (refreshToken) => {
  if (!refreshToken) {
    return;
  }

  await deleteRefreshToken(refreshToken);
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
  const accessToken = generateAccessToken(payload.userUuid);

  // 새로운 Refresh Token 발급
  const newRefreshToken = generateRefreshToken(payload.userUuid);

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

  const refreshTokenDays = parseInt(
    process.env.JWT_REFRESH_EXPIRES_IN.replace('d', ''),
    10,
  );

  expiresAt.setDate(expiresAt.getDate() + refreshTokenDays);
  return expiresAt;
};

//  Google 로그인  URL 생성
export const getGoogleLoginUrl = () => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_REDIRECT_URI) {
    throw AppError(ERROR_CODES.GOOGLE_CONFIG_MISSING);
  }

  const baseUrl = 'https://accounts.google.com/o/oauth2/v2/auth';

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: 'openid email profile',
    prompt: 'select_account',
  });

  return `${baseUrl}?${params.toString()}`;
};

// Google OAuth 인증 완료 후 전달받은 Authorization Code를 이용해
// Google Access Token을 발급받고 사용자 정보를 조회
export const googleCallback = async (code) => {
  // Google Callback에 code가 없는경우
  if (!code) {
    throw AppError(ERROR_CODES.INVALID_GOOGLE_CODE);
  }

  let googleUser;

  // Google 사용자 정보 조회
  try {
    // 1. code로 Google Access Token 요청
    const tokenResponse = await axios.post(
      'https://oauth2.googleapis.com/token',
      new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    );

    const googleAccessToken = tokenResponse.data.access_token;
    // 2. Google 사용자 정보 요청
    const userInfoResponse = await axios.get(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      {
        headers: {
          Authorization: `Bearer ${googleAccessToken}`,
        },
      },
    );

    googleUser = userInfoResponse.data;
  } catch (error) {
    throw AppError(ERROR_CODES.GOOGLE_AUTH_FAILED);
  }

  // 3. Google ID로 기존 회원 조회
  let user = await findUserByGoogleId(googleUser.sub);

  // 4. 기존 회원이 없으면 자동 회원가입 + 기본 포인트 + RewardState 생성
  if (!user) {
    const existingEmailUser = await findUserByEmail(googleUser.email);

    if (existingEmailUser && existingEmailUser.provider !== 'GOOGLE') {
      throw AppError(ERROR_CODES.EMAIL_ALREADY_EXISTS);
    }

    user = await prisma.$transaction(async (tx) => {
      const createdUser = await createUserRepository(
        {
          email: googleUser.email,
          nickname: `${googleUser.name}_${googleUser.sub.slice(-6)}`,
          provider: 'GOOGLE',
          providerId: googleUser.sub,
        },
        tx,
      );

      await createUserPointRepository(
        {
          userUuid: createdUser.uuid,
          balance: 5000,
        },
        tx,
      );

      await createRewardStateRepository(
        {
          userUuid: createdUser.uuid,
          lastDrawAt: new Date(),
        },
        tx,
      );

      return createdUser;
    });
  }

  // 5. Access Token 발급
  const accessToken = generateAccessToken(user.uuid);

  // 6. Refresh Token 발급
  const refreshToken = generateRefreshToken(user.uuid);

  // 7 . Refresh Token DB 저장
  await createRefreshToken(user.uuid, refreshToken, getRefreshTokenExpiresAt());

  // 8. 로그인 결과 반환
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
