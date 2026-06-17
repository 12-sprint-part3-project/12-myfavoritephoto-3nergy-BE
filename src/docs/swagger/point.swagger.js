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
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: 이벤트 포인트 지급
 *     description: 랜덤 상자를 선택하여 이벤트 포인트를 지급받습니다.
 *     tags:
 *       - Point
 *     responses:
 *       200:
 *         description: 이벤트 포인트 지급 성공
 *       401:
 *         description: 인증 실패 또는 Access Token 만료
 *       429:
 *         description: 이벤트 참여 제한
 *       500:
 *         description: 서버 내부 오류
 */
