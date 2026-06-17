import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const saleRemaining = await prisma.sale.aggregate({
  where: {
    status: 'SALE',
  },
  _sum: {
    remainingQuantity: true,
  },
});

const pendingTrades = await prisma.trade.count({
  where: {
    status: 'PENDING',
  },
});

const saleLogs = await prisma.saleLog.count();

const pointTransactions = await prisma.pointTransaction.count();

const result = {
  ownedCards: await prisma.userPhotocard.count({
    where: {
      status: 'OWNED',
    },
  }),

  onSaleCards: await prisma.userPhotocard.count({
    where: {
      status: 'ON_SALE',
    },
  }),

  tradePendingCards: await prisma.userPhotocard.count({
    where: {
      status: 'TRADE_PENDING',
    },
  }),

  saleSales: await prisma.sale.count({
    where: {
      status: 'SALE',
    },
  }),

  soldOutSales: await prisma.sale.count({
    where: {
      status: 'SOLD_OUT',
    },
  }),

  canceledSales: await prisma.sale.count({
    where: {
      status: 'CANCELED',
    },
  }),

  pendingTrades,

  saleLogs,

  pointTransactions,

  saleRemainingQuantity: saleRemaining._sum.remainingQuantity ?? 0,
};

console.table(result);

console.log('\n===== 정합성 =====');

console.log(
  'ON_SALE === SALE remainingQuantity',
  result.onSaleCards === result.saleRemainingQuantity,
);

console.log(
  'TRADE_PENDING === PENDING trades',
  result.tradePendingCards === result.pendingTrades,
);

console.log(
  'pointTransactions === saleLogs × 2',
  result.pointTransactions === result.saleLogs * 2,
);

await prisma.$disconnect();
