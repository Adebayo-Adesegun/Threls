import { asClass, asValue, createContainer, InjectionMode } from 'awilix';
import mongoose from 'mongoose';
import AuthService from '../src/services/auth.service';
import AuthController from './controllers/auth.controller';
import connectDB from './config/db';
import logger from './config/logger';

const container = createContainer({
    injectionMode: InjectionMode.PROXY,
    strict: true,
});

container.register({
    authService: asClass(AuthService),
    authController: asClass(AuthController),
    mongoose: asValue(mongoose),
});

connectDB().then(() => {
    logger.info('DB Connection Ready');
});

export default container;
