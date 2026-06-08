import jwt from 'jsonwebtoken';

// Access Token 생성
export const generateAccessToken = (userUuid) => {
  return jwt.sign({ userUuid }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
  });
};

// Refresh Token 생성
export const generateRefreshToken = (userUuid) => {
  return jwt.sign({ userUuid }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  });
};
