export const buildSaleOrderBy = (sort) => {
  const orderByMap = {
    latest: { createdAt: 'desc' },
    oldest: { createdAt: 'asc' },
    price_asc: { price: 'asc' },
    price_desc: { price: 'desc' },
  };

  return orderByMap[sort] || orderByMap.latest;
};
