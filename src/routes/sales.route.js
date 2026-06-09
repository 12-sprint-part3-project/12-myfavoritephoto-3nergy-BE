import express from 'express';
import {
  getSalesController,
  getSaleDetailController,
  getMySalesController,
  createSaleController,
} from '../controllers/sales.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validateQuery } from '../middlewares/validate.middleware.js';
import {
  getSalesListQuerySchema,
  getMySalesQuerySchema,
} from '../validators/photocard.schema.js';

const router = express.Router();

/**
 * @swagger
 * /api/sales:
 *   get:
 *     summary: 판매 목록 조회
 *     description: 마켓플레이스에 등록된 판매 포토카드 목록을 조회합니다.
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
 *         description: 포토카드 이름 및 설명 검색
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
 *         description: 판매 상태 필터, 미입력 시 전체 조회"
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
 *         description: 판매 목록 조회 성공
 *       400:
 *         description: 입력값 검증 실패
 *       500:
 *         description: 서버 내부 오류
 */
router.get(
  '/',
  authenticate,
  validateQuery(getSalesListQuerySchema),
  getSalesController,
);

router.post('/', authenticate, createSaleController);

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
 *         description: 포토카드 이름 및 설명 검색
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
 *         description: 판매 방법 필터
 *       - in: query
 *         name: isSoldOut
 *         schema:
 *           type: boolean
 *         required: false
 *         description: 매진 여부
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
 *                     count: 4
 *                   - grade: rare
 *                     count: 1
 *                   - grade: super_rare
 *                     count: 0
 *                   - grade: legendary
 *                     count: 2
 *                 mySales:
 *                   - id: 1
 *                     name: 테스트 포토카드 1
 *                     imageUrl: https://picsum.photos/seed/photocard-1/400/600
 *                     grade: common
 *                     genre: album
 *                     price: 1100
 *                     remainingQuantity: 4
 *                     nickname: 유저1
 *                     displayStatus: SALE
 *                   - id: 3
 *                     name: 테스트 포토카드 3
 *                     imageUrl: https://picsum.photos/seed/photocard-3/400/600
 *                     grade: super_rare
 *                     genre: landscape
 *                     price: 1300
 *                     remainingQuantity: 0
 *                     nickname: 유저1
 *                     displayStatus: SOLD_OUT
 *                   - id: 7
 *                     name: 테스트 포토카드 8
 *                     imageUrl: https://picsum.photos/seed/photocard-8/400/600
 *                     grade: legendary
 *                     genre: concert
 *                     price: 1800
 *                     remainingQuantity: 1
 *                     nickname: 유저1
 *                     displayStatus: TRADE_PENDING
 *               meta:
 *                 page: 1
 *                 pageSize: 20
 *                 totalCount: 7
 *                 totalPages: 1
 *                 hasNextPage: false
 *               error: null
 *       400:
 *         description: 입력값 검증 실패
 *       401:
 *         description: 인증 실패
 *       500:
 *         description: 서버 내부 오류
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
 *       - SaleDetail
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: saleId
 *         required: true
 *         schema:
 *           type: integer
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
 *                 sale:
 *                   saleId: 1
 *                   price: 1000
 *                   quantity: 3
 *                   remainingQuantity: 2
 *                   status: SALE
 *                   createdAt: "2026-06-02T08:30:00.000Z"
 *                   updatedAt: "2026-06-02T08:30:00.000Z"
 *                   photocard:
 *                     id: 1
 *                     name: IVE 포토카드
 *                     imageUrl: https://example.com/image.png
 *                     description: 앨범 포토카드입니다.
 *                     grade: rare
 *                     genre: album
 *                   seller:
 *                     uuid: 9c6b1c7e-7e4a-4c5a-9f6d-8c3f2b1a1234
 *                     nickname: 홍길동
 *                   desiredGrade: rare
 *                   desiredGenre: album
 *                   desiredDescription: 희망 교환 조건입니다.
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
 */
router.get('/:saleId', authenticate, getSaleDetailController);

export default router;
