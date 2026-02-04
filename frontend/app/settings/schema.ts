import * as z from 'zod';

export const AccountSettingsSchema = z.object({
  name: z.string().min(1, 'Name is required').min(2, 'Name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  avatar: z.union([z.string().url('Must be a valid URL'), z.literal('')]).optional(),
  description: z.string().max(500, 'Max 500 characters').optional(),
});

export type AccountSettingsForm = z.infer<typeof AccountSettingsSchema>;
