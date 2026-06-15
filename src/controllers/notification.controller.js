import { sendSuccess } from '../helpers/response.helper.js';
import {
  getMyNotificationsService,
  readNotificationService,
} from '../services/notification.service.js';
import { notificationIdParamSchema } from '../validators/notification.schema.js';

//내 알림 목록 조회
export const getMyNotifications = async (req, res, next) => {
  try {
    const userUuid = req.user.userUuid;

    const notifications = await getMyNotificationsService(userUuid);

    return sendSuccess(res, 200, notifications);
  } catch (error) {
    next(error);
  }
};

// 알림 읽음 처리
export const readNotification = async (req, res, next) => {
  try {
    const userUuid = req.user.userUuid;
    const notificationId = req.params.notificationId;

    const notification = await readNotificationService(
      notificationId,
      userUuid,
    );

    return sendSuccess(res, 200, notification);
  } catch (error) {
    next(error);
  }
};
