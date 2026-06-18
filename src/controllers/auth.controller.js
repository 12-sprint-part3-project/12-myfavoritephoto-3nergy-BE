import {
  getClearRefreshTokenCookieOptions,
  getRefreshTokenCookieOptions,
} from '../helpers/cookie.helper.js';
import { sendSuccess } from '../helpers/response.helper.js';
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

    return sendSuccess(res, 201, result);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { accessToken, refreshToken, user } = await loginUser(req.body);

    res.cookie('refreshToken', refreshToken, getRefreshTokenCookieOptions());

    return sendSuccess(res, 200, {
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

    res.clearCookie('refreshToken', getClearRefreshTokenCookieOptions());

    return sendSuccess(res, 200, null);
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

    res.cookie('refreshToken', newRefreshToken, getRefreshTokenCookieOptions());

    return sendSuccess(res, 200, {
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

    return sendSuccess(res, 200, {
      accessToken,
      refreshToken,
      user,
    });
  } catch (error) {
    next(error);
  }
};
