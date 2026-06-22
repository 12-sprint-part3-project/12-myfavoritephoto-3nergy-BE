import express from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import {
  getMyNotifications,
  readNotification,
  subscribeNotification,
} from '../controllers/notification.controller.js';
import { validateParams } from '../middlewares/validate.middleware.js';
import { notificationIdParamSchema } from '../validators/notification.schema.js';

const router = express.Router();

// 내 알림 목록 조회
router.get('/', authenticate, getMyNotifications);

// 내 알림 읽음 처리
router.patch(
  '/:notificationId/read',
  validateParams(notificationIdParamSchema),
  authenticate,
  readNotification,
);

// 실시간 알림 SSE 구독
router.get('/subscribe', authenticate, subscribeNotification);

export default router;
