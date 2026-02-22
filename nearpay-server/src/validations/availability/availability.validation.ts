import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

const objectIdPattern = /^[0-9a-fA-F]{24}$/;
const timePattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
const validDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export const createAvailabilitySchema = z.object({
    body: z.object({
        providerId: z.string().regex(objectIdPattern, 'Invalid provider ID format'),
        workingDays: z.array(z.enum(validDays)).optional().default([]),
        startTime: z.string().regex(timePattern, 'Start time must be in HH:mm format'),
        endTime: z.string().regex(timePattern, 'End time must be in HH:mm format'),
        blockedDates: z.array(z.coerce.date()).optional().default([]),
    })
});

export const updateAvailabilitySchema = z.object({
    body: z.object({
        workingDays: z.array(z.enum(validDays)).optional(),
        startTime: z.string().regex(timePattern, 'Start time must be in HH:mm format').optional(),
        endTime: z.string().regex(timePattern, 'End time must be in HH:mm format').optional(),
        blockedDates: z.array(z.coerce.date()).optional(),
    })
});

export type CreateAvailabilityRequestType = z.infer<typeof createAvailabilitySchema>['body'];
export type UpdateAvailabilityRequestType = z.infer<typeof updateAvailabilitySchema>['body'];

export const validateCreateAvailability = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    try {
        const validatedData = createAvailabilitySchema.parse({
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

export const validateUpdateAvailability = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    try {
        const validatedData = updateAvailabilitySchema.parse({
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
