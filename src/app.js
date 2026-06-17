import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.route.js';
import salesRouter from './routes/sales.route.js';
import photocardsRouter from './routes/photocards.route.js';
import userRouter from './routes/user.route.js';
import pointRouter from './routes/point.route.js';
import tradesRouter from './routes/trades.route.js';
import notificationRouter from './routes/notification.route.js';
import { errorHandler } from './middlewares/error.middleware.js';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './docs/swagger.js';
import cookieParser from 'cookie-parser';
import { startRefreshTokenCleanupJob } from './jobs/refreshTokenCleanup.job.js';
import { ERROR_CODES } from './constants/errorCodes.js';
import { AppError } from './errors/AppError.js';

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRouter);
app.use('/api/sales', salesRouter);
app.use('/api/photocards', photocardsRouter);
app.use('/api/users', userRouter);
app.use('/api/points', pointRouter);
app.use('/api/trades', tradesRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// test route
app.get('/', (req, res) => {
  res.send('API Server Running 🚀');
});

// 404 처리
app.use((req, res, next) => {
  next(AppError(ERROR_CODES.NOT_FOUND));
});

// cron jobs
startRefreshTokenCleanupJob();

// error handler
app.use(errorHandler);

export default app;
