import express from 'express';
import { getMyInfo } from '../controllers/user.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: 내 정보 조회
 *     description: Access Token을 이용하여 로그인한 사용자의 정보를 조회합니다.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 내 정보 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 내 정보 조회에 성공했습니다.
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         uuid:
 *                           type: string
 *                           example: b54f60f5-2608-4aab-bb59-a2220bff75ff
 *                         email:
 *                           type: string
 *                           example: test123@example.com
 *                         nickname:
 *                           type: string
 *                           example: 테스터3
 *                         provider:
 *                           type: string
 *                           example: LOCAL
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                 error:
 *                   nullable: true
 *                   example: null
 *
 *       401:
 *         description: 인증 실패
 *
 *       404:
 *         description: 사용자를 찾을 수 없음
 *
 *       500:
 *         description: 서버 내부 오류
 */
router.get('/me', authenticate, getMyInfo);

export default router;
