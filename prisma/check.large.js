import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
};

console.table(result);

await prisma.$disconnect();
