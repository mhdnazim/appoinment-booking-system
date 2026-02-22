import { Request, Response, NextFunction } from 'express';
import * as bookingService from '../../services/booking/booking.service';
import { CreateBookingRequestType, UpdateBookingStatusRequestType } from '../../validations/booking/booking.validation';
import { verifyToken } from '../../utils/jwt';

export const createBooking = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const data: CreateBookingRequestType = req.body;
        const booking = await bookingService.createBooking(data);

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            data: booking,
        });
    } catch (error) {
        next(error);
    }
};

export const getAvailableSlots = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { providerId, serviceId, date } = req.query;

        if (!providerId || !serviceId || !date) {
            res.status(400).json({
                success: false,
                message: 'providerId, serviceId, and date query parameters are required'
            });
            return;
        }

        const slots = await bookingService.getAvailableSlots(
            providerId as string,
            serviceId as string,
            date as string
        );

        res.status(200).json({
            success: true,
            message: 'Available slots retrieved successfully',
            data: slots,
        });
    } catch (error: any) {
        if (error.message === 'Provider availability not found' || error.message === 'Service not found') {
            res.status(404).json({ success: false, message: error.message });
            return;
        }
        next(error);
    }
};

export const getBookingById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const booking = await bookingService.getBookingById(id as string);

        res.status(200).json({
            success: true,
            message: 'Booking retrieved successfully',
            data: booking,
        });
    } catch (error: any) {
        if (error.message === 'Booking not found') {
            res.status(404).json({ success: false, message: error.message });
            return;
        }
        next(error);
    }
};

export const getBookingsByUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { userId } = req.params;
        const bookings = await bookingService.getBookingsByUser(userId as string);

        res.status(200).json({
            success: true,
            message: 'User bookings retrieved successfully',
            data: bookings,
        });
    } catch (error) {
        next(error);
    }
};

export const getBookingsByProvider = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { providerId } = req.params;
        const bookings = await bookingService.getBookingsByProvider(providerId as string);

        res.status(200).json({
            success: true,
            message: 'Provider bookings retrieved successfully',
            data: bookings,
        });
    } catch (error) {
        next(error);
    }
};

export const updateBookingStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const { status } = req.body as UpdateBookingStatusRequestType;

        if (status === 'cancelled') {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
                return;
            }

            const token = authHeader.split(' ')[1];
            let decoded: any;
            try {
                decoded = verifyToken(token);
            } catch (err) {
                res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
                return;
            }

            if (decoded.role !== 'provider') {
                const booking = await bookingService.getBookingById(id as string);
                const bookingDate = new Date(booking.date);
                const [hours, minutes] = booking.startTime.split(':').map(Number);
                bookingDate.setHours(hours, minutes, 0, 0);

                if (bookingDate <= new Date()) {
                    res.status(400).json({ success: false, message: 'Cannot cancel an appointment that has already started or passed' });
                    return;
                }
            }
        }

        const booking = await bookingService.updateBookingStatus(id as string, status);

        res.status(200).json({
            success: true,
            message: 'Booking status updated successfully',
            data: booking,
        });
    } catch (error: any) {
        if (error.message === 'Booking not found') {
            res.status(404).json({ success: false, message: error.message });
            return;
        }
        next(error);
    }
};

export const deleteBooking = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        await bookingService.deleteBooking(id as string);

        res.status(200).json({
            success: true,
            message: 'Booking deleted successfully',
        });
    } catch (error: any) {
        if (error.message === 'Booking not found') {
            res.status(404).json({ success: false, message: error.message });
            return;
        }
        next(error);
    }
};
