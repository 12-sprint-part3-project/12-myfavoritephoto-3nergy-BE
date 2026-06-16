import { ERROR_CODES } from '../constants/errorCodes.js';
import { AppError } from '../errors/AppError.js';
import {
  createNotification,
  findNotificationByIdAndUserUuid,
  findNotificationsByUserUuid,
  markNotificationAsRead,
} from '../repositories/notification.repository.js';

// 알림생성
export const createNotificationService = async (
  { userUuid, type, targetType, targetId = null, metadata = null },
  tx,
) => {
  return createNotification(
    {
      userUuid,
      type,
      targetType,
      targetId,
      metadata,
    },
    tx,
  );
};

// 내 알림 목록 조회
export const getMyNotificationsService = async (userUuid) => {
  const notifications = await findNotificationsByUserUuid(userUuid);

  return notifications.map((notification) => ({
    id: notification.id,
    type: notification.type,
    ...(notification.metadata ?? {}),
    targetType: notification.targetType,
    targetId: notification.targetId,
    isRead: notification.isRead,
    createdAt: notification.createdAt,
  }));
};

// 알림 읽음 처리
export const readNotificationService = async (notificationId, userUuid) => {
  const notification = await findNotificationByIdAndUserUuid(
    notificationId,
    userUuid,
  );

  if (!notification) {
    throw AppError(ERROR_CODES.NOTIFICATION_NOT_FOUND);
  }

  if (notification.isRead) {
    return notification;
  }

  return markNotificationAsRead(notificationId);
};
