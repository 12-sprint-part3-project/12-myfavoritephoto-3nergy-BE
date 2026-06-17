import express from 'express';
import {
  login,
  signup,
  refreshAccessToken,
  logout,
  googleLogin,
  googleCallbackLogin,
} from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { loginSchema, signupSchema } from '../validators/auth.schema.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', refreshAccessToken);
router.post('/logout', logout);
router.get('/google', googleLogin);
router.get('/google/callback', googleCallbackLogin);

router.get('/test', authenticate, (req, res) => {
  res.json({
    message: '인증 성공',
    user: req.user,
  });
});

export default router;
