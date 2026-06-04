import { loginUser, signupUser } from '../services/auth.service.js';

export const login = async (req, res, next) => {
  try {
    const result = await loginUser(req.body);

    return res.status(200).json({
      success: true,
      message: '로그인에 성공했습니다.',
      data: result,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

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
