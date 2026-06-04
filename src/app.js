import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.route.js';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './docs/swagger.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// test route
app.get('/', (req, res) => {
  res.send('API Server Running 🚀');
});

export default app;
