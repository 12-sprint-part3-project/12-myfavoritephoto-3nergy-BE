import { loginUser } from '../services/auth.service.js';

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
