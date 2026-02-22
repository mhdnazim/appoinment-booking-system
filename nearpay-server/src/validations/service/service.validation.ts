import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const createServiceSchema = z.object({
    body: z.object({
        providerId: z.string().regex(objectIdPattern, 'Invalid provider ID format'),
        name: z.string().min(1, 'Name is required'),
        duration: z.number().positive('Duration must be a positive number'),
        price: z.number().min(0, 'Price must be 0 or greater'),
    })
});

export const updateServiceSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Name is required').optional(),
        duration: z.number().positive('Duration must be a positive number').optional(),
        price: z.number().min(0, 'Price must be 0 or greater').optional(),
    })
});

export type CreateServiceRequestType = z.infer<typeof createServiceSchema>['body'];
export type UpdateServiceRequestType = z.infer<typeof updateServiceSchema>['body'];

export const validateCreateService = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    try {
        const validatedData = createServiceSchema.parse({
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

export const validateUpdateService = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    try {
        const validatedData = updateServiceSchema.parse({
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
