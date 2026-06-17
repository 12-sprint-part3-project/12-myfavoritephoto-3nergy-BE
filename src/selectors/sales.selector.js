/*********************************
 * 공통 포토카드 및 판매자 정보
 *********************************/

export const photocardSummarySelect = {
  id: true,
  name: true,
  imageUrl: true,
  grade: true,
  genre: true,
  description: true,
};

export const photocardForSaleUpdateSelect = {
  id: true,
  name: true,
  grade: true,
};

export const photocardForSaleCountsSelect = {
  grade: true,
  genre: true,
};

export const sellerSummarySelect = {
  uuid: true,
  nickname: true,
};

export const sellerNicknameSelect = {
  nickname: true,
};

/*********************************
 * 판매 목록 및 상세 조회
 *********************************/

export const saleListInclude = {
  photocard: {
    select: photocardSummarySelect,
  },
  seller: {
    select: sellerSummarySelect,
  },
};

export const saleCountsSelect = {
  status: true,
  photocard: {
    select: photocardForSaleCountsSelect,
  },
};

export const mySaleListInclude = {
  photocard: {
    select: photocardSummarySelect,
  },
  seller: {
    select: sellerNicknameSelect,
  },
};

export const saleDetailInclude = {
  photocard: {
    select: photocardSummarySelect,
  },
  seller: {
    select: sellerSummarySelect,
  },
};

/*********************************
 * 판매 수정
 *********************************/

export const saleForUpdateSelect = {
  id: true,
  userUuid: true,
  photocardId: true,
  price: true,
  status: true,
  quantity: true,
  remainingQuantity: true,
  seller: {
    select: sellerSummarySelect,
  },
  photocard: {
    select: photocardForSaleUpdateSelect,
  },
};

export const updateSaleSelect = {
  id: true,
  price: true,
  quantity: true,
  remainingQuantity: true,
  status: true,
  desiredGrade: true,
  desiredGenre: true,
  desiredDescription: true,
  updatedAt: true,
};

/*********************************
 * 판매 취소 및 상태 변경
 *********************************/

export const cancelSaleSelect = {
  id: true,
  status: true,
  updatedAt: true,
};

export const saleStatusSelect = {
  id: true,
  remainingQuantity: true,
  status: true,
};

/*********************************
 * 포토카드 조회
 *********************************/

export const userPhotocardIdSelect = {
  id: true,
};

export const ownedPhotocardSelect = {
  id: true,
  photocardId: true,
};

/*********************************
 * 교환 제안 조회
 *********************************/

export const myPendingTradeInclude = {
  offeredCard: {
    include: {
      photocard: {
        select: photocardSummarySelect,
      },
      owner: {
        select: sellerNicknameSelect,
      },
    },
  },
};
