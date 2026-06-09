import { getMyInfoUser } from '../services/user.service.js';

// 내 정보 조회
export const getMyInfo = async (req, res, next) => {
  try {
    const userUuid = req.user.userUuid;

    const user = await getMyInfoUser(userUuid);

    return res.status(200).json({
      success: true,
      message: '내 정보 조회에 성공했습니다.',
      data: {
        user,
      },
      error: null,
    });
  } catch (error) {
    next(error);
  }
};
