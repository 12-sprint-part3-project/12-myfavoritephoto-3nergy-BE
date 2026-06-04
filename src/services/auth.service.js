import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {
  createUser,
  findeUserByNickname,
  findUserByEmail,
} from '../repositories/auth.repository.js';
import { AppError } from '../errors/AppError.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

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

  return {
    accessToken,
    user: {
      uuid: user.uuid,
      email: user.email,
      nickname: user.nickname,
      provider: user.provider,
    },
  };
};

export const signupUser = async ({ email, password, nickname }) => {
  const existingEmailUser = await findUserByEmail(email);

  if (existingEmailUser) {
    throw AppError(ERROR_CODES.EMAIL_ALREADY_EXISTS);
  }

  const existingNicknameUser = await findeUserByNickname(nicknane);

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
