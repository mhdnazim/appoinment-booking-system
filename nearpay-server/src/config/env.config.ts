import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 4200,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI || '',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  jwtSecret: process.env.JWT_SECRET || 'supersecretkey',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  // Add more environment variables as needed
};

