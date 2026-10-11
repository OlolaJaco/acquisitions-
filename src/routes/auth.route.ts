import express from 'express';
import {
  getMeHandler,
  signInHandler,
  signOutHandler,
  signUpHandler,
} from '@/controllers/auth.controller';
import { authenticate } from '@/middleware/auth.middleware';

const authRoutes = express.Router();

authRoutes.post('/sign-up', signUpHandler);
authRoutes.post('/sign-in', signInHandler);
authRoutes.post('/sign-out', signOutHandler);
authRoutes.get('/me', authenticate, getMeHandler);

export default authRoutes;
