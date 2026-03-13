import { z } from 'zod';

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Enter email or username'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;