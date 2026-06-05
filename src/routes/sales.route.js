import express from 'express';
import { getSales } from '../controllers/sales.controller.js';

const router = express.Router();

/**
 * @swagger
 * /api/sales:
 *   get:
 *     summary: 판매 목록 조회
 *     description: 마켓플레이스에 등록된 판매 포토카드 목록을 조회합니다.
 *     tags:
 *       - Marketplace
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
 *         required: false
 *         description: 등급 필터
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *         required: false
 *         description: 장르 필터
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         required: false
 *         description: 판매 상태 필터
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
router.get('/', getSales);

export default router;
