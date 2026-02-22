import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
    {
        name: { 
            type: String, 
            required: true 
        },
        email: { 
            type: String, 
            required: true, 
            unique: true, 
            lowercase: true, 
            trim: true 
        },
        password: { 
            type: String, 
            required: false 
        },
        role: { 
            type: String, 
            enum: ['user', 'admin', 'provider'], 
            default: 'user' 
        },
    },
    {
        timestamps: true,
    }
);

UserSchema.set('toJSON', {
    transform: (doc, ret: any) => {
        delete ret.password;
        delete ret.__v;
        return ret;
    }
});

const User = mongoose.model('User', UserSchema);

export default User;
