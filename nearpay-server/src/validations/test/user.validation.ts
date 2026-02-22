import { Request, Response, NextFunction } from 'express';

import { z } from 'zod';

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().min(1, 'Email is required').email('Please provide a valid email address'),
    age: z.number().min(0, 'Age must be a positive number').optional(),
  })
});

export type CreateUserRequestType = z.infer<typeof createUserSchema>['body'];

export const validateCreateUser = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const validatedData = createUserSchema.parse({
      body: req.body,
    });


    req.body = validatedData.body;

    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: error.issues.map((e) => ({
          field: e.path[e.path.length - 1],
          message: e.message,
        })),
      });
      return;
    }

    next(error);
  }
};

