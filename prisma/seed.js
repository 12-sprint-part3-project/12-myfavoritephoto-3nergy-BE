import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const grades = ['common', 'rare', 'super_rare', 'legendary'];

const genres = [
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

const saleStatuses = [
  'SALE',
  'SALE',
  'SALE',
  'SALE',
  'SALE',
  'SALE',
  'SOLD_OUT',
  'SOLD_OUT',
  'SOLD_OUT',
  'CANCELED',
];

const imageUrls = Array.from(
  { length: 100 },
  (_, index) => `https://picsum.photos/seed/photocard-${index + 1}/400/600`,
);

async function main() {
  await prisma.trade.deleteMany();
  await prisma.saleLog.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.userPhotocard.deleteMany();
  await prisma.photocard.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.pointTransaction.deleteMany();
  await prisma.userPoint.deleteMany();
  await prisma.rewardState.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Password1234!', 10);

  const users = [];

  for (let i = 1; i <= 10; i++) {
    const user = await prisma.user.create({
      data: {
        email: `user${i}@test.com`,
        passwordHash,
        nickname: `유저${i}`,
        provider: 'LOCAL',
        point: {
          create: {
            balance: 100000,
          },
        },
      },
    });

    users.push(user);
  }

  for (let userIndex = 0; userIndex < users.length; userIndex++) {
    const user = users[userIndex];

    for (let cardIndex = 1; cardIndex <= 10; cardIndex++) {
      const globalIndex = userIndex * 10 + cardIndex;
      const grade = grades[(globalIndex - 1) % grades.length];
      const genre = genres[(globalIndex - 1) % genres.length];

      const photocard = await prisma.photocard.create({
        data: {
          creatorUuid: user.uuid,
          name: `테스트 포토카드 ${globalIndex}`,
          imageUrl: imageUrls[globalIndex - 1],
          description: `테스트 포토카드 ${globalIndex} 설명입니다.`,
          grade,
          genre,
          totalQuantity: 5,
          price: 1000 + globalIndex * 100,
        },
      });

      const isSaleTarget = cardIndex <= 6;

      const status = isSaleTarget
        ? 'ON_SALE'
        : cardIndex % 2 === 0
          ? 'TRADE_PENDING'
          : 'OWNED';

      const userPhotocardQuantity =
        status === 'OWNED'
          ? cardIndex % 3 === 1
            ? 3
            : cardIndex % 3 === 2
              ? 2
              : 1
          : 1;

      for (
        let serialNumber = 1;
        serialNumber <= userPhotocardQuantity;
        serialNumber++
      ) {
        await prisma.userPhotocard.create({
          data: {
            photocardId: photocard.id,
            ownerUuid: user.uuid,
            serialNumber,
            status,
            acquiredAt: new Date(),
          },
        });
      }

      if (isSaleTarget) {
        const status = saleStatuses[(globalIndex - 1) % saleStatuses.length];
        const quantity = 5;

        await prisma.sale.create({
          data: {
            userUuid: user.uuid,
            photocardId: photocard.id,
            price: photocard.price,
            quantity,
            remainingQuantity:
              status === 'SOLD_OUT'
                ? 0
                : Math.max(1, quantity - (globalIndex % quantity)),
            status,
            desiredGrade: grades[globalIndex % grades.length],
            desiredGenre: genres[globalIndex % genres.length],
            desiredDescription: '교환 희망 조건입니다.',
          },
        });
      }
    }
  }

  console.log('Seed 완료');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
