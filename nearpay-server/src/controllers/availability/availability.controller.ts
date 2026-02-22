import { Request, Response, NextFunction } from 'express';
import * as availabilityService from '../../services/availability/availability.service';
import { CreateAvailabilityRequestType, UpdateAvailabilityRequestType } from '../../validations/availability/availability.validation';

export const createAvailability = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const data: CreateAvailabilityRequestType = req.body;
        const availability = await availabilityService.createAvailability(data);

        res.status(201).json({
            success: true,
            message: 'Availability created successfully',
            data: availability,
        });
    } catch (error: any) {
        if (error.message === 'Availability already exists for this provider') {
            res.status(409).json({ success: false, message: error.message });
            return;
        }
        next(error);
    }
};

export const getAvailabilityByProvider = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { providerId } = req.params;
        const availability = await availabilityService.getAvailabilityByProvider(providerId as string);

        res.status(200).json({
            success: true,
            message: 'Provider availability retrieved successfully',
            data: availability,
        });
    } catch (error: any) {
        if (error.message === 'Availability not found') {
            res.status(404).json({ success: false, message: error.message });
            return;
        }
        next(error);
    }
};

export const updateAvailability = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { providerId } = req.params;
        const data: UpdateAvailabilityRequestType = req.body;
        const availability = await availabilityService.updateAvailability(providerId as string, data);

        res.status(200).json({
            success: true,
            message: 'Availability updated successfully',
            data: availability,
        });
    } catch (error: any) {
        if (error.message === 'Availability not found') {
            res.status(404).json({ success: false, message: error.message });
            return;
        }
        next(error);
    }
};

export const deleteAvailability = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { providerId } = req.params;
        await availabilityService.deleteAvailability(providerId as string);

        res.status(200).json({
            success: true,
            message: 'Availability deleted successfully',
        });
    } catch (error: any) {
        if (error.message === 'Availability not found') {
            res.status(404).json({ success: false, message: error.message });
            return;
        }
        next(error);
    }
};
