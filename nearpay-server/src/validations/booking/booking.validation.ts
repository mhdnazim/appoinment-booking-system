import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

const objectIdPattern = /^[0-9a-fA-F]{24}$/;
const timePattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

export const createBookingSchema = z.object({
    body: z.object({
        userId: z.string().regex(objectIdPattern, 'Invalid user ID format'),
        providerId: z.string().regex(objectIdPattern, 'Invalid provider ID format'),
        serviceId: z.string().regex(objectIdPattern, 'Invalid service ID format'),
        date: z.coerce.date(),
        startTime: z.string().regex(timePattern, 'Start time must be in HH:mm format'),
        endTime: z.string().regex(timePattern, 'End time must be in HH:mm format'),
        status: z.enum(['booked', 'cancelled', 'completed']).optional().default('booked')
    })
});

export const updateBookingStatusSchema = z.object({
    body: z.object({
        status: z.enum(['booked', 'cancelled', 'completed'])
    })
});

export type CreateBookingRequestType = z.infer<typeof createBookingSchema>['body'];
export type UpdateBookingStatusRequestType = z.infer<typeof updateBookingStatusSchema>['body'];

export const validateCreateBooking = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    try {
        const validatedData = createBookingSchema.parse({
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

export const validateUpdateBookingStatus = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    try {
        const validatedData = updateBookingStatusSchema.parse({
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
