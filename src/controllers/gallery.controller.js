import { getCardsListService } from '../services/gallery.service.js';
import { sendSuccess } from '../helpers/response.helper.js';

export const getCardsController = async (req, res, next) => {
  try {
    const result = await getCardsListService({
      userUuid: req.user.userUuid,
      ...req.query,
    });

    return sendSuccessWithMeta(res, 200, result.data, result.meta);
  } catch (error) {
    next(error);
  }
};
