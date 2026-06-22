import express from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import {
  getEventPointStatusController,
  getMyPointController,
  rewardEventPointController,
} from '../controllers/point.controller.js';

const router = express.Router();

router.get('/me', authenticate, getMyPointController);

router.get('/event', authenticate, getEventPointStatusController);
router.post('/event', authenticate, rewardEventPointController);

export default router;
