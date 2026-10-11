import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import logger from '@/config/logger';
import { errorHandler } from '@/middleware/error.middleware';
import authRoutes from '@/routes/auth.route';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(cors());
app.use(cookieParser());
app.use(
  morgan('combined', {
    stream: { write: (message: string) => logger.info(message.trim()) },
  })
);

app.get('/', (_req, res) => {
  logger.info('Hello from Acquisitions API');
  res.status(200).send('Hello from Acquisitions!');
});

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get('/api', (_req, res) => {
  res.status(200).json({ message: 'Acquisitions API is running' });
});

app.use('/api/auth', authRoutes);

// Global error handler
app.use(errorHandler);

export default app;
