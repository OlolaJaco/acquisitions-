import express from 'express';
import logger from '@/config/logger';
import helment from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helment());
app.use(cors());
app.use(cookieParser());
app.use(morgan('combined', { stream: { write: (message: string) => logger.info(message.trim()) } }));


app.get('/', (req, res) => {
  logger.info('Hello from Acquisitions API');

  res.status(200).send('Hello from Acquisitions!');
});

export default app;
