import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const PERFORMANCE_HOST = 'ep-broad-smoke-ap6mjus1';

const USER_COUNT = 3000;
const PHOTOCARD_COUNT = 30000;
const COPIES_PER_PHOTOCARD = 5;
const USER_PHOTOCARD_COUNT = 120000;

const SALE_COUNTS = {
  SALE: 20000,
  SOLD_OUT: 12000,
  CANCELED: 8000,
};

const TRADE_PENDING_COUNT = 10000;
const NOTIFICATION_COUNT = 20000;

const HEAVY_USER_COUNT = 10;
const HEAVY_SALES_PER_USER = 150;
const HEAVY_TRADES_PER_USER = 150;
const HEAVY_OWNED_PER_USER = 200;
const HEAVY_NOTIFICATIONS_PER_USER = 150;

const BATCH_SIZE = 5000;
const LOG_UNIT = 100;

const passwordHash = await bcrypt.hash('Password1234!', 10);

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

const notificationTypes = [
  'PURCHASE_COMPLETED',
  'SALE_COMPLETED',
  'SOLD_OUT',
  'TRADE_CANCELED_BY_SOLD_OUT',
  'TRADE_PROPOSED',
  'TRADE_CANCELED',
  'TRADE_ACCEPTED',
  'TRADE_REJECTED',
  'SALE_STOPPED',
  'SALE_UPDATED',
];

const notificationTargetTypes = ['MY_GALLERY', 'MY_SALE_PAGE', 'SALE_DETAIL'];

const validateEnvironment = () => {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl?.includes(PERFORMANCE_HOST)) {
    throw new Error(
      '❌ performance-test DB가 아닙니다. seed 실행을 중단합니다.',
    );
  }

  console.log('✅ performance-test DB 확인 완료');
};

const createManyInBatches = async ({
  model,
  totalCount,
  label,
  createData,
}) => {
  let progress = 0;

  for (let start = 0; start < totalCount; start += BATCH_SIZE) {
    const count = Math.min(BATCH_SIZE, totalCount - start);
    const data = createData(start, count);

    await model.createMany({ data });

    const inserted = start + count;

    while (progress + LOG_UNIT <= inserted) {
      progress += LOG_UNIT;
      console.log(
        `📦 ${label}: ${progress.toLocaleString()} / ${totalCount.toLocaleString()}`,
      );
    }
  }

  if (progress < totalCount) {
    console.log(
      `📦 ${label}: ${totalCount.toLocaleString()} / ${totalCount.toLocaleString()}`,
    );
  }

  console.log(`✅ ${label} 완료`);
};

const clearData = async () => {
  console.log('🧹 기존 데이터 초기화 중...');

  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      histories,
      notifications,
      trades,
      sale_logs,
      point_transactions,
      sales,
      user_photocards,
      photocards,
      reward_states,
      refresh_tokens,
      user_points,
      users
    RESTART IDENTITY CASCADE;
  `);

  console.log('✅ 기존 데이터 초기화 완료');
};

const getSaleQuantity = (index) => (index % 3) + 1;

const getSaleRemainingQuantity = (index, quantity) => {
  return (index % quantity) + 1;
};

const getSeller = (users, index) => {
  const heavySaleTotal = HEAVY_USER_COUNT * HEAVY_SALES_PER_USER;

  if (index < heavySaleTotal) {
    return users[Math.floor(index / HEAVY_SALES_PER_USER)];
  }

  return users[index % users.length];
};

const getBuyer = (users, index, sellerUuid) => {
  let buyer = users[(index + 777) % users.length];

  if (buyer.uuid === sellerUuid) {
    buyer = users[(index + 778) % users.length];
  }

  return buyer;
};

const getTradeProposer = (users, index) => {
  const heavyTradeTotal = HEAVY_USER_COUNT * HEAVY_TRADES_PER_USER;

  if (index < heavyTradeTotal) {
    return users[Math.floor(index / HEAVY_TRADES_PER_USER)];
  }

  return users[(index + 333) % users.length];
};

const createUsers = async () => {
  await createManyInBatches({
    model: prisma.user,
    totalCount: USER_COUNT,
    label: 'users',
    createData: (start, count) =>
      Array.from({ length: count }, (_, i) => {
        const index = start + i + 1;

        return {
          email: `user${index}@test.com`,
          passwordHash,
          nickname: `대용량유저${index}`,
          provider: 'LOCAL',
        };
      }),
  });

  const rows = await prisma.user.findMany({
    where: {
      email: {
        startsWith: 'user',
        endsWith: '@test.com',
      },
    },
    select: {
      uuid: true,
      email: true,
    },
  });

  const users = Array(USER_COUNT);

  rows.forEach((user) => {
    const number = Number(user.email.match(/^user(\d+)@test\.com$/)?.[1]);

    if (number) {
      users[number - 1] = user;
    }
  });

  if (users.some((user) => !user)) {
    throw new Error('유저 조회 결과가 USER_COUNT와 일치하지 않습니다.');
  }

  return users;
};

const createUserPoints = async (users) => {
  await createManyInBatches({
    model: prisma.userPoint,
    totalCount: users.length,
    label: 'user_points',
    createData: (start, count) =>
      users.slice(start, start + count).map((user) => ({
        userUuid: user.uuid,
        balance: 10000000,
      })),
  });
};

const createRewardStates = async (users) => {
  await createManyInBatches({
    model: prisma.rewardState,
    totalCount: users.length,
    label: 'reward_states',
    createData: (start, count) =>
      users.slice(start, start + count).map((user) => ({
        userUuid: user.uuid,
        lastDrawAt: new Date(),
      })),
  });
};

const createPhotocards = async (users) => {
  await createManyInBatches({
    model: prisma.photocard,
    totalCount: PHOTOCARD_COUNT,
    label: 'photocards',
    createData: (start, count) =>
      Array.from({ length: count }, (_, i) => {
        const index = start + i;

        return {
          creatorUuid: users[index % users.length].uuid,
          name: `대용량 포토카드 ${index + 1}`,
          imageUrl: `https://picsum.photos/seed/large-photocard-${index + 1}/400/600`,
          description: `대용량 포토카드 ${index + 1} 설명입니다.`,
          grade: grades[index % grades.length],
          genre: genres[index % genres.length],
          totalQuantity: COPIES_PER_PHOTOCARD,
          price: 1000 + (index % 1000) * 10,
        };
      }),
  });

  return prisma.photocard.findMany({
    where: {
      name: {
        startsWith: '대용량 포토카드',
      },
    },
    select: {
      id: true,
      price: true,
    },
    orderBy: {
      id: 'asc',
    },
  });
};

const buildPlans = ({ users, photocards }) => {
  const usageByPhotocardIndex = Array(PHOTOCARD_COUNT).fill(0);
  let photocardCursor = 0;

  const userPhotocards = [];
  const sales = [];
  const salePlans = [];
  const tradePlans = [];

  const allocateCopies = (count) => {
    while (
      photocardCursor < PHOTOCARD_COUNT &&
      usageByPhotocardIndex[photocardCursor] + count > COPIES_PER_PHOTOCARD
    ) {
      photocardCursor += 1;
    }

    if (photocardCursor >= PHOTOCARD_COUNT) {
      throw new Error('포토카드 발급 가능 수량을 초과했습니다.');
    }

    const photocardIndex = photocardCursor;
    const startSerial = usageByPhotocardIndex[photocardIndex] + 1;
    usageByPhotocardIndex[photocardIndex] += count;

    return Array.from({ length: count }, (_, i) => ({
      photocardIndex,
      photocard: photocards[photocardIndex],
      serialNumber: startSerial + i,
    }));
  };

  const addUserPhotocard = ({ copy, ownerUuid, status }) => {
    userPhotocards.push({
      photocardId: copy.photocard.id,
      ownerUuid,
      serialNumber: copy.serialNumber,
      status,
      acquiredAt: new Date(),
    });
  };

  const totalSales =
    SALE_COUNTS.SALE + SALE_COUNTS.SOLD_OUT + SALE_COUNTS.CANCELED;

  for (let index = 0; index < totalSales; index++) {
    const seller = getSeller(users, index);

    let status = 'SALE';
    let quantity = getSaleQuantity(index);
    let remainingQuantity = getSaleRemainingQuantity(index, quantity);

    if (index >= SALE_COUNTS.SALE + SALE_COUNTS.SOLD_OUT) {
      status = 'CANCELED';
      quantity = getSaleQuantity(index);
      remainingQuantity = quantity;
    } else if (index >= SALE_COUNTS.SALE) {
      status = 'SOLD_OUT';
      quantity = getSaleQuantity(index);
      remainingQuantity = 0;
    }

    const copies = allocateCopies(quantity);
    const photocard = copies[0].photocard;
    const buyer = getBuyer(users, index, seller.uuid);

    copies.forEach((copy, copyIndex) => {
      if (status === 'SALE' && copyIndex < remainingQuantity) {
        addUserPhotocard({
          copy,
          ownerUuid: seller.uuid,
          status: 'ON_SALE',
        });

        return;
      }

      if (status === 'CANCELED') {
        addUserPhotocard({
          copy,
          ownerUuid: seller.uuid,
          status: 'OWNED',
        });

        return;
      }

      addUserPhotocard({
        copy,
        ownerUuid: buyer.uuid,
        status: 'OWNED',
      });
    });

    sales.push({
      userUuid: seller.uuid,
      photocardId: photocard.id,
      price: photocard.price,
      quantity,
      remainingQuantity,
      status,
      desiredGrade: grades[(index + 1) % grades.length],
      desiredGenre: genres[(index + 1) % genres.length],
      desiredDescription: `대용량 판매글 ${index + 1} 교환 희망 설명입니다.`,
    });

    salePlans.push({
      status,
      sellerUuid: seller.uuid,
      buyerUuid: buyer.uuid,
      photocardId: photocard.id,
      quantity,
      remainingQuantity,
      soldQuantity: quantity - remainingQuantity,
      price: photocard.price,
    });
  }

  for (let index = 0; index < TRADE_PENDING_COUNT; index++) {
    const proposer = getTradeProposer(users, index);
    const copy = allocateCopies(1)[0];

    addUserPhotocard({
      copy,
      ownerUuid: proposer.uuid,
      status: 'TRADE_PENDING',
    });

    tradePlans.push({
      proposerUuid: proposer.uuid,
      offeredPhotocardId: copy.photocard.id,
    });
  }

  let heavyOwnedAdded = 0;

  while (userPhotocards.length < USER_PHOTOCARD_COUNT) {
    const copy = allocateCopies(1)[0];

    let owner =
      users[
        (copy.photocardIndex * COPIES_PER_PHOTOCARD + copy.serialNumber) %
          users.length
      ];

    if (heavyOwnedAdded < HEAVY_USER_COUNT * HEAVY_OWNED_PER_USER) {
      owner = users[Math.floor(heavyOwnedAdded / HEAVY_OWNED_PER_USER)];
      heavyOwnedAdded += 1;
    }

    addUserPhotocard({
      copy,
      ownerUuid: owner.uuid,
      status: 'OWNED',
    });
  }

  return {
    userPhotocards,
    sales,
    salePlans,
    tradePlans,
  };
};

const createUserPhotocards = async (userPhotocards) => {
  await createManyInBatches({
    model: prisma.userPhotocard,
    totalCount: userPhotocards.length,
    label: 'user_photocards',
    createData: (start, count) => userPhotocards.slice(start, start + count),
  });
};

const createSales = async (sales) => {
  await createManyInBatches({
    model: prisma.sale,
    totalCount: sales.length,
    label: 'sales',
    createData: (start, count) => sales.slice(start, start + count),
  });

  return prisma.sale.findMany({
    select: {
      id: true,
      userUuid: true,
      photocardId: true,
      price: true,
      quantity: true,
      remainingQuantity: true,
      status: true,
    },
    orderBy: {
      id: 'asc',
    },
  });
};

const createSaleLogsAndPointTransactions = async ({ saleRows, salePlans }) => {
  const logPlans = [];

  salePlans.forEach((plan, index) => {
    if (plan.soldQuantity <= 0) {
      return;
    }

    const sale = saleRows[index];

    logPlans.push({
      saleId: sale.id,
      buyerUuid: plan.buyerUuid,
      sellerUuid: plan.sellerUuid,
      photocardId: plan.photocardId,
      quantity: plan.soldQuantity,
      price: plan.price,
    });
  });

  await createManyInBatches({
    model: prisma.saleLog,
    totalCount: logPlans.length,
    label: 'sale_logs',
    createData: (start, count) => logPlans.slice(start, start + count),
  });

  await createManyInBatches({
    model: prisma.pointTransaction,
    totalCount: logPlans.length * 2,
    label: 'point_transactions',
    createData: (start, count) =>
      Array.from({ length: count }, (_, i) => {
        const globalIndex = start + i;
        const log = logPlans[Math.floor(globalIndex / 2)];
        const amount = log.price * log.quantity;

        if (globalIndex % 2 === 0) {
          return {
            userUuid: log.buyerUuid,
            amount,
            type: 'BUY',
          };
        }

        return {
          userUuid: log.sellerUuid,
          amount,
          type: 'SELL',
        };
      }),
  });
};

const createTrades = async ({ users }) => {
  const pendingCards = await prisma.userPhotocard.findMany({
    where: {
      status: 'TRADE_PENDING',
    },
    select: {
      id: true,
      ownerUuid: true,
    },
    orderBy: {
      id: 'asc',
    },
    take: TRADE_PENDING_COUNT,
  });

  const saleRows = await prisma.sale.findMany({
    where: {
      status: 'SALE',
    },
    select: {
      id: true,
      userUuid: true,
    },
    orderBy: {
      id: 'asc',
    },
  });

  const salesByUserUuid = new Map();

  saleRows.forEach((sale) => {
    if (!salesByUserUuid.has(sale.userUuid)) {
      salesByUserUuid.set(sale.userUuid, []);
    }

    salesByUserUuid.get(sale.userUuid).push(sale);
  });

  await createManyInBatches({
    model: prisma.trade,
    totalCount: pendingCards.length,
    label: 'trades',
    createData: (start, count) =>
      Array.from({ length: count }, (_, i) => {
        const index = start + i;
        const offeredCard = pendingCards[index];

        let sale = saleRows[index % saleRows.length];

        if (index < HEAVY_USER_COUNT * HEAVY_TRADES_PER_USER) {
          const proposerGroup = Math.floor(index / HEAVY_TRADES_PER_USER);
          const receiver = users[(proposerGroup + 1) % HEAVY_USER_COUNT];
          const receiverSales = salesByUserUuid.get(receiver.uuid);

          if (receiverSales?.length) {
            sale = receiverSales[index % receiverSales.length];
          }
        }

        if (sale.userUuid === offeredCard.ownerUuid) {
          sale = saleRows[(index + 1) % saleRows.length];
        }

        return {
          proposerUuid: offeredCard.ownerUuid,
          receiverUuid: sale.userUuid,
          saleId: sale.id,
          offeredCardId: offeredCard.id,
          status: 'PENDING',
          description: `대용량 교환 제안 ${index + 1} 설명입니다.`,
        };
      }),
  });
};

const createNotifications = async ({ users, saleRows }) => {
  await createManyInBatches({
    model: prisma.notification,
    totalCount: NOTIFICATION_COUNT,
    label: 'notifications',
    createData: (start, count) =>
      Array.from({ length: count }, (_, i) => {
        const index = start + i;

        let user = users[index % users.length];

        if (index < HEAVY_USER_COUNT * HEAVY_NOTIFICATIONS_PER_USER) {
          user = users[Math.floor(index / HEAVY_NOTIFICATIONS_PER_USER)];
        }

        const targetType =
          notificationTargetTypes[index % notificationTargetTypes.length];

        const sale = saleRows[index % saleRows.length];

        return {
          userUuid: user.uuid,
          type: notificationTypes[index % notificationTypes.length],
          targetType,
          targetId: targetType === 'SALE_DETAIL' ? sale.id : null,
          isRead: index % 3 === 0,
        };
      }),
  });
};

const validateData = async () => {
  console.log('📊 검증 결과');

  const saleRemainingSum = await prisma.sale.aggregate({
    where: {
      status: 'SALE',
    },
    _sum: {
      remainingQuantity: true,
    },
  });

  const pendingTradeCount = await prisma.trade.count({
    where: {
      status: 'PENDING',
    },
  });

  const soldQuantitySum = await prisma.saleLog.aggregate({
    _sum: {
      quantity: true,
    },
  });

  console.table({
    users: await prisma.user.count(),
    userPoints: await prisma.userPoint.count(),
    rewardStates: await prisma.rewardState.count(),
    photocards: await prisma.photocard.count(),
    userPhotocards: await prisma.userPhotocard.count(),
    sales: await prisma.sale.count(),
    trades: await prisma.trade.count(),
    saleLogs: await prisma.saleLog.count(),
    pointTransactions: await prisma.pointTransaction.count(),
    notifications: await prisma.notification.count(),

    ownedCards: await prisma.userPhotocard.count({
      where: { status: 'OWNED' },
    }),
    onSaleCards: await prisma.userPhotocard.count({
      where: { status: 'ON_SALE' },
    }),
    tradePendingCards: await prisma.userPhotocard.count({
      where: { status: 'TRADE_PENDING' },
    }),

    saleSales: await prisma.sale.count({
      where: { status: 'SALE' },
    }),
    soldOutSales: await prisma.sale.count({
      where: { status: 'SOLD_OUT' },
    }),
    canceledSales: await prisma.sale.count({
      where: { status: 'CANCELED' },
    }),

    saleRemainingSum: saleRemainingSum._sum.remainingQuantity ?? 0,
    pendingTradeCount,
    soldQuantitySum: soldQuantitySum._sum.quantity ?? 0,
  });
};

const main = async () => {
  validateEnvironment();

  console.time('qa-large-seed');

  await clearData();

  console.time('createUsers');
  const users = await createUsers();
  console.timeEnd('createUsers');

  console.time('createUserPoints');
  await createUserPoints(users);
  console.timeEnd('createUserPoints');

  console.time('createRewardStates');
  await createRewardStates(users);
  console.timeEnd('createRewardStates');

  console.time('createPhotocards');
  const photocards = await createPhotocards(users);
  console.timeEnd('createPhotocards');

  console.time('buildPlans');
  const plans = buildPlans({ users, photocards });
  console.timeEnd('buildPlans');

  console.time('createSales');
  const saleRows = await createSales(plans.sales);
  console.timeEnd('createSales');

  console.time('createUserPhotocards');
  await createUserPhotocards(plans.userPhotocards);
  console.timeEnd('createUserPhotocards');

  console.time('createSaleLogsAndPointTransactions');
  await createSaleLogsAndPointTransactions({
    saleRows,
    salePlans: plans.salePlans,
  });
  console.timeEnd('createSaleLogsAndPointTransactions');

  console.time('createTrades');
  await createTrades({ users });
  console.timeEnd('createTrades');

  console.time('createNotifications');
  await createNotifications({ users, saleRows });
  console.timeEnd('createNotifications');

  await validateData();

  console.timeEnd('qa-large-seed');
};

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
