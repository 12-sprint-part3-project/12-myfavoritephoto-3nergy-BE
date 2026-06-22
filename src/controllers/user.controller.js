import { sendSuccess } from '../helpers/response.helper.js';
import { getMyInfoUser } from '../services/user.service.js';

// 내 정보 조회
export const getMyInfo = async (req, res, next) => {
  try {
    const userUuid = req.user.userUuid;

    const user = await getMyInfoUser(userUuid);

    return sendSuccess(res, 200, {
      user,
    });
  } catch (error) {
    next(error);
  }
};
