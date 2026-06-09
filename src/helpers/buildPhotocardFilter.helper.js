export const buildPhotocardFilter = ({ grade, genre, keyword }) => ({
  ...(grade && { grade }),
  ...(genre && { genre }),
  ...(keyword && {
    OR: [
      {
        name: {
          contains: keyword,
          mode: 'insensitive',
        },
      },
      {
        description: {
          contains: keyword,
          mode: 'insensitive',
        },
      },
    ],
  }),
});
