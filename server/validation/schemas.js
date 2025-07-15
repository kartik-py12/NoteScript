import { z } from 'zod';

// User registration schema
const registerSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters long')
    .max(50, 'Name must be less than 50 characters'),
  email: z.string()
    .email('Please provide a valid email address')
    .toLowerCase(),
  password: z.string()
    .min(6, 'Password must be at least 6 characters long')
    .max(100, 'Password must be less than 100 characters')
});

// User login schema
const loginSchema = z.object({
  email: z.string()
    .email('Please provide a valid email address')
    .toLowerCase(),
  password: z.string()
    .min(1, 'Password is required')
});

// Note schema
const noteSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  content: z.string()
    .min(1, 'Content is required'),
  tags: z.array(z.string()).optional().default([]),
  isPublic: z.boolean().optional().default(false)
});

// Update note schema (all fields optional)
const updateNoteSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .optional(),
  content: z.string()
    .min(1, 'Content is required')
    .optional(),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().optional()
});

export {
  registerSchema,
  loginSchema,
  noteSchema,
  updateNoteSchema
};
