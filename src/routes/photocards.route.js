import express from 'express';
import {
  createPhotocardController,
  getCardsController,
  getOwnedPhotocardQuantityController,
} from '../controllers/photocards.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import {
  validate,
  validateParams,
  validateQuery,
} from '../middlewares/validate.middleware.js';
import { getGalleryListQuerySchema } from '../validators/photocardQuery.schema.js';
import { createPhotocardBodySchema } from '../validators/photocardCreate.schema.js';
import { photocardIdParamsSchema } from '../validators/photocardParams.schema.js';

const router = express.Router();

router.get(
  '/',
  authenticate,
  validateQuery(getGalleryListQuerySchema),
  getCardsController,
);

router.post(
  '/',
  authenticate,
  validate(createPhotocardBodySchema),
  createPhotocardController,
);

router.get(
  '/:photocardId/owned-quantity',
  authenticate,
  validateParams(photocardIdParamsSchema),
  getOwnedPhotocardQuantityController,
);

export default router;
