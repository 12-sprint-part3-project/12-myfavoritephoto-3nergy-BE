import express from 'express';
import { getCardsController } from '../controllers/gallery.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validateQuery } from '../middlewares/validate.middleware.js';
import { getGalleryListQuerySchema } from '../validators/photocardQuery.schema.js';

const router = express.Router();

/**
 * @swagger
 * /api/gallery:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: 보유 목록 조회
 *     description: 마이 갤러리에 등록된 보유 포토카드 목록을 조회합니다.
 *     tags:
 *       - MyGallery
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
 *         description: 판매 목록 조회 성공
 *       400:
 *         description: 입력값 검증 실패
 *       500:
 *         description: 서버 내부 오류
 */
router.get(
  '/',
  authenticate,
  validateQuery(getGalleryListQuerySchema),
  getCardsController,
);

export default router;
