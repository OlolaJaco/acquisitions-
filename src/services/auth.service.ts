import { eq } from 'drizzle-orm';
import { db } from '@/config/database';
import { users } from '@/models/user.model';
import { comparePassword, hashPassword } from '@/utils/password';
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from '@/utils/errors';
import { generateToken } from '@/utils/jwt';
import type { SignInInput, SignUpInput } from '@/validations/auth.validation';

export async function createUser(input: SignUpInput) {
  const normalizedEmail = input.email.toLowerCase().trim();

  // Check if a user with this email already exists
  const [existingUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  if (existingUser) {
    throw new ConflictError('A user with this email already exists');
  }

  // Hash password using native bcrypt
  const hashedPassword = await hashPassword(input.password);

  // Insert user into Postgres
  const [createdUser] = await db
    .insert(users)
    .values({
      name: input.name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: input.role || 'user',
    })
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      created_at: users.created_at,
      updated_at: users.updated_at,
    });

  const token = generateToken({
    id: createdUser.id,
    email: createdUser.email,
    role: createdUser.role,
  });

  return { user: createdUser, token };
}

export async function signInUser(input: SignInInput) {
  const normalizedEmail = input.email.toLowerCase().trim();

  // Find user by email
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Verify password
  const isPasswordValid = await comparePassword(input.password, user.password);
  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Generate JWT token
  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  // Omit password from returned user object
  const { password: _pw, ...safeUser } = user;

  return {
    user: safeUser,
    token,
  };
}

export async function getUserById(id: number) {
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      created_at: users.created_at,
      updated_at: users.updated_at,
    })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return user;
}
