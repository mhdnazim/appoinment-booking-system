import Availability from '../../models/availability/availability.model';
import { CreateAvailabilityRequestType, UpdateAvailabilityRequestType } from '../../validations/availability/availability.validation';

export const createAvailability = async (data: CreateAvailabilityRequestType) => {

    const existing = await Availability.findOne({ providerId: data.providerId });
    if (existing) {
        throw new Error('Availability already exists for this provider');
    }

    const availability = new Availability(data);
    await availability.save();
    return availability;
};

export const getAvailabilityByProvider = async (providerId: string) => {
    const availability = await Availability.findOne({ providerId });
    if (!availability) {
        throw new Error('Availability not found');
    }
    return availability;
};

export const updateAvailability = async (providerId: string, data: UpdateAvailabilityRequestType) => {
    const availability = await Availability.findOneAndUpdate(
        { providerId },
        { $set: data },
        { new: true, runValidators: true }
    );

    if (!availability) {
        throw new Error('Availability not found');
    }

    return availability;
};

export const deleteAvailability = async (providerId: string) => {
    const availability = await Availability.findOneAndDelete({ providerId });

    if (!availability) {
        throw new Error('Availability not found');
    }

    return availability;
};
