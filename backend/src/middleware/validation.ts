import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
        return;
      }
      next(error);
    }
  };
};

// Validation schemas
export const authSchemas = {
  register: z.object({
    body: z.object({
      email: z.string().email('Invalid email format'),
      password: z.string().min(8, 'Password must be at least 8 characters'),
      name: z.string().min(2, 'Name must be at least 2 characters'),
    }),
  }),
  login: z.object({
    body: z.object({
      email: z.string().email('Invalid email format'),
      password: z.string().min(1, 'Password is required'),
    }),
  }),
};

export const postSchemas = {
  create: z.object({
    body: z.object({
      title: z.string().min(1, 'Title is required').max(255),
      content: z.string().optional(),
    }),
  }),
  update: z.object({
    params: z.object({
      id: z.string().uuid('Invalid post ID'),
    }),
    body: z.object({
      title: z.string().min(1).max(255).optional(),
      content: z.string().optional(),
    }),
  }),
  getById: z.object({
    params: z.object({
      id: z.string().uuid('Invalid post ID'),
    }),
  }),
};
