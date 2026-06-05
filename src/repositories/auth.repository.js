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
  return prisma.refreshToken.findFirst({
    where: { token: refreshToken },
    include: {
      user: true,
    },
  });
};

// 사용자 refresh token 삭제
export const deleteRefreshToken = async (refreshToken) => {
  return prisma.refreshToken.deleteMany({
    where: { token: refreshToken },
  });
};

// 사용자 Refresh Token 갱신
export const updateRefreshToken = async (uuid, refreshToken) => {
  return prisma.user.update({});
};

// Google ID로 사용자 조회
export const findUserByGoogleId = async (googleId) => {};
