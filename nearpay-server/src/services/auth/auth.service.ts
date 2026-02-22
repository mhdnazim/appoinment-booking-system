import User from '../../models/user/user.model';
import { RegisterRequestType, LoginRequestType } from '../../validations/auth/auth.validation';
import { hashPassword, comparePassword } from '../../utils/hash';
import { generateToken } from '../../utils/jwt';
import { HttpError } from '../../utils/httpError';

export const registerUser = async (data: RegisterRequestType) => {
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
        throw HttpError.badRequest('User with this email already exists');
    }

    const hashedPassword = await hashPassword(data.password);

    const newUser = new User({
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role,
    });

    await newUser.save();

    return newUser;
};

export const loginUser = async (data: LoginRequestType) => {
    const user = await User.findOne({ email: data.email });
    if (!user || !user.password) {
        throw HttpError.createError('Invalid email or password', 401);
    }

    const isPasswordValid = await comparePassword(data.password, user.password);
    if (!isPasswordValid) {
        throw HttpError.createError('Invalid email or password', 401);
    }

    const token = generateToken({ id: user._id, role: user.role });

    return { user, token };
};
