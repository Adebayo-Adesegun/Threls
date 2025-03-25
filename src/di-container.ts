import { scopePerRequest } from 'awilix-express';
import { asClass, asFunction, asValue, createContainer } from 'awilix';
import { Application } from 'express';
import mongoose from 'mongoose';
import passport from 'passport';
import connectDB from './config/db';
import { Request, Response, NextFunction } from 'express';
import logger from './config/logger';
import PlanService from './services/plan.service';
import AuthService from './services/auth.service';
import localStrategy from './config/strategies/local.strategy';
import jwtStrategy from './config/strategies/jwt.strategy';
import SubscriptionService from './services/subscription.service';
import PaymentMethodService from './services/paymentmethod.service';
import CronService from './services/cron.service';
import SanitizerService from './services/sanitizer.service';
import WebhookService from './services/webhook.service';

const loadContainer = (app: Application) => {
    const container = createContainer({
        injectionMode: 'CLASSIC',
    });

    container.register({
        authService: asClass(AuthService),
        planService: asClass(PlanService),
        subscriptionService: asClass(SubscriptionService),
        paymentMethodService: asClass(PaymentMethodService),
        cronService: asClass(CronService).singleton(),
        sanitizerService: asClass(SanitizerService).singleton(),
        webhookService: asClass(WebhookService).singleton(),
        mongoose: asValue(mongoose),
        passport: asValue(passport),
        localStrategy: asFunction(localStrategy).singleton(),
        jwtStrategy: asFunction(jwtStrategy).singleton(),
    });

    passport.use(container.resolve('localStrategy'));
    passport.use(container.resolve('jwtStrategy'));

    connectDB().then(() => {
        logger.info('DB Connection Ready');
    });

    app.use(scopePerRequest(container));
    app.use(passport.initialize());

    const cronService = container.resolve<CronService>('cronService');
    cronService.startJobs();
};

export default loadContainer;
