import prisma from '../lib/prisma.js';

// 이메일로 사용자 조회
export const findUserByEmail = async (email) => {
  return prisma.user.findUnique({
    where: {
      email,
    },
  });
};

// 닉네임으로 사용자 조회
export const findeUserByNickname = async (nickname) => {
  return prisma.user.findUnique({
    where: {
      nickname,
    },
  });
};

// 사용자 생성
export const createUser = async (userData) => {
  return prisma.user.create({
    data: userData,
  });
};

// uuid로 사용자 조회
export const findUserByUuid = async (uuid) => {
  return prisma.user.findUnique({
    where: {
      uuid,
    },
  });
};

// 사용자 Refresh Token 생성
export const createRefreshToken = async (userUuid, token, expiresAt) => {
  return prisma.refreshToken.create({
    data: {
      userUuid,
      token,
      expiresAt,
    },
  });
};

// refreshToken 으로 조회
export const findRefreshToken = async (refreshToken) => {
  return prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: {
      user: true,
    },
  });
};

// 사용자 refresh token 삭제
export const deleteRefreshToken = async (refreshToken) => {
  // delete()는 토큰이 존재하지 않으면 에러가 발생하므로
  // 로그아웃 시 안전하게 처리하기 위해 deleteMany() 사용
  return prisma.refreshToken.deleteMany({
    where: { token: refreshToken },
  });
};

// 만료된 refresh Token 삭제
// lt == Less Than 보다 작다 라는 뜻
export const deleteExpiredRefreshTokens = async () => {
  return prisma.refreshToken.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });
};

// Google ID로 사용자 조회
export const findUserByGoogleId = async (googleId) => {};
