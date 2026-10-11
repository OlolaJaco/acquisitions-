import { z } from 'zod';

export const signUpSchema = z.object({
  name: z
    .string({
      error: 'Name is required',
    })
    .trim()
    .min(2, { message: 'Name must be at least 2 characters long' })
    .max(255, { message: 'Name must be at most 255 characters long' }),
  email: z
    .string({
      error: 'Email is required',
    })
    .trim()
    .email({ message: 'Invalid email address' })
    .max(255, { message: 'Email must be at most 255 characters long' }),
  password: z
    .string({
      error: 'Password is required',
    })
    .min(8, { message: 'Password must be at least 8 characters long' })
    .max(100, { message: 'Password must be at most 100 characters long' }),
  role: z.enum(['user', 'admin']).optional().default('user'),
});

export type SignUpInput = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: z
    .string({
      error: 'Email is required',
    })
    .trim()
    .email({ message: 'Invalid email address' }),
  password: z
    .string({
      error: 'Password is required',
    })
    .min(1, { message: 'Password is required' }),
});

export type SignInInput = z.infer<typeof signInSchema>;
