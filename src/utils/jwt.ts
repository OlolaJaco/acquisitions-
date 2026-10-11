import jwt from 'jsonwebtoken';

export interface JwtUserPayload {
  id: number;
  email: string;
  role: string;
}

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured in environment variables');
  }
  return secret;
};

export function generateToken(
  payload: JwtUserPayload,
  expiresIn: string = '7d'
): string {
  const secret = getJwtSecret();
  return jwt.sign(payload, secret, {
    expiresIn: expiresIn as jwt.SignOptions['expiresIn'],
  });
}

export function verifyToken(token: string): JwtUserPayload {
  const secret = getJwtSecret();
  return jwt.verify(token, secret) as JwtUserPayload;
}
