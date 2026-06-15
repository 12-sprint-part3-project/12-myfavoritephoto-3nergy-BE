import { ERROR_CODES } from '../constants/errorCodes';
import { AppError } from '../errors/AppError';
import {
  createNotification,
  findNotificationByIdAndUserUuid,
  findNotificationsByUserUuid,
  markNotificationAsRead,
} from '../repositories/notification.repository';

// 알림생성
export const createNotificationService = async ({
  userUuid,
  type,
  targetType,
  targetId = null,
}) => {
  return createNotification({
    userUuid,
    type,
    targetType,
    targetId,
  });
};

// 내 알림 목록 조회
export const getMyNotificationsService = async (userUuid) => {
  return findNotificationsByUserUuid(userUuid);
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
