import express from 'express';
import {
  login,
  signup,
  refreshToken,
  logout,
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

router.post('/refresh', refreshToken);

router.post('/logout', logout);

router.get('/test', authenticate, (req, res) => {
  res.json({
    message: '인증 성공',
    user: req.user,
  });
});

console.log('auth route loaded');

export default router;
