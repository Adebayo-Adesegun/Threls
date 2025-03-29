import mongoose from 'mongoose';
import config from './config';
import logger from './logger';

const connectDB = async () => {
    try {
        await mongoose.connect(config.mongoose.url);
        logger.info('Database connected successfully');
    } catch (error) {
        logger.error('Failed to connect to database:', error);
        process.exit(1);
    }
};

export default connectDB;
