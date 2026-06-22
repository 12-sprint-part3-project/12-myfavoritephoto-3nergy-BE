export const NOTIFICATION_PRESET = {
  PURCHASE_COMPLETED: {
    type: 'PURCHASE_COMPLETED',
    targetType: 'MY_GALLERY',
  },

  SALE_COMPLETED: {
    type: 'SALE_COMPLETED',
    targetType: 'MY_SALE_PAGE',
  },

  SOLD_OUT: {
    type: 'SOLD_OUT',
    targetType: 'MY_SALE_PAGE',
  },

  TRADE_CANCELED_BY_SOLD_OUT: {
    type: 'TRADE_CANCELED_BY_SOLD_OUT',
    targetType: 'SALE_DETAIL',
  },

  TRADE_PROPOSED: {
    type: 'TRADE_PROPOSED',
    targetType: 'SALE_DETAIL',
  },

  TRADE_CANCELED: {
    type: 'TRADE_CANCELED',
    targetType: 'SALE_DETAIL',
  },

  TRADE_ACCEPTED: {
    type: 'TRADE_ACCEPTED',
    targetType: 'MY_GALLERY',
  },

  TRADE_REJECTED: {
    type: 'TRADE_REJECTED',
    targetType: 'SALE_DETAIL',
  },

  SALE_STOPPED: {
    type: 'SALE_STOPPED',
    targetType: 'SALE_DETAIL',
  },

  SALE_UPDATED: {
    type: 'SALE_UPDATED',
    targetType: 'SALE_DETAIL',
  },
};
