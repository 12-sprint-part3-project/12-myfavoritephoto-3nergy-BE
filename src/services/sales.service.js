export const getSalesList = async (query) => {
  return {
    data: {
      items: [],
    },
    meta: {
      page: Number(query.page) || 1,
      pageSize: Number(query.pageSize) || 20,
      totalCount: 0,
      totalPages: 0,
      hasNextPage: false,
    },
  };
};
0;
