import mongoose from 'mongoose';
import { config } from './env.config';

export const connectDB = async (): Promise<void> => {
  try {
    if (!config.mongoUri) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    const conn = await mongoose.connect(config.mongoUri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

