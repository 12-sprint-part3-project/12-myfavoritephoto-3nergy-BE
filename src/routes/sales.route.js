import express from 'express';
import {
  getSalesController,
  createSaleController,
  getMySalesController,
  getSaleDetailController,
  updateSaleController,
  cancelSaleController,
  purchaseSaleController,
} from '../controllers/sales.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate, validateQuery } from '../middlewares/validate.middleware.js';
import {
  getSalesListQuerySchema,
  getMySalesQuerySchema,
} from '../validators/photocardQuery.schema.js';
import {
  createSaleBodySchema,
  updateSaleBodySchema,
  purchaseSaleBodySchema,
} from '../validators/photocardBody.schema.js';

const router = express.Router();

router.get(
  '/',
  authenticate,
  validateQuery(getSalesListQuerySchema),
  getSalesController,
);

router.post(
  '/',
  authenticate,
  validate(createSaleBodySchema),
  createSaleController,
);

router.get(
  '/me',
  authenticate,
  validateQuery(getMySalesQuerySchema),
  getMySalesController,
);

router.get('/:saleId', authenticate, getSaleDetailController);

router.patch(
  '/:saleId',
  authenticate,
  validate(updateSaleBodySchema),
  updateSaleController,
);

router.patch('/:saleId/cancel', authenticate, cancelSaleController);

router.post(
  '/:saleId/purchase',
  authenticate,
  validate(purchaseSaleBodySchema),
  purchaseSaleController,
);

export default router;
