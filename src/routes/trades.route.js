import express from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import {
  getReceivedTradesBySaleController,
  createTradeController,
  cancelTradeController,
  getMyTradesBySaleController,
  acceptTradeController,
  rejectTradeController,
} from '../controllers/trades.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createTradeBodySchema } from '../validators/trades.schema.js';

const router = express.Router();

/**
 * @swagger
 * /api/trades/{saleId}/me:
 *   get:
 *     summary: 판매글별 내가 제시한 교환 목록 조회
 *     description: 로그인한 사용자가 특정 판매글에 제시한 PENDING 상태의 교환 목록을 조회합니다.
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
 *           example: 273
 *         description: 내가 제시한 교환 목록을 조회할 판매글 ID
 *     responses:
 *       200:
 *         description: 내가 제시한 교환 목록 조회 성공
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 trades:
 *                   - id: 51
 *                     status: PENDING
 *                     offeredCard:
 *                       id: 1584
 *                       userPhotocardId: 2301
 *                       name: 스페인 여행
 *                       imageUrl: https://picsum.photos/seed/photocard-1040/400/600
 *                       grade: common
 *                       genre: landscape
 *                       price: 11400
 *                       description: 이 카드로 교환 제안합니다.
 *                     receiver:
 *                       uuid: receiver-user-uuid
 *                       nickname: 유저1
 *                     createdAt: 2026-06-14T05:30:00.000Z
 *               error: null
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
router.get('/:saleId/me', authenticate, getMyTradesBySaleController);

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

/**
 * @swagger
 * /api/trades/{saleId}:
 *   post:
 *     summary: 교환 제안 생성
 *     description: 로그인한 사용자가 특정 판매글에 대해 보유한 포토카드 1장으로 교환 제안을 생성합니다.
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
 *         description: 교환 제안할 판매글 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - offeredCardId
 *               - description
 *             properties:
 *               offeredCardId:
 *                 type: integer
 *                 example: 10
 *                 description: 교환 제안에 사용할 UserPhotocard ID
 *               description:
 *                 type: string
 *                 example: 이 카드로 교환 제안합니다.
 *                 description: 교환 제안 내용
 *     responses:
 *       201:
 *         description: 교환 제안 생성 성공
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: 1
 *                 saleId: 1
 *                 offeredCardId: 10
 *                 description: 갖고 싶다
 *                 status: PENDING
 *                 createdAt: 2026-06-02T08:30:00.000Z
 *               error: null
 *       400:
 *         description: 입력값 검증 실패
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               data: null
 *               error:
 *                 code: INVALID_INPUT
 *                 message: 입력값이 올바르지 않습니다.
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
 *       403:
 *         description: 권한 없음
 *         content:
 *           application/json:
 *             examples:
 *               CANNOT_TRADE_OWN_SALE:
 *                 summary: 본인 판매글에 교환 제안
 *                 value:
 *                   success: false
 *                   data: null
 *                   error:
 *                     code: CANNOT_TRADE_OWN_SALE
 *                     message: 본인의 판매글에는 교환을 제안할 수 없습니다.
 *               NOT_CARD_OWNER:
 *                 summary: 본인 소유 카드가 아님
 *                 value:
 *                   success: false
 *                   data: null
 *                   error:
 *                     code: NOT_CARD_OWNER
 *                     message: 본인이 소유한 카드만 교환 제안할 수 있습니다.
 *       404:
 *         description: 리소스를 찾을 수 없음
 *         content:
 *           application/json:
 *             examples:
 *               SALE_NOT_FOUND:
 *                 summary: 판매글 없음
 *                 value:
 *                   success: false
 *                   data: null
 *                   error:
 *                     code: SALE_NOT_FOUND
 *                     message: 존재하지 않는 판매글입니다.
 *               OFFERED_CARD_NOT_FOUND:
 *                 summary: 제안 카드 없음
 *                 value:
 *                   success: false
 *                   data: null
 *                   error:
 *                     code: OFFERED_CARD_NOT_FOUND
 *                     message: 교환 제안 카드가 존재하지 않습니다.
 *       409:
 *         description: 현재 요청을 처리할 수 없는 상태
 *         content:
 *           application/json:
 *             examples:
 *               SALE_NOT_TRADEABLE:
 *                 summary: 교환 제안할 수 없는 판매글
 *                 value:
 *                   success: false
 *                   data: null
 *                   error:
 *                     code: SALE_NOT_TRADEABLE
 *                     message: 현재 교환 제안할 수 없는 판매글입니다.
 *               CARD_NOT_AVAILABLE_FOR_TRADE:
 *                 summary: 교환 제안할 수 없는 카드
 *                 value:
 *                   success: false
 *                   data: null
 *                   error:
 *                     code: CARD_NOT_AVAILABLE_FOR_TRADE
 *                     message: 현재 교환 제안할 수 없는 카드입니다.
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
router.post(
  '/:saleId',
  authenticate,
  validate(createTradeBodySchema),
  createTradeController,
);

/**
 * @swagger
 * /api/trades/{tradeId}/cancel:
 *   patch:
 *     summary: 교환 제안 취소
 *     description: 로그인한 사용자가 본인이 제안한 PENDING 상태의 교환 제안을 취소합니다.
 *     tags: [Trades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tradeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 취소할 교환 제안 ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 교환 제안 취소 성공
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: 1
 *                 status: CANCELED
 *               error: null
 *
 *       400:
 *         description: 입력값 검증 실패
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               data: null
 *               error:
 *                 code: INVALID_INPUT
 *                 message: 입력값이 올바르지 않습니다.
 *
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             examples:
 *               invalidToken:
 *                 summary: 유효하지 않은 Access Token
 *                 value:
 *                   success: false
 *                   data: null
 *                   error:
 *                     code: INVALID_ACCESS_TOKEN
 *                     message: 유효하지 않은 Access Token입니다.
 *
 *               expiredToken:
 *                 summary: Access Token 만료
 *                 value:
 *                   success: false
 *                   data: null
 *                   error:
 *                     code: ACCESS_TOKEN_EXPIRED
 *                     message: Access Token이 만료되었습니다.
 *
 *       403:
 *         description: 교환 제안 취소 권한 없음
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               data: null
 *               error:
 *                 code: NOT_TRADE_PROPOSER
 *                 message: 교환 제안을 생성한 사용자만 취소할 수 있습니다.
 *
 *       404:
 *         description: 존재하지 않는 교환 제안
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               data: null
 *               error:
 *                 code: TRADE_NOT_FOUND
 *                 message: 존재하지 않는 교환 제안입니다.
 *
 *       409:
 *         description: 처리할 수 없는 교환 상태
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               data: null
 *               error:
 *                 code: INVALID_TRADE_STATUS
 *                 message: 현재 상태에서는 교환 제안을 취소할 수 없습니다.
 *
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
router.patch('/:tradeId/cancel', authenticate, cancelTradeController);

/**
 * @swagger
 * /api/trades/{tradeId}/accept:
 *   patch:
 *     summary: 교환 제안 수락
 *     description: 판매자가 본인 판매글에 들어온 PENDING 상태의 교환 제안을 수락하고 카드 소유권을 교환합니다.
 *     tags: [Trades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tradeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 수락할 교환 제안 ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 교환 제안 수락 성공
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: 교환 제안을 수락했습니다.
 *               data:
 *                 id: 1
 *                 status: ACCEPTED
 *               error: null
 *       400:
 *         description: 입력값 검증 실패
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               data: null
 *               error:
 *                 code: INVALID_INPUT
 *                 message: 입력값이 올바르지 않습니다.
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             examples:
 *               invalidToken:
 *                 summary: 유효하지 않은 Access Token
 *                 value:
 *                   success: false
 *                   data: null
 *                   error:
 *                     code: INVALID_ACCESS_TOKEN
 *                     message: 유효하지 않은 Access Token입니다.
 *               expiredToken:
 *                 summary: Access Token 만료
 *                 value:
 *                   success: false
 *                   data: null
 *                   error:
 *                     code: ACCESS_TOKEN_EXPIRED
 *                     message: Access Token이 만료되었습니다.
 *       403:
 *         description: 교환 제안 수락 권한 없음
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               data: null
 *               error:
 *                 code: NOT_TRADE_RECEIVER
 *                 message: 교환 제안을 받은 사용자만 수락할 수 있습니다.
 *       404:
 *         description: 존재하지 않는 교환 제안
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               data: null
 *               error:
 *                 code: TRADE_NOT_FOUND
 *                 message: 존재하지 않는 교환 제안입니다.
 *       409:
 *         description: 교환 수락 불가
 *         content:
 *           application/json:
 *             examples:
 *               invalidTradeStatus:
 *                 summary: 처리할 수 없는 교환 상태
 *                 value:
 *                   success: false
 *                   data: null
 *                   error:
 *                     code: INVALID_TRADE_STATUS
 *                     message: 현재 상태에서는 교환 제안을 처리할 수 없습니다.
 *               invalidSaleStatus:
 *                 summary: 판매글 상태가 유효하지 않음
 *                 value:
 *                   success: false
 *                   data: null
 *                   error:
 *                     code: INVALID_SALE_STATUS
 *                     message: 현재 상태에서는 교환을 수락할 수 없는 판매글입니다.
 *               insufficientSaleQuantity:
 *                 summary: 판매글 잔여 수량 부족
 *                 value:
 *                   success: false
 *                   data: null
 *                   error:
 *                     code: INSUFFICIENT_SALE_QUANTITY
 *                     message: 판매 가능한 수량이 부족합니다.
 *               cardNotAvailableForTrade:
 *                 summary: 제안 카드 상태가 유효하지 않음
 *                 value:
 *                   success: false
 *                   data: null
 *                   error:
 *                     code: CARD_NOT_AVAILABLE_FOR_TRADE
 *                     message: 현재 교환할 수 없는 카드입니다.
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
router.patch('/:tradeId/accept', authenticate, acceptTradeController);

router.patch('/:tradeId/reject', authenticate, rejectTradeController);

export default router;
