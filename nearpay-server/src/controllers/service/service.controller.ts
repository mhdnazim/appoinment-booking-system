import { Request, Response, NextFunction } from 'express';
import * as serviceService from '../../services/service/service.service';
import { CreateServiceRequestType, UpdateServiceRequestType } from '../../validations/service/service.validation';

export const createService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const data: CreateServiceRequestType = req.body;
        const service = await serviceService.createService(data);

        res.status(201).json({
            success: true,
            message: 'Service created successfully',
            data: service,
        });
    } catch (error) {
        next(error);
    }
};

export const getAllServices = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { search } = req.query;
        const services = await serviceService.getAllServices(search as string);

        res.status(200).json({
            success: true,
            message: 'Services retrieved successfully',
            data: services,
        });
    } catch (error) {
        next(error);
    }
};

export const getServiceById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const service = await serviceService.getServiceById(id as string);

        res.status(200).json({
            success: true,
            message: 'Service retrieved successfully',
            data: service,
        });
    } catch (error) {
        next(error);
    }
};

export const getServicesByProvider = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { providerId } = req.params;
        const services = await serviceService.getServicesByProvider(providerId as string);

        res.status(200).json({
            success: true,
            message: 'Provider services retrieved successfully',
            data: services,
        });
    } catch (error) {
        next(error);
    }
};

export const updateService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const data: UpdateServiceRequestType = req.body;
        const service = await serviceService.updateService(id as string, data);

        res.status(200).json({
            success: true,
            message: 'Service updated successfully',
            data: service,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        await serviceService.deleteService(id as string);

        res.status(200).json({
            success: true,
            message: 'Service deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};
