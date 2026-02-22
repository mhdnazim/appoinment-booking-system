import mongoose from 'mongoose';

const ServiceSchema = new mongoose.Schema(
    {
        providerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        name: {
            type: String,
            required: true
        },
        duration: {
            type: Number,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
    },
    {
        timestamps: true,
    }
);

ServiceSchema.set('toJSON', {
    transform: (doc, ret: any) => {
        delete ret.__v;
        return ret;
    }
});

const Service = mongoose.model('Service', ServiceSchema);

export default Service;
