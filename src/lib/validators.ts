import { z } from 'zod';

export const TaskStatusEnum = z.enum(['TODO', 'IN_PROGRESS', 'DONE']);
export const TaskPriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH']);
const NO_PROJECT_UI_VALUE = '__NO_PROJECT__';

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().optional(),
  projectId: z.preprocess(
    (val) => (val === NO_PROJECT_UI_VALUE || val === '' ? null : val),
    z.string().uuid().nullable().optional()
  ),
  dueDate: z.date().optional().nullable(),
  assigneeIds: z.array(z.string().uuid()).optional().default([]),
  status: TaskStatusEnum.optional().default('TODO'),
  priority: TaskPriorityEnum.optional().default('MEDIUM'),
  tags: z
    .array(z.object({ id: z.string().uuid(), name: z.string() }))
    .optional(),
});

export const updateTaskSchema = createTaskSchema.extend({
  id: z.string().uuid(),
});

export const createProjectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().optional(),
});

export const updateProjectSchema = createProjectSchema.extend({
  id: z.string().uuid(),
});

export const updateUserProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100).optional(),
  image: z.string().url('Must be a valid URL').optional().nullable(),
});

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signUpSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100)
      .optional(),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });
