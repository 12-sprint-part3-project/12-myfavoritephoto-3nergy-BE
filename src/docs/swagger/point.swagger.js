/**
 * @swagger
 * /api/points/me:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: 내 포인트 조회
 *     description: 로그인한 사용자의 현재 보유 포인트를 조회합니다.
 *     tags:
 *       - Point
 *     responses:
 *       200:
 *         description: 내 포인트 조회 성공
 *       401:
 *         description: 인증 실패 또는 Access Token 만료
 *       404:
 *         description: 사용자를 찾을 수 없음
 *       500:
 *         description: 서버 내부 오류
 */

/**
 * @swagger
 * /api/points/event:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: 이벤트 포인트 참여 상태 조회
 *     description: 이벤트 포인트 뽑기 가능 여부와 다음 참여 가능 시간을 조회합니다.
 *     tags:
 *       - Point
 *     responses:
 *       200:
 *         description: 이벤트 포인트 참여 상태 조회 성공
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
 *                     canDraw:
 *                       type: boolean
 *                       example: false
 *                     serverTime:
 *                       type: string
 *                       format: date-time
 *                       example: "2026-06-22T04:47:15.855Z"
 *                     nextAvailableAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2026-06-22T05:46:56.206Z"
 *                     remainingMilliseconds:
 *                       type: integer
 *                       example: 3580351
 *                 error:
 *                   nullable: true
 *                   example: null
 *       401:
 *         description: 인증 실패 또는 Access Token 만료
 *       500:
 *         description: 서버 내부 오류
 */

/**
 * @swagger
 * /api/points/event:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: 이벤트 포인트 지급
 *     description: 랜덤 포인트를 지급받고, 다음 참여 가능 시간을 반환합니다.
 *     tags:
 *       - Point
 *     responses:
 *       200:
 *         description: 이벤트 포인트 지급 성공
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
 *                     point:
 *                       type: integer
 *                       example: 17
 *                     balance:
 *                       type: integer
 *                       example: 80079
 *                     canDraw:
 *                       type: boolean
 *                       example: false
 *                     serverTime:
 *                       type: string
 *                       format: date-time
 *                       example: "2026-06-22T04:46:56.206Z"
 *                     nextAvailableAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2026-06-22T05:46:56.206Z"
 *                     remainingMilliseconds:
 *                       type: integer
 *                       example: 3600000
 *                 error:
 *                   nullable: true
 *                   example: null
 *       401:
 *         description: 인증 실패 또는 Access Token 만료
 *       429:
 *         description: 이벤트 참여 제한
 *       500:
 *         description: 서버 내부 오류
 */
