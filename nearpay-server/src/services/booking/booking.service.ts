import Booking from '../../models/booking/booking.model';
import Availability from '../../models/availability/availability.model';
import Service from '../../models/service/service.model';
import { CreateBookingRequestType } from '../../validations/booking/booking.validation';

export const createBooking = async (data: CreateBookingRequestType) => {
    const booking = new Booking(data);
    await booking.save();
    return booking;
};

export const getBookingById = async (id: string) => {
    const booking = await Booking.findById(id);
    if (!booking) {
        throw new Error('Booking not found');
    }
    return booking;
};

export const getBookingsByUser = async (userId: string) => {
    return await Booking.find({ userId })
        .populate('providerId', 'name email profilePicture')
        .populate('serviceId', 'name price duration');
};

export const getBookingsByProvider = async (providerId: string) => {
    return await Booking.find({ providerId })
        .populate('userId', 'name email profilePicture')
        .populate('serviceId', 'name price duration');
};

export const updateBookingStatus = async (id: string, status: string) => {
    const booking = await Booking.findByIdAndUpdate(
        id,
        { $set: { status } },
        { new: true, runValidators: true }
    );

    if (!booking) {
        throw new Error('Booking not found');
    }

    return booking;
};

export const deleteBooking = async (id: string) => {
    const booking = await Booking.findByIdAndDelete(id);
    if (!booking) {
        throw new Error('Booking not found');
    }
    return booking;
};

export const getAvailableSlots = async (providerId: string, serviceId: string, date: string) => {
    // 1. Get provider availability
    const availability = await Availability.findOne({ providerId });
    if (!availability) {
        throw new Error('Provider availability not found');
    }

    // 2. Get service duration
    const service = await Service.findById(serviceId);
    if (!service) {
        throw new Error('Service not found');
    }
    const durationMins = service.duration;

    // 3. Generate all slots for that day
    const targetDate = new Date(date);

    const daysOfWeek: ("Sun" | "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat")[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayName = daysOfWeek[targetDate.getDay()];
    if (!availability.workingDays.includes(dayName)) {
        return []; // Not a working day
    }

    const isBlocked = availability.blockedDates.some((blockedDate: any) => {
        const bDate = new Date(blockedDate);
        return bDate.toISOString().split('T')[0] === targetDate.toISOString().split('T')[0];
    });
    if (isBlocked) {
        return []; // Date is blocked
    }

    const { startTime, endTime } = availability;
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    let currentStartMins = startHour * 60 + startMin;
    const endTotalMins = endHour * 60 + endMin;

    const allSlots = [];
    while (currentStartMins + durationMins <= endTotalMins) {
        const sHour = Math.floor(currentStartMins / 60).toString().padStart(2, '0');
        const sMin = (currentStartMins % 60).toString().padStart(2, '0');

        const eMins = currentStartMins + durationMins;
        const eHour = Math.floor(eMins / 60).toString().padStart(2, '0');
        const eMin = (eMins % 60).toString().padStart(2, '0');

        allSlots.push({
            startTime: `${sHour}:${sMin}`,
            endTime: `${eHour}:${eMin}`
        });

        currentStartMins += durationMins;
    }

    // 4. Fetch existing bookings for that date
    const startOfDay = new Date(targetDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const existingBookings = await Booking.find({
        providerId,
        date: { $gte: startOfDay, $lte: endOfDay },
        status: { $in: ['booked', 'completed'] }
    });

    // 5. Remove booked slots
    let availableSlots = allSlots.filter(slot => {
        const slotStart = parseInt(slot.startTime.replace(':', ''));
        const slotEnd = parseInt(slot.endTime.replace(':', ''));

        const isOverlapping = existingBookings.some(b => {
            const bStart = parseInt(b.startTime.replace(':', ''));
            const bEnd = parseInt(b.endTime.replace(':', ''));
            return slotStart < bEnd && slotEnd > bStart;
        });

        return !isOverlapping;
    });

    // 6. Remove past time slots (if today)
    const today = new Date();
    // Use local time comparison to be safe for "today"
    if (targetDate.getFullYear() === today.getFullYear() &&
        targetDate.getMonth() === today.getMonth() &&
        targetDate.getDate() === today.getDate()) {

        const currentHour = today.getHours();
        const currentMin = today.getMinutes();
        const currentTimeInt = currentHour * 100 + currentMin;

        availableSlots = availableSlots.filter(slot => {
            const slotStart = parseInt(slot.startTime.replace(':', ''));
            return slotStart > currentTimeInt;
        });
    }

    // 7. Return remaining slots
    return availableSlots;
};
