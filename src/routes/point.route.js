import express from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import {
  getMyPointController,
  rewardEventPointController,
} from '../controllers/point.controller.js';

const router = express.Router();

router.get('/me', authenticate, getMyPointController);

router.post('/event', authenticate, rewardEventPointController);

export default router;
