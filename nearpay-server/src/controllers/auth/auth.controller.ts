import { Request, Response, NextFunction } from 'express';
import * as authService from '../../services/auth/auth.service';
import { RegisterRequestType, LoginRequestType } from '../../validations/auth/auth.validation';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const data: RegisterRequestType = req.body;
        console.log(data, '***********')
        const user = await authService.registerUser(data);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const data: LoginRequestType = req.body;
        console.log(data, '***********')
        const { user, token } = await authService.loginUser(data);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user,
                token,
            },
        });
    } catch (error) {
        next(error);
    }
};
