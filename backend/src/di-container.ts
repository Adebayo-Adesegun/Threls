import { asClass, asValue, createContainer } from 'awilix';
import mongoose from 'mongoose';
import AuthService from '../src/services/auth.service';
import AuthController from './controllers/auth.controller';
import connectDB from './config/db';

const container = createContainer();

connectDB().then(() => {
    console.log('DB Connection Ready');

    container.register({
        authService: asClass(AuthService).singleton(),
        authController: asClass(AuthController).singleton(),
        mongoose: asValue(mongoose),
    });
});
export default container;
