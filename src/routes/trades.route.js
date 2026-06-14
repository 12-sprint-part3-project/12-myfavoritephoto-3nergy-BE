import express from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import {
  getReceivedTradesBySaleController,
  createTradeController,
} from '../controllers/trades.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createTradeBodySchema } from '../validators/trades.schema.js';

const router = express.Router();

/**
 * @swagger
 * /api/trades/{saleId}:
 *   get:
 *     summary: 판매글별 받은 교환 제안 목록 조회
 *     description: 로그인한 판매자가 특정 판매글에 대해 받은 PENDING 상태의 교환 제안 목록을 조회합니다.
 *     tags:
 *       - Trades
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: saleId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: 교환 제안을 조회할 판매글 ID
 *     responses:
 *       200:
 *         description: 받은 교환 제안 목록 조회 성공
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
 *                   example: 받은 교환 제안 목록을 조회했습니다.
 *                 data:
 *                   type: object
 *                   properties:
 *                     trades:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           status:
 *                             type: string
 *                             example: PENDING
 *                           offeredCard:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                                 example: 12
 *                               userPhotocardId:
 *                                 type: integer
 *                                 example: 101
 *                               name:
 *                                 type: string
 *                                 example: 스페인 여행
 *                               imageUrl:
 *                                 type: string
 *                                 example: https://example.com/images/card-12.png
 *                               grade:
 *                                 type: string
 *                                 example: common
 *                               genre:
 *                                 type: string
 *                                 example: landscape
 *                               price:
 *                                 type: integer
 *                                 example: 4
 *                               description:
 *                                 type: string
 *                                 example: 스페인 여행 사진들 좋은데... 우리집 앞마당 포토카드와 교환하고 싶습니다.
 *                           proposer:
 *                             type: object
 *                             properties:
 *                               uuid:
 *                                 type: string
 *                                 example: proposer-user-uuid
 *                               nickname:
 *                                 type: string
 *                                 example: 프로마왕
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: 2026-06-02T08:30:00.000Z
 *                 error:
 *                   nullable: true
 *                   example: null
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             examples:
 *               ACCESS_TOKEN_MISSING:
 *                 summary: Access Token 누락
 *                 value:
 *                   success: false
 *                   data: null
 *                   error:
 *                     code: ACCESS_TOKEN_MISSING
 *                     message: Access Token이 필요합니다.
 *               ACCESS_TOKEN_EXPIRED:
 *                 summary: Access Token 만료
 *                 value:
 *                   success: false
 *                   data: null
 *                   error:
 *                     code: ACCESS_TOKEN_EXPIRED
 *                     message: Access Token이 만료되었습니다.
 *               INVALID_ACCESS_TOKEN:
 *                 summary: 유효하지 않은 Access Token
 *                 value:
 *                   success: false
 *                   data: null
 *                   error:
 *                     code: INVALID_ACCESS_TOKEN
 *                     message: 유효하지 않은 Access Token입니다.
 *       500:
 *         description: 서버 내부 오류
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               data: null
 *               error:
 *                 code: INTERNAL_SERVER_ERROR
 *                 message: 서버 내부 오류가 발생했습니다.
 */
router.get('/:saleId', authenticate, getReceivedTradesBySaleController);

router.post(
  '/:saleId',
  authenticate,
  validate(createTradeBodySchema),
  createTradeController,
);

export default router;
