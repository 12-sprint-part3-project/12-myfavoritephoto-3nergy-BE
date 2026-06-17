import {
  createPhotocard,
  getCardsListService,
  getOwnedPhotocardQuantityService,
} from '../services/photocards.service.js';
import {
  sendSuccess,
  sendSuccessWithMeta,
} from '../helpers/response.helper.js';

export const getCardsController = async (req, res, next) => {
  try {
    console.time('getMyCardList');

    const result = await getCardsListService({
      userUuid: req.user.userUuid,
      ...req.query,
    });

    console.timeEnd('getMyCardList');

    return sendSuccessWithMeta(res, 200, result.data, result.meta);
  } catch (error) {
    next(error);
  }
};

// 포토카드 생성 컨트롤러
export const createPhotocardController = async (req, res, next) => {
  try {
    const userUuid = req.user.userUuid;

    const result = await createPhotocard(userUuid, req.body);

    return sendSuccess(res, 201, result);
  } catch (error) {
    next(error);
  }
};

// OWNED 상태 포토카드 수량 조회
export const getOwnedPhotocardQuantityController = async (req, res, next) => {
  try {
    const { photocardId } = req.params;
    const { userUuid } = req.user;

    const result = await getOwnedPhotocardQuantityService({
      userUuid,
      photocardId: Number(photocardId),
    });

    return sendSuccess(res, 200, result);
  } catch (error) {
    next(error);
  }
};
