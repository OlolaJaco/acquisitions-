import type { CookieOptions, NextFunction, Request, Response } from 'express';
import logger from '@/config/logger';
import type { AuthenticatedRequest } from '@/middleware/auth.middleware';
import { createUser, getUserById, signInUser } from '@/services/auth.service';
import { AppError } from '@/utils/errors';
import { signInSchema, signUpSchema } from '@/validations/auth.validation';

const COOKIE_NAME = 'token';

const getCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

export async function signUpHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const parseResult = signUpSchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parseResult.error.flatten().fieldErrors,
      });
    }

    const { user, token } = await createUser(parseResult.data);

    logger.info(`User registered successfully: ${user.email} (ID: ${user.id})`);

    res.cookie(COOKIE_NAME, token, getCookieOptions());

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    return next(error);
  }
}

export async function signInHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const parseResult = signInSchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parseResult.error.flatten().fieldErrors,
      });
    }

    const { user, token } = await signInUser(parseResult.data);

    logger.info(`User signed in: ${user.email} (ID: ${user.id})`);

    res.cookie(COOKIE_NAME, token, getCookieOptions());

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    return next(error);
  }
}

export async function signOutHandler(
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  res.clearCookie(COOKIE_NAME, getCookieOptions());

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
}

export async function getMeHandler(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const user = await getUserById(req.user.id);

    return res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    return next(error);
  }
}
