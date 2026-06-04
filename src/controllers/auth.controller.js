import { loginUser, signupUser } from '../services/auth.service.js';

export const signup = async (req, res, next) => {
  try {
    const result = await signupUser(req.body);

    return res.status(201).json({
      success: true,
      message: '회원가입이 완료되었습니다.',
      data: result,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { accessToken, refreshToken, user } = await loginUser(req.body);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite: process.env.COOKIE_SAME_SITE || 'lax',
      maxAge: Number(process.env.COOKIE_MAX_AGE),
    });

    return res.status(200).json({
      accessToken,
      user,
    });
  } catch (error) {
    next(error);
  }
};
