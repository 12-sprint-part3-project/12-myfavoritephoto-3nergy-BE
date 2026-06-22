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

router.get('/:saleId/me', authenticate, getMyTradesBySaleController);

router.get('/:saleId', authenticate, getReceivedTradesBySaleController);

router.post(
  '/:saleId',
  authenticate,
  validate(createTradeBodySchema),
  createTradeController,
);

router.patch('/:tradeId/cancel', authenticate, cancelTradeController);

router.patch('/:tradeId/accept', authenticate, acceptTradeController);

router.patch('/:tradeId/reject', authenticate, rejectTradeController);

export default router;
