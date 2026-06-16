export const ERROR_CODES = {
  // =========================
  // AUTH
  // =========================
  INVALID_CREDENTIALS: {
    statusCode: 401,
    code: 'INVALID_CREDENTIALS',
    message: '이메일 또는 비밀번호가 일치하지 않습니다.',
  },

  UNAUTHORIZED: {
    statusCode: 401,
    code: 'UNAUTHORIZED',
    message: '인증이 필요합니다.',
  },

  ACCESS_TOKEN_MISSING: {
    statusCode: 401,
    code: 'ACCESS_TOKEN_MISSING',
    message: 'Access Token이 필요합니다.',
  },

  ACCESS_TOKEN_EXPIRED: {
    statusCode: 401,
    code: 'ACCESS_TOKEN_EXPIRED',
    message: 'Access Token이 만료되었습니다.',
  },

  INVALID_ACCESS_TOKEN: {
    statusCode: 401,
    code: 'INVALID_ACCESS_TOKEN',
    message: '유효하지 않은 Access Token입니다.',
  },

  REFRESH_TOKEN_EXPIRED: {
    statusCode: 401,
    code: 'REFRESH_TOKEN_EXPIRED',
    message: 'Refresh Token이 만료되었습니다.',
  },

  INVALID_REFRESH_TOKEN: {
    statusCode: 401,
    code: 'INVALID_REFRESH_TOKEN',
    message: '유효하지 않은 Refresh Token입니다.',
  },

  // =========================
  // USER
  // =========================
  USER_NOT_FOUND: {
    statusCode: 404,
    code: 'USER_NOT_FOUND',
    message: '존재하지 않는 사용자입니다.',
  },

  EMAIL_ALREADY_EXISTS: {
    statusCode: 409,
    code: 'EMAIL_ALREADY_EXISTS',
    message: '이미 사용 중인 이메일입니다.',
  },

  NICKNAME_ALREADY_EXISTS: {
    statusCode: 409,
    code: 'NICKNAME_ALREADY_EXISTS',
    message: '이미 사용 중인 닉네임입니다.',
  },

  // =========================
  // PHOTOCARD
  // =========================
  PHOTOCARD_NOT_FOUND: {
    statusCode: 404,
    code: 'PHOTOCARD_NOT_FOUND',
    message: '존재하지 않는 포토카드입니다.',
  },

  NOT_CARD_OWNER: {
    statusCode: 403,
    code: 'NOT_CARD_OWNER',
    message: '본인이 소유한 카드만 판매할 수 있습니다.',
  },

  CARD_ALREADY_ON_SALE: {
    statusCode: 409,
    code: 'CARD_ALREADY_ON_SALE',
    message: '이미 판매 중인 카드입니다.',
  },

  PHOTOCARD_CREATION_LIMIT_EXCEEDED: {
    statusCode: 409,
    code: 'PHOTOCARD_CREATION_LIMIT_EXCEEDED',
    message: '이번 달 포토카드 생성 가능 횟수를 초과했습니다.',
  },

  // =========================
  // SALE
  // =========================
  SALE_NOT_FOUND: {
    statusCode: 404,
    code: 'SALE_NOT_FOUND',
    message: '존재하지 않는 판매글입니다.',
  },

  NOT_SALE_OWNER: {
    statusCode: 403,
    code: 'NOT_SALE_OWNER',
    message: '본인의 판매글만 수정할 수 있습니다.',
  },

  NOT_ENOUGH_QUANTITY: {
    statusCode: 400,
    code: 'NOT_ENOUGH_QUANTITY',
    message: '판매 수량이 보유 수량을 초과했습니다.',
  },

  SALE_NOT_EDITABLE: {
    statusCode: 409,
    code: 'SALE_NOT_EDITABLE',
    message: '현재 상태에서는 판매글을 수정할 수 없습니다.',
  },

  SALE_NOT_PURCHASABLE: {
    statusCode: 409,
    code: 'SALE_NOT_PURCHASABLE',
    message: '현재 구매할 수 없는 판매글입니다.',
  },

  SOLD_OUT: {
    statusCode: 409,
    code: 'SOLD_OUT',
    message: '이미 품절된 판매글입니다.',
  },

  INSUFFICIENT_SALE_QUANTITY: {
    statusCode: 409,
    code: 'INSUFFICIENT_SALE_QUANTITY',
    message: '구매 가능한 수량이 부족합니다.',
  },

  // =========================
  // POINT
  // =========================
  INSUFFICIENT_POINT: {
    statusCode: 409,
    code: 'INSUFFICIENT_POINT',
    message: '보유 포인트가 부족합니다.',
  },

  // =========================
  // EVENT
  // =========================
  EVENT_NOT_AVAILABLE: {
    statusCode: 429,
    code: 'EVENT_NOT_AVAILABLE',
    message: '아직 이벤트에 참여할 수 없습니다.',
  },

  // =========================
  // TRADE
  // =========================
  TRADE_NOT_FOUND: {
    statusCode: 404,
    code: 'TRADE_NOT_FOUND',
    message: '존재하지 않는 교환 제안입니다.',
  },

  TRADE_ALREADY_PROCESSED: {
    statusCode: 409,
    code: 'TRADE_ALREADY_PROCESSED',
    message: '이미 처리된 교환 제안입니다.',
  },

  CANNOT_PURCHASE_OWN_SALE: {
    statusCode: 403,
    code: 'CANNOT_PURCHASE_OWN_SALE',
    message: '본인의 판매글은 구매할 수 없습니다.',
  },

  CANNOT_TRADE_OWN_SALE: {
    statusCode: 403,
    code: 'CANNOT_TRADE_OWN_SALE',
    message: '본인의 판매글에는 교환을 제안할 수 없습니다.',
  },

  SALE_NOT_TRADEABLE: {
    status: 409,
    code: 'SALE_NOT_TRADEABLE',
    message: '현재 교환 제안할 수 없는 판매글입니다.',
  },

  OFFERED_CARD_NOT_FOUND: {
    status: 404,
    code: 'OFFERED_CARD_NOT_FOUND',
    message: '교환 제안 카드가 존재하지 않습니다.',
  },

  CARD_NOT_AVAILABLE_FOR_TRADE: {
    status: 409,
    code: 'CARD_NOT_AVAILABLE_FOR_TRADE',
    message: '현재 교환 제안할 수 없는 카드입니다.',
  },

  // =========================
  // REQUEST VALIDATION
  // =========================
  INVALID_INPUT: {
    statusCode: 400,
    code: 'INVALID_INPUT',
    message: '요청 데이터가 올바르지 않습니다.',
  },

  // =========================
  // COMMON
  // =========================
  FORBIDDEN: {
    statusCode: 403,
    code: 'FORBIDDEN',
    message: '접근 권한이 없습니다.',
  },

  NOT_FOUND: {
    statusCode: 404,
    code: 'NOT_FOUND',
    message: '요청한 API 경로를 찾을 수 없습니다.',
  },

  RESOURCE_NOT_FOUND: {
    statusCode: 404,
    code: 'RESOURCE_NOT_FOUND',
    message: '요청한 리소스를 찾을 수 없습니다.',
  },

  INTERNAL_SERVER_ERROR: {
    statusCode: 500,
    code: 'INTERNAL_SERVER_ERROR',
    message: '서버 내부 오류가 발생했습니다.',
  },

  // =========================
  // Google
  // =========================

  GOOGLE_CONFIG_MISSING: {
    statusCode: 500,
    code: 'GOOGLE_CONFIG_MISSING',
    message: 'Google OAuth 설정이 올바르지 않습니다.',
  },
  INVALID_GOOGLE_CODE: {
    statusCode: 400,
    code: 'INVALID_GOOGLE_CODE',
    message: '유효하지 않은 Google 인증 코드입니다.',
  },
  GOOGLE_AUTH_FAILED: {
    statusCode: 401,
    code: 'GOOGLE_AUTH_FAILED',
    message: 'Google 인증에 실패했습니다.',
  },

  // =========================
  // Notification
  // =========================

  NOTIFICATION_NOT_FOUND: {
    code: 'NOTIFICATION_NOT_FOUND',
    message: '알림을 찾을 수 없습니다.',
    statusCode: 404,
  },
};
