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

export const buildFilterCounts = ({
  items,
  field,
  values,
  responseKey,
  countField,
}) => {
  const counts = Object.fromEntries(values.map((value) => [value, 0]));

  items.forEach((item) => {
    const key = item[field];

    if (!(key in counts)) return;

    counts[key] += countField ? item[countField] : 1;
  });

  return Object.entries(counts).map(([key, count]) => ({
    [responseKey]: key,
    count,
  }));
};
