import { sendSuccess } from '../helpers/response.helper.js';
import { getMyPoint, rewardEventPointUser } from '../services/point.service.js';

export const getMyPointController = async (req, res, next) => {
  try {
    const userUuid = req.user.userUuid;

    const result = await getMyPoint(userUuid);

    return sendSuccess(res, 200, result);
  } catch (error) {
    next(error);
  }
};

// 이벤트 포인트 지급 컨트롤러
export const rewardEventPointController = async (req, res, next) => {
  try {
    const userUuid = req.user.userUuid;

    const result = await rewardEventPointUser(userUuid);

    return sendSuccess(res, 200, result);
  } catch (error) {
    next(error);
  }
};
