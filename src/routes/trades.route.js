import express from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { getReceivedTradesBySaleController } from '../controllers/trades.controller.js';

const router = express.Router();

router.get(
  '/:saleId/received',
  authenticate,
  getReceivedTradesBySaleController,
);

export default router;
