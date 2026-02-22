import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        providerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        serviceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Service',
            required: true
        },
        date: {
            type: Date,
            required: true
        },
        startTime: {
            type: String,
            required: true
        },
        endTime: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ['booked', 'cancelled', 'completed'],
            default: 'booked'
        }
    },
    {
        timestamps: true,
    }
);

BookingSchema.set('toJSON', {
    transform: (doc, ret: any) => {
        delete ret.__v;
        return ret;
    }
});

const Booking = mongoose.model('Booking', BookingSchema);

export default Booking;
