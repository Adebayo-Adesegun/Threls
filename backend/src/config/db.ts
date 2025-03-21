import mongoose, { MongooseOptions } from 'mongoose';
import config from './config';

const connectDB = async () => {
    try {
        const options: MongooseOptions = {
            debug: config.env === 'development',
        };
        await mongoose.connect(config.mongoose.url, options);
        console.log('Database connected successfully');
    } catch (error) {
        console.error('Failed to connect to database:', error);
        process.exit(1); // Exit if connection fails
    }
};

export default connectDB;
