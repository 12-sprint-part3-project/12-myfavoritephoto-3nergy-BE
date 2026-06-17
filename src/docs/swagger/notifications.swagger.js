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

/**
 * @swagger
 * /api/notifications/subscribe:
 *   get:
 *     summary: 실시간 알림 SSE 구독
 *     description: Server-Sent Events(SSE)를 통해 로그인한 사용자의 실시간 알림을 구독합니다.
 *     tags:
 *       - Notification
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: SSE 연결 성공
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: string
 *               example: "event: notification\ndata: {\"type\":\"TRADE_PROPOSED\"}\n\n"
 *       401:
 *         description: 인증 실패
 */
