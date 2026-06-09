import { sendSuccess } from '../helpers/response.helper.js';
import { getMyPoint } from '../services/point.service.js';

export const getMyPointController = async (req, res, next) => {
  try {
    const userUuid = req.user.userUuid;

    const result = await getMyPoint(userUuid);

    return sendSuccess(res, 200, result);
  } catch (error) {
    next(error);
  }
};
