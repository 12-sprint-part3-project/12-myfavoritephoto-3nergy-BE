import { getCardsList } from '../services/gallery.service.js';

export const getCards = async (req, res, next) => {
  try {
    const result = await getCardsList(req.query);

    return res.status(200).json({
      success: true,
      message: '보유 목록 조회에 성공했습니다.',
      data: result.data,
      meta: result.meta,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};
