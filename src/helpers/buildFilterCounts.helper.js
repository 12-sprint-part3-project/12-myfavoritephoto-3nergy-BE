export const GRADE_VALUES = ['common', 'rare', 'super_rare', 'legendary'];

export const GENRE_VALUES = [
  'album',
  'special',
  'landscape',
  'season_greeting',
  'fan_meeting',
  'concert',
  'md',
  'collage',
  'branding',
  'etc',
];

export const SALE_STATUS_VALUES = ['SALE', 'SOLD_OUT'];

export const SALE_METHOD_VALUES = ['SALE', 'TRADE'];

export const buildGradeCounts = (items) => {
  return GRADE_VALUES.map((grade) => ({
    grade,
    count: items.filter((item) => item.grade === grade).length,
  }));
};

export const buildGenreCounts = (items) => {
  return GENRE_VALUES.map((genre) => ({
    genre,
    count: items.filter((item) => item.genre === genre).length,
  }));
};

export const buildSaleStatusCounts = (items) => {
  return SALE_STATUS_VALUES.map((status) => ({
    status,
    count: items.filter((item) => item.status === status).length,
  }));
};

export const buildMySaleStatusCounts = (items) => {
  return SALE_STATUS_VALUES.map((status) => ({
    status,
    count: items.filter((item) => item.countStatus === status).length,
  }));
};

export const buildSaleMethodCounts = (items) => {
  return SALE_METHOD_VALUES.map((method) => ({
    method,
    count: items.filter((item) => item.saleMethod === method).length,
  }));
};
