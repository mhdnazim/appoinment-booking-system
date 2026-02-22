import jwt from 'jsonwebtoken';
import { config } from '../config/env.config';

export const generateToken = (payload: object, expiresIn: string | number = config.jwtExpiresIn): string => {
    return jwt.sign(payload, config.jwtSecret, { expiresIn: expiresIn as jwt.SignOptions['expiresIn'] });
};

export const verifyToken = (token: string): object | string => {
    return jwt.verify(token, config.jwtSecret);
};
