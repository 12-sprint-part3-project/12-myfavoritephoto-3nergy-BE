import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst();

  if (!user) {
    throw new Error('유저가 없습니다.');
  }

  await prisma.notification.createMany({
    data: [
      {
        userUuid: user.uuid,
        type: 'PURCHASE_COMPLETED',
        targetType: 'MY_GALLERY',
        isRead: false,
      },
      {
        userUuid: user.uuid,
        type: 'SALE_COMPLETED',
        targetType: 'MY_SALE_PAGE',
        isRead: false,
      },
      {
        userUuid: user.uuid,
        type: 'TRADE_PROPOSED',
        targetType: 'SALE_DETAIL',
        targetId: 1,
        isRead: false,
      },
    ],
  });

  console.log('알림 생성 완료');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
