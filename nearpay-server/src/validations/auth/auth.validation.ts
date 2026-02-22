import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().min(1, 'Email is required').email('Please provide a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    role: z.enum(['user', 'admin', 'provider'] as const)
  })
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string().min(1, 'Email is required').email('Please provide a valid email address'),
        password: z.string().min(1, 'Password is required'),
    })
});

export type RegisterRequestType = z.infer<typeof registerSchema>['body'];
export type LoginRequestType = z.infer<typeof loginSchema>['body'];

export const validateRegister = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    try {
        const validatedData = registerSchema.parse({
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

export const validateLogin = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    try {
        const validatedData = loginSchema.parse({
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
