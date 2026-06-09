import { PrismaClient } from '@prisma/client';

const prismaClient = new PrismaClient();

// History에 기록할 대상 작업 (CUD) R은 제외
const CUD_OPERATIONS = ['create', 'update', 'delete'];

// 모델마다 PK 필드명이 다르므로 History.tableId에 저장할 식별자를 추출한다.
// 대부분의 모델은 id를 사용하고,
// User / RefreshToken은 uuid,
// UserPoint는 userUuid를 PK로 사용한다.
const getTableId = (result) => {
  const tableId = result.id ?? result.uuid ?? result.userUuid;

  if (!tableId) {
    return 'UNKNOWN';
  }

  return String(tableId);
};

// History에 저장하면 안 되는 민감 필드를 제거한다.
const sanitizeHistoryData = (data) => {
  if (!data) return data;

  const sanitized = { ...data };

  delete sanitized.passwordHash;
  delete sanitized.token;

  return sanitized;
};

const prisma = prismaClient.$extends({
  query: {
    $allModels: {
      // 모든 Prisma 모델의 쿼리를 가로챈다.
      async $allOperations({ model, operation, args, query }) {
        // create, update, delete가 아니면 이력 기록 없이 그대로 실행한다.
        // History 모델은 이력을 기록하면 무한 루프가 발생하므로 제외한다.
        if (!CUD_OPERATIONS.includes(operation) || model === 'History') {
          return query(args);
        }
        // UPDATE / DELETE는 변경 전 데이터를 조회한다.
        // CREATE는 기존 데이터가 없으므로 before는 null이다.
        const before =
          operation === 'update' || operation === 'delete'
            ? await prismaClient[model].findUnique({
                where: args.where,
              })
            : null;

        // 실제 CUD 작업을 실행한다.
        const result = await query(args);

        // CUD 작업 결과를 histories 테이블에 저장한다.
        try {
          await prismaClient.history.create({
            data: {
              tableName: model,
              tableId: getTableId(result),
              operationType: operation.toUpperCase(),
              data: {
                before: sanitizeHistoryData(before),
                after:
                  operation === 'delete' ? null : sanitizeHistoryData(result),
              },
            },
          });
        } catch (error) {
          console.error('History 기록 실패:', error);
        }
        return result;
      },
    },
  },
});

export default prisma;
