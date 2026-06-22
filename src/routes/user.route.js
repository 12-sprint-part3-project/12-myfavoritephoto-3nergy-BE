import express from 'express';
import { getMyInfo } from '../controllers/user.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/me', authenticate, getMyInfo);

export default router;
