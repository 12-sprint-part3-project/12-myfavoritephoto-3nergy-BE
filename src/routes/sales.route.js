import express from 'express';
import {
  getSalesController,
  createSaleController,
  getMySalesController,
  getSaleDetailController,
  updateSaleController,
} from '../controllers/sales.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate, validateQuery } from '../middlewares/validate.middleware.js';
import {
  getSalesListQuerySchema,
  getMySalesQuerySchema,
} from '../validators/photocardQuery.schema.js';
import { createSaleBodySchema } from '../validators/photocardBody.schema.js';

const router = express.Router();

/**
 * @swagger
 * /api/sales:
 *   get:
 *     summary: 판매 목록 조회
 *     description: 마켓플레이스에 등록된 판매 포토카드 목록을 조회합니다.
 *     tags:
 *       - Marketplace
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [SALE, SOLD_OUT]
 *         required: false
 *         description: 판매 상태 필터. 미입력 시 전체 조회
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
 *           maximum: 100
 *         required: false
 *         description: 페이지당 조회 개수
 *     responses:
 *       200:
 *         description: 판매 목록 조회 성공
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
 *                       saleId:
 *                         type: number
 *                         example: 266
 *                       price:
 *                         type: number
 *                         example: 1000
 *                       quantity:
 *                         type: number
 *                         example: 1
 *                       remainingQuantity:
 *                         type: number
 *                         example: 1
 *                       status:
 *                         type: string
 *                         example: SALE
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2026-06-09T07:47:14.921Z
 *                       photocard:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: number
 *                             example: 435
 *                           name:
 *                             type: string
 *                             example: 테스트 포토카드 97
 *                           imageUrl:
 *                             type: string
 *                             example: https://picsum.photos/seed/photocard-97/400/600
 *                           grade:
 *                             type: string
 *                             example: common
 *                           genre:
 *                             type: string
 *                             example: md
 *                           description:
 *                             type: string
 *                             example: 테스트 포토카드 97 설명입니다.
 *                       seller:
 *                         type: object
 *                         properties:
 *                           uuid:
 *                             type: string
 *                             example: 894e34e4-5e64-472e-990d-cc1b260267a4
 *                           nickname:
 *                             type: string
 *                             example: 유저10
 *                 meta:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: number
 *                       example: 1
 *                     pageSize:
 *                       type: number
 *                       example: 2
 *                     totalCount:
 *                       type: number
 *                       example: 61
 *                     totalPages:
 *                       type: number
 *                       example: 31
 *                     hasNextPage:
 *                       type: boolean
 *                       example: true
 *                 error:
 *                   nullable: true
 *                   example: null
 *       400:
 *         description: 입력값 검증 실패
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 data:
 *                   nullable: true
 *                   example: null
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: INVALID_INPUT
 *                     message:
 *                       type: string
 *                       example: 입력값이 올바르지 않습니다.
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 data:
 *                   nullable: true
 *                   example: null
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: INVALID_ACCESS_TOKEN
 *                     message:
 *                       type: string
 *                       example: 인증이 필요합니다.
 *       500:
 *         description: 서버 내부 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 data:
 *                   nullable: true
 *                   example: null
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: INTERNAL_SERVER_ERROR
 *                     message:
 *                       type: string
 *                       example: 서버 내부 오류가 발생했습니다.
 */
router.get(
  '/',
  authenticate,
  validateQuery(getSalesListQuerySchema),
  getSalesController,
);

/**
 * @swagger
 * /api/sales:
 *   post:
 *     summary: 판매 등록
 *     description: 보유 중인 포토카드를 판매 등록합니다.
 *     tags:
 *       - Sales
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - photocardId
 *               - price
 *               - quantity
 *               - desiredGrade
 *               - desiredGenre
 *               - desiredDescription
 *             properties:
 *               photocardId:
 *                 type: integer
 *                 example: 1
 *                 description: 판매할 포토카드 ID
 *               price:
 *                 type: integer
 *                 example: 1000
 *                 description: 장당 판매 가격
 *               quantity:
 *                 type: integer
 *                 example: 3
 *                 description: 판매 등록할 수량
 *               desiredGrade:
 *                 type: string
 *                 enum: [common, rare, super_rare, legendary]
 *                 example: common
 *                 description: 희망 교환 등급
 *               desiredGenre:
 *                 type: string
 *                 enum: [album, special, landscape, season_greeting, fan_meeting, concert, md, collage, branding, etc]
 *                 example: album
 *                 description: 희망 교환 장르
 *               desiredDescription:
 *                 type: string
 *                 example: "같은 등급 카드와 교환 희망합니다."
 *                 description: 희망 교환 설명
 *     responses:
 *       201:
 *         description: 판매 등록 성공
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 sale:
 *                   id: 1
 *                   photocardId: 1
 *                   price: 1000
 *                   quantity: 3
 *                   remainingQuantity: 3
 *                   status: SALE
 *                   desiredGrade: common
 *                   desiredGenre: album
 *                   desiredDescription: 같은 등급 카드와 교환 희망합니다.
 *                   createdAt: "2026-06-09T06:00:00.000Z"
 *               error: null
 *
 *       400:
 *         description: 입력값 검증 실패 또는 보유 수량 초과
 *         content:
 *           application/json:
 *             examples:
 *               INVALID_INPUT:
 *                 value:
 *                   success: false
 *                   data: null
 *                   error:
 *                     code: INVALID_INPUT
 *                     message: 입력값이 올바르지 않습니다.
 *
 *               NOT_ENOUGH_QUANTITY:
 *                 value:
 *                   success: false
 *                   data: null
 *                   error:
 *                     code: NOT_ENOUGH_QUANTITY
 *                     message: 판매 수량이 보유 수량을 초과했습니다.
 *
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             examples:
 *               ACCESS_TOKEN_EXPIRED:
 *                 value:
 *                   success: false
 *                   data: null
 *                   error:
 *                     code: ACCESS_TOKEN_EXPIRED
 *                     message: Access Token이 만료되었습니다.
 *
 *               INVALID_ACCESS_TOKEN:
 *                 value:
 *                   success: false
 *                   data: null
 *                   error:
 *                     code: INVALID_ACCESS_TOKEN
 *                     message: 유효하지 않은 Access Token입니다.
 *
 *       403:
 *         description: 본인 소유 카드가 아님
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               data: null
 *               error:
 *                 code: NOT_CARD_OWNER
 *                 message: 본인이 소유한 카드만 판매할 수 있습니다.
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
router.post(
  '/',
  authenticate,
  validate(createSaleBodySchema),
  createSaleController,
);

/**
 * @swagger
 * /api/sales/me:
 *   get:
 *     summary: 나의 판매 카드 목록 조회
 *     description: 로그인한 사용자의 판매 카드와 교환 제안 대기 중인 카드를 조회합니다.
 *     tags:
 *       - Sales
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
 *         name: saleMethod
 *         schema:
 *           type: string
 *           enum: [SALE, TRADE]
 *         required: false
 *         description: 목록 유형 필터. SALE은 판매글, TRADE는 교환 제안 대기 중인 카드
 *       - in: query
 *         name: isSoldOut
 *         schema:
 *           type: boolean
 *         required: false
 *         description: 매진 여부 필터
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
 *           type: integer
 *           default: 1
 *         required: false
 *         description: 페이지 번호
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 20
 *         required: false
 *         description: 페이지당 조회 개수
 *     responses:
 *       200:
 *         description: 나의 판매 카드 목록 조회 성공
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: 나의 판매 조회에 성공했습니다.
 *               data:
 *                 gradeCounts:
 *                   - grade: common
 *                     count: 20
 *                   - grade: rare
 *                     count: 8
 *                   - grade: super_rare
 *                     count: 3
 *                   - grade: legendary
 *                     count: 5
 *                 mySales:
 *                   - id: 1
 *                     name: 우리집 앞마당
 *                     imageUrl: https://example.com/images/card-1.png
 *                     grade: legendary
 *                     genre: landscape
 *                     price: 4000
 *                     remainingQuantity: 1
 *                     nickname: 최애의포토
 *                     displayStatus: SALE
 *                   - id: 2
 *                     name: How Far I'll Go
 *                     imageUrl: https://example.com/images/card-2.png
 *                     grade: rare
 *                     genre: landscape
 *                     price: 4000
 *                     remainingQuantity: 1
 *                     nickname: 칼스타
 *                     displayStatus: TRADE_PENDING
 *                   - id: 3
 *                     name: 바닷가 산책
 *                     imageUrl: https://example.com/images/card-3.png
 *                     grade: common
 *                     genre: landscape
 *                     price: 2000
 *                     remainingQuantity: 0
 *                     nickname: 최애의포토
 *                     displayStatus: SOLD_OUT
 *               meta:
 *                 page: 1
 *                 pageSize: 20
 *                 totalCount: 21
 *                 totalPages: 2
 *                 hasNextPage: true
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
 *         description: 인증 실패 또는 Access Token 만료
 *         content:
 *           application/json:
 *             examples:
 *               invalidAccessToken:
 *                 summary: 유효하지 않은 Access Token
 *                 value:
 *                   success: false
 *                   data: null
 *                   error:
 *                     code: INVALID_ACCESS_TOKEN
 *                     message: 유효하지 않은 Access Token입니다.
 *               accessTokenExpired:
 *                 summary: Access Token 만료
 *                 value:
 *                   success: false
 *                   data: null
 *                   error:
 *                     code: ACCESS_TOKEN_EXPIRED
 *                     message: Access Token이 만료되었습니다.
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
router.get(
  '/me',
  authenticate,
  validateQuery(getMySalesQuerySchema),
  getMySalesController,
);

/**
 * @swagger
 * /api/sales/{saleId}:
 *   get:
 *     summary: 판매 상세 조회
 *     description: saleId를 기반으로 판매 상세 정보를 조회합니다.
 *     tags:
 *       - Sales
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: saleId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: 판매 ID
 *     responses:
 *       200:
 *         description: 판매 상세 조회 성공
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: 판매 상세 조회에 성공했습니다.
 *               data:
 *                 saleId: 1
 *                 price: 1000
 *                 quantity: 3
 *                 remainingQuantity: 2
 *                 status: SALE
 *                 createdAt: "2026-06-02T08:30:00.000Z"
 *                 updatedAt: "2026-06-02T08:30:00.000Z"
 *                 photocard:
 *                   id: 1
 *                   name: IVE 포토카드
 *                   imageUrl: https://example.com/image.png
 *                   description: 앨범 포토카드입니다.
 *                   grade: rare
 *                   genre: album
 *                 seller:
 *                   uuid: 9c6b1c7e-7e4a-4c5a-9f6d-8c3f2b1a1234
 *                   nickname: 홍길동
 *                 desiredGrade: rare
 *                 desiredGenre: album
 *                 desiredDescription: 희망 교환 조건입니다.
 *               error: null
 *       404:
 *         description: 판매글을 찾을 수 없음
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               data: null
 *               error:
 *                 code: SALE_NOT_FOUND
 *                 message: 존재하지 않는 판매글입니다.
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
router.get('/:saleId', authenticate, getSaleDetailController);

router.patch('/:saleId', authenticate, validate(), updateSaleController);
export default router;
