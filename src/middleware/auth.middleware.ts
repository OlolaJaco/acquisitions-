import type { NextFunction, Request, Response } from 'express';
import { UnauthorizedError } from '@/utils/errors';
import { verifyToken, type JwtUserPayload } from '@/utils/jwt';

export interface AuthenticatedRequest extends Request {
  user?: JwtUserPayload;
}

export function authenticate(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) {
  try {
    let token: string | undefined;

    // Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      // Check cookies
      token = req.cookies.token;
    }

    if (!token) {
      throw new UnauthorizedError('Authentication token is required');
    }

    const payload = verifyToken(token);
    req.user = payload;

    return next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return next(error);
    }
    return next(
      new UnauthorizedError('Invalid or expired authentication token')
    );
  }
}
