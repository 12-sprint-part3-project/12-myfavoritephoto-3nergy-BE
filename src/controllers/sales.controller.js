export const getSalesList = async (req, res) => {
  res.status(200).json({
    success: true,
    message: '판매 포토카드 목록 조회 API입니다.',
    data: [],
    error: null,
  });
};
