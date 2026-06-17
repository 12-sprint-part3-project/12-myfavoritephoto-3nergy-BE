/**
 * @swagger
 * /api/photocards:
 *   get:
 *     summary: 보유 포토카드 목록 조회
 *     description: 로그인한 사용자가 보유한 포토카드 목록을 조회합니다.
 *     tags:
 *       - Photocards
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         required: false
 *         description: 포토카드 이름 및 설명 검색어
 *       - in: query
 *         name: grade
 *         schema:
 *           type: string
 *           enum: [common, rare, super_rare, legendary]
 *         required: false
 *         description: 등급 필터
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *           enum: [album, special, landscape, season_greeting, fan_meeting, concert, md, collage, branding, etc]
 *         required: false
 *         description: 장르 필터
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [latest, oldest, price_asc, price_desc]
 *           default: latest
 *         required: false
 *         description: 정렬 기준
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           default: 1
 *         required: false
 *         description: 페이지 번호
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: number
 *           default: 20
 *         required: false
 *         description: 페이지당 조회 개수
 *     responses:
 *       200:
 *         description: 보유 포토카드 목록 조회 성공
 *       400:
 *         description: 입력값 검증 실패
 *       401:
 *         description: 인증 실패
 *       500:
 *         description: 서버 내부 오류
 */

/**
 * @swagger
 * /api/photocards:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: 포토카드 생성
 *     description: 새로운 포토카드를 생성하고 발행 수량만큼 소유 포토카드를 생성합니다.
 *     tags:
 *       - Photocards
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - grade
 *               - genre
 *               - price
 *               - totalQuantity
 *               - imageUrl
 *             properties:
 *               name:
 *                 type: string
 *               grade:
 *                 type: string
 *                 enum: [common, rare, super_rare, legendary]
 *               genre:
 *                 type: string
 *                 enum: [album, special, landscape, season_greeting, fan_meeting, concert, md, collage, branding, etc]
 *               price:
 *                 type: integer
 *               totalQuantity:
 *                 type: integer
 *               imageUrl:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: 포토카드 생성 성공
 *       400:
 *         description: 입력값 검증 실패
 *       401:
 *         description: 인증 실패
 *       409:
 *         description: 월간 포토카드 생성 제한 초과
 *       500:
 *         description: 서버 내부 오류
 */

/**
 * @swagger
 * /api/photocards/{photocardId}/owned-quantity:
 *   get:
 *     summary: 포토카드 보유 수량 조회
 *     description: 현재 사용자가 보유 중인 특정 포토카드의 수량을 조회합니다.
 *     tags:
 *       - Photocards
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: photocardId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 포토카드 ID
 *     responses:
 *       200:
 *         description: 포토카드 보유 수량 조회 성공
 *       400:
 *         description: 요청 데이터가 올바르지 않습니다.
 *       401:
 *         description: 유효하지 않은 액세스 토큰입니다.
 *       500:
 *         description: 서버 내부 오류가 발생했습니다.
 */
