import express from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { getMyPointController } from '../controllers/point.controller.js';

const router = express.Router();

router.get('/me', authenticate, getMyPointController);

export default router;
