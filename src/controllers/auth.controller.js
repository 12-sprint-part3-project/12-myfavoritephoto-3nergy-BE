import {
  loginUser,
  logoutUser,
  refreshTokenUser,
  signupUser,
  getGoogleLoginUrl,
  googleCallback,
} from '../services/auth.service.js';

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

export const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    await logoutUser(refreshToken);

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite: process.env.COOKIE_SAME_SITE || 'lax',
    });

    return res.status(200).json({
      message: '로그아웃 되었습니다.',
    });
  } catch (error) {
    next(error);
  }
};

export const refreshAccessToken = async (req, res, next) => {
  try {
    const refreshTokenValue = req.cookies?.refreshToken;

    // 기존 Refresh Token 검증 후 새 Access Token, Refresh Token 발급
    const { accessToken, refreshToken: newRefreshToken } =
      await refreshTokenUser(refreshTokenValue);

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite: process.env.COOKIE_SAME_SITE || 'lax',
      maxAge: Number(process.env.COOKIE_MAX_AGE),
    });

    return res.status(200).json({
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

// Google 로그인 페이지로 리다이렉트
export const googleLogin = (req, res, next) => {
  try {
    const redirectUrl = getGoogleLoginUrl();

    return res.redirect(redirectUrl);
  } catch (error) {
    next(error);
  }
};

// Google 로그인 완료 후 callback 처리
export const googleCallbackLogin = async (req, res, next) => {
  try {
    const { code } = req.query;

    const { accessToken, refreshToken, user } = await googleCallback(code);

    // Refresh Token 을 HttpOnly Cookie 에 저장한다
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
