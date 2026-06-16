import { sendSuccess } from '../helpers/response.helper.js';
import {
  getMyNotificationsService,
  readNotificationService,
} from '../services/notification.service.js';
import { addSseClient, removeSseClient } from '../utills/sse.js';
import { notificationIdParamSchema } from '../validators/notification.schema.js';

//내 알림 목록 조회
export const getMyNotifications = async (req, res, next) => {
  try {
    const userUuid = req.user.userUuid;

    const notifications = await getMyNotificationsService(userUuid);

    return sendSuccess(res, 200, { notifications });
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

// SSE 연결
export const subscribeNotification = async (req, res) => {
  const userUuid = req.user.userUuid;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  res.flushHeaders();

  addSseClient(userUuid, res);

  console.log('SSE connected:', userUuid);

  // 연결 확인용
  res.write(
    `event: connected\n` +
      `data: ${JSON.stringify({
        message: 'SSE Connected',
      })}\n\n`,
  );

  // 연결 유지용 heartbeat
  const heartbeat = setInterval(() => {
    res.write(`: heartbeat\n\n`);
  }, 30000);

  req.on('close', () => {
    clearInterval(heartbeat);

    console.log('SSE disconnected:', userUuid);

    removeSseClient(userUuid);
  });
};
