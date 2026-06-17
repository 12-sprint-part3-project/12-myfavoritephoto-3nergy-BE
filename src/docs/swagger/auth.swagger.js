/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: 회원가입
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - nickname
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: test@example.com
 *               password:
 *                 type: string
 *                 example: Password123!
 *               nickname:
 *                 type: string
 *                 example: 테스터
 *     responses:
 *       201:
 *         description: 회원가입 성공
 *       400:
 *         description: 잘못된 요청 또는 유효성 검사 실패
 *       409:
 *         description: 이미 사용 중인 이메일 또는 닉네임
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: 로그인
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@example.com
 *               password:
 *                 type: string
 *                 example: password1234
 *     responses:
 *       200:
 *         description: 로그인 성공
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 로그인 실패
 */

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Access Token 재발급
 *     description: HttpOnly Cookie에 저장된 Refresh Token을 검증하고 새로운 Access Token과 Refresh Token을 발급합니다.
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Access Token 재발급 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: Refresh Token이 없거나, 유효하지 않거나, 만료된 경우
 */

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: 로그아웃
 *     description: HttpOnly Cookie에 저장된 Refresh Token을 DB에서 삭제하고 쿠키를 제거합니다.
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: 로그아웃 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 로그아웃 되었습니다.
 */

/**
 * @swagger
 * /api/auth/google:
 *   get:
 *     summary: Google 로그인 페이지 이동
 *     description: Google OAuth 로그인 페이지로 리다이렉트합니다.
 *     tags:
 *       - Auth
 *     responses:
 *       302:
 *         description: Google 로그인 페이지로 리다이렉트
 */

/**
 * @swagger
 * /api/auth/google/callback:
 *   get:
 *     summary: Google 로그인 Callback 처리
 *     description: Google OAuth 인증 완료 후 전달받은 code로 사용자 정보를 조회하고 로그인 또는 자동 회원가입을 처리한 뒤, Refresh Token을 HttpOnly Cookie에 저장하고 프론트엔드로 리다이렉트합니다.
 *     tags:
 *       - Auth
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Google OAuth 인증 완료 후 전달받는 Authorization Code
 *     responses:
 *       302:
 *         description: Google 로그인 성공 후 프론트엔드로 리다이렉트
 *       400:
 *         description: Google Authorization Code가 없는 경우
 *       401:
 *         description: Google 인증 실패
 */
