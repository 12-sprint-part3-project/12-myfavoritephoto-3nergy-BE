import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.route.js';
import salesRouter from './routes/sales.route.js';
import galleryRouter from './routes/photocards.route.js';
import userRouter from './routes/user.route.js';
import pointRouter from './routes/point.route.js';
import { errorHandler } from './middlewares/error.middleware.js';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './docs/swagger.js';
import cookieParser from 'cookie-parser';
import { startRefreshTokenCleanupJob } from './jobs/refreshTokenCleanup.job.js';

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
app.use('/api/photocards', galleryRouter);
app.use('/api/users', userRouter);
app.use('/api/points', pointRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// test route
app.get('/', (req, res) => {
  res.send('API Server Running 🚀');
});

// cron jobs
startRefreshTokenCleanupJob();

// error handler
app.use(errorHandler);

export default app;
