import express from 'express';
import {
  login,
  signup,
  refreshToken,
  logout,
  googleLogin,
  googleCallbackLogin,
} from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { signupSchema } from '../validators/auth.schema.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

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
router.post('/signup', validate(signupSchema), signup);

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
router.post('/login', login);

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
router.post('/refresh', refreshToken);

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
router.post('/logout', logout);

router.get('/google', googleLogin);
router.get('/google/callback', googleCallbackLogin);

router.get('/test', authenticate, (req, res) => {
  res.json({
    message: '인증 성공',
    user: req.user,
  });
});

console.log('auth route loaded');

export default router;
