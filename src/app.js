import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.route.js';
import salesRouter from './routes/sales.route.js';
import { errorHandler } from './middlewares/error.middleware.js';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './docs/swagger.js';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRouter);
app.use('/api/sales', salesRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// test route
app.get('/', (req, res) => {
  res.send('API Server Running 🚀');
});

app.use(errorHandler);

export default app;
