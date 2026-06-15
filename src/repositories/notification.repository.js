import prisma from '../lib/prisma.js';

// 알림생성
export const createNotification = async ({
  userUuid,
  type,
  targetType,
  targetId = null,
}) => {
  return prisma.notification.create({
    data: {
      userUuid,
      type,
      targetType,
      targetId,
    },
  });
};

// userUuid로 알림정보찾기
export const findNotificationsByUserUuid = async (userUuid) => {
  return prisma.notification.findMany({
    where: {
      userUuid,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

// notificationId와 userUuid로 알림 조회
export const findNotificationByIdAndUserUuid = async (
  notificationId,
  userUuid,
) => {
  return prisma.notification.findFirst({
    where: {
      id: notificationId,
      userUuid,
    },
  });
};

// 알림 읽음 처리
export const markNotificationAsRead = async (notificationId) => {
  return prisma.notification.update({
    where: {
      id: notificationId,
    },
    data: {
      isRead: true,
    },
  });
};
