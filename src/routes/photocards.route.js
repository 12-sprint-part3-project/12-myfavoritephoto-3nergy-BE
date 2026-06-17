import express from 'express';
import {
  createPhotocardController,
  getCardsController,
  getOwnedPhotocardQuantityController,
} from '../controllers/photocards.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate, validateQuery } from '../middlewares/validate.middleware.js';
import { getGalleryListQuerySchema } from '../validators/photocardQuery.schema.js';
import { createPhotocardBodySchema } from '../validators/photocardCreate.schema.js';

const router = express.Router();

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
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 gradeCounts:
 *                   - grade: common
 *                     count: 32
 *                   - grade: rare
 *                     count: 26
 *                   - grade: super_rare
 *                     count: 31
 *                   - grade: legendary
 *                     count: 31
 *                 genreCounts:
 *                   - genre: album
 *                     count: 14
 *                   - genre: special
 *                     count: 12
 *                   - genre: landscape
 *                     count: 11
 *                   - genre: season_greeting
 *                     count: 11
 *                   - genre: fan_meeting
 *                     count: 12
 *                   - genre: concert
 *                     count: 9
 *                   - genre: md
 *                     count: 13
 *                   - genre: collage
 *                     count: 13
 *                   - genre: branding
 *                     count: 13
 *                   - genre: etc
 *                     count: 12
 *                 photocards:
 *                   - id: 1584
 *                     userPhotocardIds:
 *                       - 3213
 *                     name: 테스트 포토카드 1040
 *                     imageUrl: https://picsum.photos/seed/photocard-1040/400/600
 *                     grade: common
 *                     genre: album
 *                     price: 11400
 *                     description: 테스트 포토카드 1040 설명입니다.
 *                     quantity: 1
 *                     ownerNickname: 유저10
 *                     acquiredAt: 2026-06-14T07:27:34.648Z
 *               meta:
 *                 page: 1
 *                 pageSize: 20
 *                 totalCount: 120
 *                 totalPages: 6
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
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               data: null
 *               error:
 *                 code: INVALID_ACCESS_TOKEN
 *                 message: 유효하지 않은 Access Token입니다.
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
  '/',
  authenticate,
  validateQuery(getGalleryListQuerySchema),
  getCardsController,
);

/**
 * @swagger
 * /api/photocards:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: 포토카드 생성
 *     description: 새로운 포토카드를 생성하고 발행 수량만큼 소유 포토카드를 생성합니다.
 *     tags:
 *       - Photocard
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
 *                 example: 우리집 앞마당
 *                 description: 포토카드 이름
 *               grade:
 *                 type: string
 *                 enum: [common, rare, super_rare, legendary]
 *                 example: legendary
 *                 description: 포토카드 등급
 *               genre:
 *                 type: string
 *                 enum: [album, special, landscape, season_greeting, fan_meeting, concert, md, collage, branding, etc]
 *                 example: landscape
 *                 description: 포토카드 장르
 *               price:
 *                 type: integer
 *                 minimum: 0
 *                 example: 4
 *                 description: 포토카드 가격
 *               totalQuantity:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *                 example: 5
 *                 description: 발행 수량
 *               imageUrl:
 *                 type: string
 *                 example: https://example.com/images/card.png
 *                 description: 포토카드 이미지 URL
 *               description:
 *                 type: string
 *                 example: 우리집 앞마당 포토카드입니다.
 *                 description: 포토카드 설명
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
router.post(
  '/',
  authenticate,
  validate(createPhotocardBodySchema),
  createPhotocardController,
);

router.get(
  '/:photocardId/ownedQuantity',
  authenticate,
  getOwnedPhotocardQuantityController,
);

export default router;
