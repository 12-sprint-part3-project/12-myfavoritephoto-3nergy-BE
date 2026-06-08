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
  'SOLD_OUT',
  'SALE',
  'SALE',
  'SOLD_OUT',
  'SALE',
  'SOLD_OUT',
  'SALE',
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
  const sales = [];
  const tradePendingCards = [];

  for (let i = 1; i <= 10; i++) {
    const user = await prisma.user.create({
      data: {
        email: `user${i}@test.com`,
        passwordHash,
        nickname: `유저${i}`,
        provider: 'LOCAL',
        point: {
          create: { balance: 100000 },
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

      const userPhotocardStatus = isSaleTarget
        ? 'ON_SALE'
        : cardIndex % 2 === 0
          ? 'TRADE_PENDING'
          : 'OWNED';

      const userPhotocardQuantity =
        userPhotocardStatus === 'OWNED'
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
        const userPhotocard = await prisma.userPhotocard.create({
          data: {
            photocardId: photocard.id,
            ownerUuid: user.uuid,
            serialNumber,
            status: userPhotocardStatus,
            acquiredAt: new Date(),
          },
        });

        if (userPhotocardStatus === 'TRADE_PENDING') {
          tradePendingCards.push({
            userPhotocard,
            owner: user,
          });
        }
      }

      if (isSaleTarget) {
        const saleStatus =
          cardIndex === 3 || cardIndex === 6 ? 'SOLD_OUT' : 'SALE';

        const quantity = 5;

        const sale = await prisma.sale.create({
          data: {
            userUuid: user.uuid,
            photocardId: photocard.id,
            price: photocard.price,
            quantity,
            remainingQuantity:
              saleStatus === 'SOLD_OUT'
                ? 0
                : Math.max(1, quantity - (globalIndex % quantity)),
            status: saleStatus,
            desiredGrade: grades[globalIndex % grades.length],
            desiredGenre: genres[globalIndex % genres.length],
            desiredDescription: '교환 희망 조건입니다.',
          },
        });

        if (saleStatus === 'SALE') {
          sales.push({
            sale,
            seller: user,
          });
        }
      }
    }
  }

  for (let i = 0; i < tradePendingCards.length; i++) {
    const proposer = tradePendingCards[i].owner;
    const offeredCard = tradePendingCards[i].userPhotocard;

    const targetSale = sales.find(
      ({ seller }) => seller.uuid !== proposer.uuid,
    );

    if (!targetSale) continue;

    await prisma.trade.create({
      data: {
        proposerUuid: proposer.uuid,
        receiverUuid: targetSale.seller.uuid,
        saleId: targetSale.sale.id,
        offeredCardId: offeredCard.id,
        status: 'PENDING',
      },
    });
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
