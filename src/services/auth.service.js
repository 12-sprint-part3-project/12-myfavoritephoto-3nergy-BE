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

  const accessToken = jwt.sign({ userId: user.uuid }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
  });

  const refreshToken = jwt.sign(
    { userId: user.uuid },
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

// refreshToken 만료일 계산
const getRefreshTokenExpiresAt = () => {
  const expiresAt = new Date();
  //
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRES_DAYS);
  return expiresAt;
};
