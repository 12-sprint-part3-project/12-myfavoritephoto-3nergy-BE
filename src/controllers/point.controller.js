import { getMyPoint } from '../services/point.service.js';

export const getMyPointController = async (req, res, next) => {
  try {
    const userUuid = req.user.userUuid;

    const result = await getMyPoint(userUuid);

    return res.status(200).json({
      success: true,
      message: '내 포인트를 조회했습니다.',
      data: result,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};
