import { getCardsList } from '../services/gallery.service.js';

export const getCards = async (req, res, next) => {
  try {
    const result = await getCardsList({
      userUuid: req.user.userUuid,
      ...req.query,
    });
    console.log('req.user:', req.user);
    return res.status(200).json({
      success: true,
      message: '내 포토카드 목록을 조회했습니다.',
      data: result.data,
      meta: result.meta,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};
