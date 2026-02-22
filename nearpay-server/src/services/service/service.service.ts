import Service from '../../models/service/service.model';
import User from '../../models/user/user.model';
import Availability from '../../models/availability/availability.model';
import { CreateServiceRequestType, UpdateServiceRequestType } from '../../validations/service/service.validation';
import { HttpError } from '../../utils/httpError';

export const createService = async (data: CreateServiceRequestType) => {

    const provider = await User.findById(data.providerId);
    if (!provider) {
        throw HttpError.createError('Provider not found', 404);
    }


    const newService = new Service({
        providerId: data.providerId,
        name: data.name,
        duration: data.duration,
        price: data.price,
    });

    await newService.save();
    return newService;
};

export const getAllServices = async (search?: string) => {
    const availableProviderIds = await Availability.distinct('providerId');

    let query: any = {
        providerId: { $in: availableProviderIds }
    };

    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { category: { $regex: search, $options: 'i' } }
        ];
    }
    return await Service.find(query).populate('providerId', 'name email role');
};

export const getServiceById = async (id: string) => {
    const service = await Service.findById(id).populate('providerId', 'name email role');
    if (!service) {
        throw HttpError.createError('Service not found', 404);
    }
    return service;
};

export const getServicesByProvider = async (providerId: string) => {
    return await Service.find({ providerId }).populate('providerId', 'name email role');
};

export const updateService = async (id: string, data: UpdateServiceRequestType) => {
    const service = await Service.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true, runValidators: true }
    );

    if (!service) {
        throw HttpError.createError('Service not found', 404);
    }

    return service;
};

export const deleteService = async (id: string) => {
    const service = await Service.findByIdAndDelete(id);
    if (!service) {
        throw HttpError.createError('Service not found', 404);
    }
    return true;
};
