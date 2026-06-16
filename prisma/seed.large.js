import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PERFORMANCE_HOST = 'ep-broad-smoke-ap6mjus1';

const USER_COUNT = 10000;
const PHOTOCARD_COUNT = 50000;
const COPIES_PER_PHOTOCARD = 4;

const SALE_COUNTS = {
  SALE: 25000,
  SOLD_OUT: 15000,
  CANCELED: 10000,
};

const TRADE_PENDING_COUNT = 10000;

const BATCH_SIZE = 5000;
const LOG_UNIT = 100;

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

const validateEnvironment = () => {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl?.includes(PERFORMANCE_HOST)) {
    throw new Error(
      '❌ performance-test DB가 아닙니다. seed 실행을 중단합니다.',
    );
  }

  console.log('✅ performance-test DB 확인 완료');
};

const createManyInBatches = async ({ model, data, label }) => {
  const total = data.length;
  let progress = 0;

  for (let i = 0; i < total; i += BATCH_SIZE) {
    await model.createMany({
      data: data.slice(i, i + BATCH_SIZE),
    });

    const inserted = Math.min(i + BATCH_SIZE, total);

    while (progress + LOG_UNIT <= inserted) {
      progress += LOG_UNIT;
      console.log(
        `📦 ${label}: ${progress.toLocaleString()} / ${total.toLocaleString()}`,
      );
    }
  }

  if (progress < total) {
    console.log(
      `📦 ${label}: ${total.toLocaleString()} / ${total.toLocaleString()}`,
    );
  }

  console.log(`✅ ${label} 완료`);
};

const clearData = async () => {
  console.log('🧹 기존 데이터 삭제 중...');

  await prisma.trade.deleteMany();
  await prisma.saleLog.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.userPhotocard.deleteMany();
  await prisma.photocard.deleteMany();
  await prisma.pointTransaction.deleteMany();
  await prisma.userPoint.deleteMany();
  await prisma.rewardState.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ 기존 데이터 삭제 완료');
};

const createUsers = async () => {
  const users = Array.from({ length: USER_COUNT }, (_, index) => ({
    email: `large-user-${index + 1}@test.com`,
    passwordHash: 'seed-password',
    nickname: `대용량유저${index + 1}`,
    provider: 'LOCAL',
  }));

  await createManyInBatches({
    model: prisma.user,
    data: users,
    label: 'users',
  });

  return prisma.user.findMany({
    where: { email: { startsWith: 'large-user-' } },
    select: { uuid: true },
    orderBy: { createdAt: 'asc' },
  });
};

const createUserPoints = async (users) => {
  await createManyInBatches({
    model: prisma.userPoint,
    data: users.map((user) => ({
      userUuid: user.uuid,
      balance: 10000000,
    })),
    label: 'user_points',
  });
};

const createPhotocards = async (users) => {
  const photocards = Array.from({ length: PHOTOCARD_COUNT }, (_, index) => ({
    creatorUuid: users[index % users.length].uuid,
    name: `대용량 포토카드 ${index + 1}`,
    imageUrl: `https://picsum.photos/seed/large-photocard-${index + 1}/400/600`,
    description: `대용량 포토카드 ${index + 1} 설명입니다.`,
    grade: grades[index % grades.length],
    genre: genres[index % genres.length],
    totalQuantity: 10,
    price: 1000 + (index % 1000) * 10,
  }));

  await createManyInBatches({
    model: prisma.photocard,
    data: photocards,
    label: 'photocards',
  });

  return prisma.photocard.findMany({
    where: { name: { startsWith: '대용량 포토카드' } },
    select: { id: true, price: true },
    orderBy: { id: 'asc' },
  });
};

const createUserPhotocards = async ({ users, photocards }) => {
  const saleStart = 0;
  const saleEnd = SALE_COUNTS.SALE;

  const tradeStart = SALE_COUNTS.SALE;
  const tradeEnd = SALE_COUNTS.SALE + TRADE_PENDING_COUNT;

  const userPhotocards = [];

  for (
    let photocardIndex = 0;
    photocardIndex < photocards.length;
    photocardIndex++
  ) {
    const seller = users[photocardIndex % users.length];
    const proposer = users[(photocardIndex + 1) % users.length];

    for (
      let serialNumber = 1;
      serialNumber <= COPIES_PER_PHOTOCARD;
      serialNumber++
    ) {
      let status = 'OWNED';
      let ownerUuid =
        users[(photocardIndex + serialNumber) % users.length].uuid;

      if (
        photocardIndex >= saleStart &&
        photocardIndex < saleEnd &&
        serialNumber <= 2
      ) {
        status = 'ON_SALE';
        ownerUuid = seller.uuid;
      }

      if (
        photocardIndex >= tradeStart &&
        photocardIndex < tradeEnd &&
        serialNumber === 3
      ) {
        status = 'TRADE_PENDING';
        ownerUuid = proposer.uuid;
      }

      userPhotocards.push({
        photocardId: photocards[photocardIndex].id,
        ownerUuid,
        serialNumber,
        status,
        acquiredAt: new Date(),
      });
    }
  }

  await createManyInBatches({
    model: prisma.userPhotocard,
    data: userPhotocards,
    label: 'user_photocards',
  });
};

const createSales = async ({ users, photocards }) => {
  const totalSales =
    SALE_COUNTS.SALE + SALE_COUNTS.SOLD_OUT + SALE_COUNTS.CANCELED;
  const sales = [];

  for (let index = 0; index < totalSales; index++) {
    const seller = users[index % users.length];
    const photocard = photocards[index];

    let status = 'SALE';

    if (index >= SALE_COUNTS.SALE + SALE_COUNTS.SOLD_OUT) {
      status = 'CANCELED';
    } else if (index >= SALE_COUNTS.SALE) {
      status = 'SOLD_OUT';
    }

    sales.push({
      userUuid: seller.uuid,
      photocardId: photocard.id,
      price: photocard.price,
      quantity: 2,
      remainingQuantity: status === 'SOLD_OUT' ? 0 : 2,
      status,
      desiredGrade: grades[(index + 1) % grades.length],
      desiredGenre: genres[(index + 1) % genres.length],
      desiredDescription: `대용량 판매글 ${index + 1} 교환 희망 설명입니다.`,
    });
  }

  await createManyInBatches({
    model: prisma.sale,
    data: sales,
    label: 'sales',
  });
};

const createTrades = async () => {
  const pendingCards = await prisma.userPhotocard.findMany({
    where: { status: 'TRADE_PENDING' },
    select: { id: true, ownerUuid: true },
    orderBy: { id: 'asc' },
    take: TRADE_PENDING_COUNT,
  });

  const sales = await prisma.sale.findMany({
    where: { status: 'SALE' },
    select: { id: true, userUuid: true },
    orderBy: { id: 'asc' },
    take: TRADE_PENDING_COUNT,
  });

  const trades = pendingCards.map((card, index) => ({
    proposerUuid: card.ownerUuid,
    receiverUuid: sales[index].userUuid,
    saleId: sales[index].id,
    offeredCardId: card.id,
    status: 'PENDING',

    // 최신 schema에 description 필드가 있으면 유지
    description: `대용량 교환 제안 ${index + 1} 설명입니다.`,
  }));

  await createManyInBatches({
    model: prisma.trade,
    data: trades,
    label: 'trades',
  });
};

const validateData = async () => {
  console.log('📊 검증 결과');

  console.log({
    users: await prisma.user.count(),
    userPoints: await prisma.userPoint.count(),
    photocards: await prisma.photocard.count(),
    userPhotocards: await prisma.userPhotocard.count(),
    sales: await prisma.sale.count(),
    trades: await prisma.trade.count(),

    ownedCards: await prisma.userPhotocard.count({
      where: { status: 'OWNED' },
    }),
    onSaleCards: await prisma.userPhotocard.count({
      where: { status: 'ON_SALE' },
    }),
    tradePendingCards: await prisma.userPhotocard.count({
      where: { status: 'TRADE_PENDING' },
    }),

    saleSales: await prisma.sale.count({ where: { status: 'SALE' } }),
    soldOutSales: await prisma.sale.count({ where: { status: 'SOLD_OUT' } }),
    canceledSales: await prisma.sale.count({ where: { status: 'CANCELED' } }),
  });
};

const main = async () => {
  validateEnvironment();

  console.time('large-seed');

  await clearData();

  console.time('createUsers');
  const users = await createUsers();
  console.timeEnd('createUsers');

  console.time('createUserPoints');
  await createUserPoints(users);
  console.timeEnd('createUserPoints');

  console.time('createPhotocards');
  const photocards = await createPhotocards(users);
  console.timeEnd('createPhotocards');

  console.time('createUserPhotocards');
  await createUserPhotocards({ users, photocards });
  console.timeEnd('createUserPhotocards');

  console.time('createSales');
  await createSales({ users, photocards });
  console.timeEnd('createSales');

  console.time('createTrades');
  await createTrades();
  console.timeEnd('createTrades');

  await validateData();

  console.timeEnd('large-seed');
};

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
