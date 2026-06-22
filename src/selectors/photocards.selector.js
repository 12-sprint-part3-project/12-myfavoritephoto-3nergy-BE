/*********************************
 * 포토카드 목록 조회
 *********************************/

export const photocardListItemSelect = {
  id: true,
  name: true,
  imageUrl: true,
  grade: true,
  genre: true,
  price: true,
  description: true,
};

export const cardOwnerSummarySelect = {
  uuid: true,
  nickname: true,
};

export const cardListInclude = {
  photocard: {
    select: photocardListItemSelect,
  },
  owner: {
    select: cardOwnerSummarySelect,
  },
};

/*********************************
 * 포토카드 생성
 *********************************/

export const createdPhotocardSelect = {
  id: true,
  name: true,
  grade: true,
  genre: true,
  price: true,
  totalQuantity: true,
  imageUrl: true,
  description: true,
  createdAt: true,
};
