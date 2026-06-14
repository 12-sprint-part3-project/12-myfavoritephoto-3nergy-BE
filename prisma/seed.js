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

const USER_COUNT = 10;
const SALE_COUNT_PER_USER = 32;
const OWNED_COUNT_PER_USER = 45;
const TRADE_COUNT_PER_USER = 30;

const getGrade = (index) => grades[index % grades.length];
const getGenre = (index) => genres[index % genres.length];

const getImageUrl = (index) =>
  `https://picsum.photos/seed/photocard-${index}/400/600`;

async function createPhotocard({ creatorUuid, index, totalQuantity = 100 }) {
  return prisma.photocard.create({
    data: {
      creatorUuid,
      name: `테스트 포토카드 ${index}`,
      imageUrl: getImageUrl(index),
      description: `테스트 포토카드 ${index} 설명입니다.`,
      grade: getGrade(index),
      genre: getGenre(index),
      totalQuantity,
      price: 1000 + index * 10,
    },
  });
}

async function createUserPhotocard({
  photocardId,
  ownerUuid,
  serialNumber,
  status,
}) {
  return prisma.userPhotocard.create({
    data: {
      photocardId,
      ownerUuid,
      serialNumber,
      status,
      acquiredAt: new Date(),
    },
  });
}

async function main() {
  await prisma.trade.deleteMany();
  await prisma.saleLog.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.userPhotocard.deleteMany();
  await prisma.photocard.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.pointTransaction.deleteMany();
  await prisma.userPoint.deleteMany();
  await prisma.rewardState.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Password1234!', 10);

  const users = [];
  const representativeSalesByUserUuid = new Map();
  const tradePendingCardsByUserUuid = new Map();

  for (let i = 1; i <= USER_COUNT; i++) {
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
    tradePendingCardsByUserUuid.set(user.uuid, []);
  }

  let globalPhotocardIndex = 1;

  for (const [userIndex, user] of users.entries()) {
    for (let saleIndex = 1; saleIndex <= SALE_COUNT_PER_USER; saleIndex++) {
      const photocard = await createPhotocard({
        creatorUuid: user.uuid,
        index: globalPhotocardIndex,
      });

      const quantity = 5;
      const isSoldOut = saleIndex % 8 === 0;
      const remainingQuantity = isSoldOut ? 0 : 3;
      const soldQuantity = quantity - remainingQuantity;

      const sale = await prisma.sale.create({
        data: {
          userUuid: user.uuid,
          photocardId: photocard.id,
          price: photocard.price,
          quantity,
          remainingQuantity,
          status: isSoldOut ? 'SOLD_OUT' : 'SALE',
          desiredGrade: getGrade(globalPhotocardIndex + 1),
          desiredGenre: getGenre(globalPhotocardIndex + 1),
          desiredDescription: '교환 희망 조건입니다.',
        },
      });

      if (saleIndex === 1) {
        representativeSalesByUserUuid.set(user.uuid, sale);
      }

      let serialNumber = 1;

      for (let i = 0; i < remainingQuantity; i++) {
        await createUserPhotocard({
          photocardId: photocard.id,
          ownerUuid: user.uuid,
          serialNumber,
          status: 'ON_SALE',
        });

        serialNumber++;
      }

      for (let i = 0; i < soldQuantity; i++) {
        const buyer = users[(userIndex + i + 1) % users.length];

        await createUserPhotocard({
          photocardId: photocard.id,
          ownerUuid: buyer.uuid,
          serialNumber,
          status: 'OWNED',
        });

        await prisma.saleLog.create({
          data: {
            saleId: sale.id,
            buyerUuid: buyer.uuid,
            sellerUuid: user.uuid,
            photocardId: photocard.id,
            quantity: 1,
            price: photocard.price,
          },
        });

        serialNumber++;
      }

      globalPhotocardIndex++;
    }

    for (let ownedIndex = 1; ownedIndex <= OWNED_COUNT_PER_USER; ownedIndex++) {
      const photocard = await createPhotocard({
        creatorUuid: user.uuid,
        index: globalPhotocardIndex,
        totalQuantity: 1,
      });

      await createUserPhotocard({
        photocardId: photocard.id,
        ownerUuid: user.uuid,
        serialNumber: 1,
        status: 'OWNED',
      });

      globalPhotocardIndex++;
    }

    for (let tradeIndex = 1; tradeIndex <= TRADE_COUNT_PER_USER; tradeIndex++) {
      const photocard = await createPhotocard({
        creatorUuid: user.uuid,
        index: globalPhotocardIndex,
        totalQuantity: 1,
      });

      const userPhotocard = await createUserPhotocard({
        photocardId: photocard.id,
        ownerUuid: user.uuid,
        serialNumber: 1,
        status: 'TRADE_PENDING',
      });

      tradePendingCardsByUserUuid.get(user.uuid).push(userPhotocard);

      globalPhotocardIndex++;
    }
  }

  for (const [userIndex, proposer] of users.entries()) {
    const receiver = users[(userIndex + 1) % users.length];
    const targetSale = representativeSalesByUserUuid.get(receiver.uuid);
    const offeredCards = tradePendingCardsByUserUuid.get(proposer.uuid);

    for (const [tradeIndex, offeredCard] of offeredCards.entries()) {
      await prisma.trade.create({
        data: {
          proposerUuid: proposer.uuid,
          receiverUuid: receiver.uuid,
          saleId: targetSale.id,
          offeredCardId: offeredCard.id,
          description: `교환 제안 테스트 내용 ${tradeIndex + 1}`,
          status: 'PENDING',
        },
      });
    }
  }

  console.log('Seed 완료');
  console.log(`유저 ${USER_COUNT}명`);
  console.log(`유저별 판매글 ${SALE_COUNT_PER_USER}개`);
  console.log(`유저별 OWNED 카드 ${OWNED_COUNT_PER_USER}개 이상`);
  console.log(`유저별 받은 PENDING 교환 제안 ${TRADE_COUNT_PER_USER}개`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
