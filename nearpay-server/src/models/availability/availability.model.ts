import mongoose from 'mongoose';

const AvailabilitySchema = new mongoose.Schema(
    {
        providerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true
        },
        workingDays: {
            type: [String],
            enum: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            default: []
        },
        startTime: {
            type: String,
            required: true
        },
        endTime: {
            type: String,
            required: true
        },
        blockedDates: {
            type: [Date],
            default: []
        },
    },
    {
        timestamps: true,
    }
);

AvailabilitySchema.set('toJSON', {
    transform: (doc, ret: any) => {
        delete ret.__v;
        return ret;
    }
});

const Availability = mongoose.model('Availability', AvailabilitySchema);

export default Availability;
