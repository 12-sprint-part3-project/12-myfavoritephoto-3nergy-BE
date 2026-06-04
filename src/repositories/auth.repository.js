import prisma from '../lib/prisma.js';

// 이메일로 사용자 조회
export const findUserByEmail = async (email) => {
  return prisma.user.findUnique({
    where: {
      email,
    },
  });
};

// 사용자 생성
export const createUser = async (userData) => {
  return prisma.user.create({
    data: userData,
  });
};

// ID로 사용자 조회
export const findUserById = async (id) => {};

// 사용자 Refresh Token 갱신
export const updateRefreshToken = async (userId, refreshToken) => {};

// Google ID로 사용자 조회
export const findUserByGoogleId = async (googleId) => {};
