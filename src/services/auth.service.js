import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { findUserByEmail } from '../repositories/auth.repository.js';

export const loginUser = async ({ email, password }) => {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
  }

  const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
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
