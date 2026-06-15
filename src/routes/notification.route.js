import express from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import {
  getMyNotifications,
  readNotification,
} from '../controllers/notification.controller.js';
import { validateParams } from '../middlewares/validate.middleware.js';
import { notificationIdParamSchema } from '../validators/notification.schema.js';

const router = express.Router();
/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: 내 알림 목록 조회
 *     tags:
 *       - Notification
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 알림 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       type:
 *                         type: string
 *                         example: TRADE_PROPOSED
 *                       targetType:
 *                         type: string
 *                         example: SALE_DETAIL
 *                       targetId:
 *                         type: integer
 *                         nullable: true
 *                         example: 1
 *                       isRead:
 *                         type: boolean
 *                         example: false
 *                 error:
 *                   nullable: true
 *                   example: null
 *       401:
 *         description: 인증 실패
 */
// 내 알림 목록 조회
router.get('/', authenticate, getMyNotifications);

/**
 * @swagger
 * /api/notifications/{notificationId}/read:
 *   patch:
 *     summary: 알림 읽음 처리
 *     description: 특정 알림을 읽음 상태로 변경합니다.
 *     tags:
 *       - Notification
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 알림 ID
 *     responses:
 *       200:
 *         description: 알림 읽음 처리 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     type:
 *                       type: string
 *                       example: TRADE_PROPOSED
 *                     targetType:
 *                       type: string
 *                       example: SALE_DETAIL
 *                     targetId:
 *                       type: integer
 *                       nullable: true
 *                       example: 1
 *                     isRead:
 *                       type: boolean
 *                       example: true
 *                 error:
 *                   nullable: true
 *                   example: null
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패
 *       404:
 *         description: 알림을 찾을 수 없음
 */
// 내 알림 읽음 처리
router.patch(
  '/:notificationId/read',
  validateParams(notificationIdParamSchema),
  authenticate,
  readNotification,
);

export default router;
