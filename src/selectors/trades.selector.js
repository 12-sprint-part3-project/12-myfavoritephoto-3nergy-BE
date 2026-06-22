/*********************************
 * 공통 유저 및 포토카드 정보
 *********************************/

export const tradeUserSummarySelect = {
  uuid: true,
  nickname: true,
};

export const tradePhotocardSummarySelect = {
  id: true,
  name: true,
  imageUrl: true,
  grade: true,
  genre: true,
  price: true,
};

export const tradeSalePhotocardSelect = {
  id: true,
  name: true,
  grade: true,
};

/*********************************
 * 교환 제안 목록 조회
 *********************************/

export const receivedTradeListInclude = {
  proposer: {
    select: tradeUserSummarySelect,
  },
  offeredCard: {
    include: {
      photocard: {
        select: tradePhotocardSummarySelect,
      },
    },
  },
};

export const myTradeListInclude = {
  receiver: {
    select: tradeUserSummarySelect,
  },
  offeredCard: {
    include: {
      photocard: {
        select: tradePhotocardSummarySelect,
      },
    },
  },
};

/*********************************
 * 교환 제안 생성 및 단건 조회
 *********************************/

export const saleForTradeSelect = {
  id: true,
  userUuid: true,
  status: true,
  photocard: {
    select: tradeSalePhotocardSelect,
  },
};

export const userPhotocardForTradeSelect = {
  id: true,
  ownerUuid: true,
  status: true,
};

export const createTradeSelect = {
  id: true,
  saleId: true,
  offeredCardId: true,
  description: true,
  status: true,
  createdAt: true,
};

export const tradeDetailInclude = {
  proposer: {
    select: tradeUserSummarySelect,
  },
  receiver: {
    select: tradeUserSummarySelect,
  },
  sale: {
    include: {
      photocard: {
        select: tradeSalePhotocardSelect,
      },
    },
  },
  offeredCard: true,
};

/*********************************
 * 교환 제안 상태 변경
 *********************************/

export const pendingTradeSelect = {
  id: true,
  proposerUuid: true,
  offeredCardId: true,
};
