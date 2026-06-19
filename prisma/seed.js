import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const PASSWORD = 'Password1234!';

const USER_COUNT = 20;
const PHOTOCARD_COUNT = 220;

const ACTIVE_SALE_COUNT = 40;
const PARTIAL_SALE_COUNT = 30;
const SOLD_OUT_SALE_COUNT = 25;
const CANCELED_SALE_COUNT = 20;

const PENDING_TRADE_COUNT = 25;
const ACCEPTED_TRADE_COUNT = 15;
const REJECTED_TRADE_COUNT = 15;
const CANCELED_TRADE_COUNT = 15;

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

let serialNumber = 1;

const nextSerialNumber = () => serialNumber++;

const getPrice = (index) => (index % 10) + 1;

const getDifferentUser = (users, baseIndex, offset = 1) => {
  return users[(baseIndex + offset) % users.length];
};

const main = async () => {
  await prisma.trade.deleteMany();
  await prisma.saleLog.deleteMany();
  await prisma.pointTransaction.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.userPhotocard.deleteMany();
  await prisma.photocard.deleteMany();
  await prisma.userPoint.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  const users = await Promise.all(
    Array.from({ length: USER_COUNT }).map((_, index) =>
      prisma.user.create({
        data: {
          email: `user${index + 1}@test.com`,
          nickname: `유저${index + 1}`,
          passwordHash,
          provider: 'LOCAL',
          point: {
            create: {
              balance: 100000,
            },
          },
        },
      }),
    ),
  );

  const photocards = await Promise.all(
    Array.from({ length: PHOTOCARD_COUNT }).map((_, index) =>
      prisma.photocard.create({
        data: {
          creatorUuid: users[index % users.length].uuid,
          name: `QA 포토카드 ${index + 1}`,
          imageUrl: `https://picsum.photos/seed/qa-photocard-${index + 1}/400/600`,
          description: `QA 포토카드 ${index + 1} 설명입니다.`,
          grade: grades[index % grades.length],
          genre: genres[index % genres.length],
          totalQuantity: 30,
          price: getPrice(index),
        },
      }),
    ),
  );

  const usedSalePhotocardIds = new Set();

  const getUnusedSalePhotocard = () => {
    const photocard = photocards.find(
      (card) => !usedSalePhotocardIds.has(card.id),
    );

    if (!photocard) {
      throw new Error('판매글에 사용할 포토카드가 부족합니다.');
    }

    usedSalePhotocardIds.add(photocard.id);
    return photocard;
  };

  const createUserPhotocard = async ({ photocardId, ownerUuid, status }) => {
    return prisma.userPhotocard.create({
      data: {
        photocardId,
        ownerUuid,
        serialNumber: nextSerialNumber(),
        status,
        acquiredAt: new Date(),
      },
    });
  };

  const createUserPhotocards = async ({
    photocardId,
    ownerUuid,
    status,
    count,
  }) => {
    return Promise.all(
      Array.from({ length: count }).map(() =>
        createUserPhotocard({
          photocardId,
          ownerUuid,
          status,
        }),
      ),
    );
  };

  const createSale = async ({
    seller,
    photocard,
    price,
    quantity,
    remainingQuantity,
    status,
    description,
  }) => {
    return prisma.sale.create({
      data: {
        userUuid: seller.uuid,
        photocardId: photocard.id,
        price,
        quantity,
        remainingQuantity,
        status,
        desiredGrade: grades[photocard.id % grades.length],
        desiredGenre: genres[photocard.id % genres.length],
        desiredDescription: description,
      },
    });
  };

  const createSaleLogAndPointTransactions = async ({
    saleId,
    buyerUuid,
    sellerUuid,
    photocardId,
    quantity,
    price,
  }) => {
    const amount = quantity * price;

    await prisma.saleLog.create({
      data: {
        saleId,
        buyerUuid,
        sellerUuid,
        photocardId,
        quantity,
        price,
      },
    });

    await prisma.pointTransaction.createMany({
      data: [
        {
          userUuid: buyerUuid,
          amount,
          type: 'BUY',
        },
        {
          userUuid: sellerUuid,
          amount,
          type: 'SELL',
        },
      ],
    });
  };

  const createActiveSales = async () => {
    for (let i = 0; i < ACTIVE_SALE_COUNT; i += 1) {
      const seller = users[i % users.length];
      const photocard = getUnusedSalePhotocard();

      const quantity = 3 + (i % 5);
      const price = getPrice(i);

      await createUserPhotocards({
        photocardId: photocard.id,
        ownerUuid: seller.uuid,
        status: 'ON_SALE',
        count: quantity,
      });

      await createSale({
        seller,
        photocard,
        price,
        quantity,
        remainingQuantity: quantity,
        status: 'SALE',
        description: '판매 중 정합성 테스트',
      });
    }
  };

  const createPartialSales = async () => {
    for (let i = 0; i < PARTIAL_SALE_COUNT; i += 1) {
      const seller = users[i % users.length];
      const buyer = getDifferentUser(users, i, 7);
      const photocard = getUnusedSalePhotocard();

      const quantity = 5 + (i % 4);
      const soldQuantity = 2 + (i % 2);
      const remainingQuantity = quantity - soldQuantity;
      const price = getPrice(i + 1);

      await createUserPhotocards({
        photocardId: photocard.id,
        ownerUuid: seller.uuid,
        status: 'ON_SALE',
        count: remainingQuantity,
      });

      await createUserPhotocards({
        photocardId: photocard.id,
        ownerUuid: buyer.uuid,
        status: 'OWNED',
        count: soldQuantity,
      });

      const sale = await createSale({
        seller,
        photocard,
        price,
        quantity,
        remainingQuantity,
        status: 'SALE',
        description: '부분 구매된 판매글 정합성 테스트',
      });

      await createSaleLogAndPointTransactions({
        saleId: sale.id,
        buyerUuid: buyer.uuid,
        sellerUuid: seller.uuid,
        photocardId: photocard.id,
        quantity: soldQuantity,
        price,
      });
    }
  };

  const createSoldOutSales = async () => {
    for (let i = 0; i < SOLD_OUT_SALE_COUNT; i += 1) {
      const seller = users[i % users.length];
      const buyer = getDifferentUser(users, i, 9);
      const photocard = getUnusedSalePhotocard();

      const quantity = 3 + (i % 5);
      const price = getPrice(i + 2);

      await createUserPhotocards({
        photocardId: photocard.id,
        ownerUuid: buyer.uuid,
        status: 'OWNED',
        count: quantity,
      });

      const sale = await createSale({
        seller,
        photocard,
        price,
        quantity,
        remainingQuantity: 0,
        status: 'SOLD_OUT',
        description: '품절 판매글 정합성 테스트',
      });

      await createSaleLogAndPointTransactions({
        saleId: sale.id,
        buyerUuid: buyer.uuid,
        sellerUuid: seller.uuid,
        photocardId: photocard.id,
        quantity,
        price,
      });
    }
  };

  const createCanceledSales = async () => {
    for (let i = 0; i < CANCELED_SALE_COUNT; i += 1) {
      const seller = users[i % users.length];
      const buyer = getDifferentUser(users, i, 11);
      const photocard = getUnusedSalePhotocard();

      const quantity = 5 + (i % 5);
      const soldQuantity = 2 + (i % 2);
      const remainingQuantity = quantity - soldQuantity;
      const price = getPrice(i + 3);

      await createUserPhotocards({
        photocardId: photocard.id,
        ownerUuid: seller.uuid,
        status: 'OWNED',
        count: remainingQuantity,
      });

      await createUserPhotocards({
        photocardId: photocard.id,
        ownerUuid: buyer.uuid,
        status: 'OWNED',
        count: soldQuantity,
      });

      const sale = await createSale({
        seller,
        photocard,
        price,
        quantity,
        remainingQuantity,
        status: 'CANCELED',
        description: '판매 중단 정합성 테스트',
      });

      await createSaleLogAndPointTransactions({
        saleId: sale.id,
        buyerUuid: buyer.uuid,
        sellerUuid: seller.uuid,
        photocardId: photocard.id,
        quantity: soldQuantity,
        price,
      });
    }
  };

  const createPendingTrades = async () => {
    for (let i = 0; i < PENDING_TRADE_COUNT; i += 1) {
      const seller = users[i % users.length];
      const proposer = getDifferentUser(users, i, 3);
      const salePhotocard = getUnusedSalePhotocard();
      const offeredPhotocard = photocards[(120 + i) % photocards.length];

      await createUserPhotocard({
        photocardId: salePhotocard.id,
        ownerUuid: seller.uuid,
        status: 'ON_SALE',
      });

      const sale = await createSale({
        seller,
        photocard: salePhotocard,
        price: getPrice(i + 4),
        quantity: 1,
        remainingQuantity: 1,
        status: 'SALE',
        description: 'PENDING 교환 테스트 판매글',
      });

      const offeredCard = await createUserPhotocard({
        photocardId: offeredPhotocard.id,
        ownerUuid: proposer.uuid,
        status: 'TRADE_PENDING',
      });

      await prisma.trade.create({
        data: {
          proposerUuid: proposer.uuid,
          receiverUuid: seller.uuid,
          saleId: sale.id,
          offeredCardId: offeredCard.id,
          status: 'PENDING',
          description: 'PENDING 교환 제안',
        },
      });
    }
  };

  const createAcceptedTrades = async () => {
    for (let i = 0; i < ACCEPTED_TRADE_COUNT; i += 1) {
      const seller = users[i % users.length];
      const proposer = getDifferentUser(users, i, 5);
      const salePhotocard = getUnusedSalePhotocard();
      const offeredPhotocard = photocards[(150 + i) % photocards.length];

      await createUserPhotocard({
        photocardId: salePhotocard.id,
        ownerUuid: proposer.uuid,
        status: 'OWNED',
      });

      const offeredCard = await createUserPhotocard({
        photocardId: offeredPhotocard.id,
        ownerUuid: seller.uuid,
        status: 'OWNED',
      });

      const sale = await createSale({
        seller,
        photocard: salePhotocard,
        price: getPrice(i + 5),
        quantity: 1,
        remainingQuantity: 0,
        status: 'SOLD_OUT',
        description: 'ACCEPTED 교환 테스트 판매글',
      });

      await prisma.trade.create({
        data: {
          proposerUuid: proposer.uuid,
          receiverUuid: seller.uuid,
          saleId: sale.id,
          offeredCardId: offeredCard.id,
          status: 'ACCEPTED',
          description: 'ACCEPTED 교환 제안',
        },
      });
    }
  };

  const createRejectedTrades = async () => {
    for (let i = 0; i < REJECTED_TRADE_COUNT; i += 1) {
      const seller = users[i % users.length];
      const proposer = getDifferentUser(users, i, 6);
      const salePhotocard = getUnusedSalePhotocard();
      const offeredPhotocard = photocards[(170 + i) % photocards.length];

      await createUserPhotocard({
        photocardId: salePhotocard.id,
        ownerUuid: seller.uuid,
        status: 'ON_SALE',
      });

      const sale = await createSale({
        seller,
        photocard: salePhotocard,
        price: getPrice(i + 6),
        quantity: 1,
        remainingQuantity: 1,
        status: 'SALE',
        description: 'REJECTED 교환 테스트 판매글',
      });

      const offeredCard = await createUserPhotocard({
        photocardId: offeredPhotocard.id,
        ownerUuid: proposer.uuid,
        status: 'OWNED',
      });

      await prisma.trade.create({
        data: {
          proposerUuid: proposer.uuid,
          receiverUuid: seller.uuid,
          saleId: sale.id,
          offeredCardId: offeredCard.id,
          status: 'REJECTED',
          description: 'REJECTED 교환 제안',
        },
      });
    }
  };

  const createCanceledTrades = async () => {
    for (let i = 0; i < CANCELED_TRADE_COUNT; i += 1) {
      const seller = users[i % users.length];
      const proposer = getDifferentUser(users, i, 8);
      const salePhotocard = getUnusedSalePhotocard();
      const offeredPhotocard = photocards[(190 + i) % photocards.length];

      await createUserPhotocard({
        photocardId: salePhotocard.id,
        ownerUuid: seller.uuid,
        status: 'ON_SALE',
      });

      const sale = await createSale({
        seller,
        photocard: salePhotocard,
        price: getPrice(i + 7),
        quantity: 1,
        remainingQuantity: 1,
        status: 'SALE',
        description: 'CANCELED 교환 테스트 판매글',
      });

      const offeredCard = await createUserPhotocard({
        photocardId: offeredPhotocard.id,
        ownerUuid: proposer.uuid,
        status: 'OWNED',
      });

      await prisma.trade.create({
        data: {
          proposerUuid: proposer.uuid,
          receiverUuid: seller.uuid,
          saleId: sale.id,
          offeredCardId: offeredCard.id,
          status: 'CANCELED',
          description: 'CANCELED 교환 제안',
        },
      });
    }
  };

  await createActiveSales();
  await createPartialSales();
  await createSoldOutSales();
  await createCanceledSales();

  await createPendingTrades();
  await createAcceptedTrades();
  await createRejectedTrades();
  await createCanceledTrades();

  const duplicatedSales = await prisma.sale.groupBy({
    by: ['photocardId'],
    _count: {
      photocardId: true,
    },
    having: {
      photocardId: {
        _count: {
          gt: 1,
        },
      },
    },
  });

  if (duplicatedSales.length > 0) {
    throw new Error('동일 포토카드 판매글이 존재합니다.');
  }

  const invalidPriceSales = await prisma.sale.findMany({
    where: {
      OR: [{ price: { lt: 1 } }, { price: { gt: 10 } }],
    },
  });

  if (invalidPriceSales.length > 0) {
    throw new Error('판매 가격은 1~10 사이여야 합니다.');
  }

  const saleCount = await prisma.sale.count();
  const tradeCount = await prisma.trade.count();
  const userPhotocardCount = await prisma.userPhotocard.count();

  console.log('QA 시드 데이터 생성 완료');
  console.log(`유저: ${USER_COUNT}명`);
  console.log(`포토카드 종류: ${PHOTOCARD_COUNT}개`);
  console.log(`판매글: ${saleCount}개`);
  console.log(`교환 제안: ${tradeCount}개`);
  console.log(`유저 보유 카드: ${userPhotocardCount}장`);
  console.log(`테스트 계정: user1@test.com ~ user${USER_COUNT}@test.com`);
  console.log(`테스트 비밀번호: ${PASSWORD}`);
};

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
