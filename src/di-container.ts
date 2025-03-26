import { scopePerRequest } from 'awilix-express';
import { asClass, asFunction, asValue, createContainer } from 'awilix';
import { Application, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import passport from 'passport';
import connectDB from './config/db';
import logger from './config/logger';
import PlanService from './services/plan.service';
import AuthService from './services/auth.service';
import localStrategy from './config/strategies/local.strategy';
import SubscriptionService from './services/subscription.service';
import PaymentMethodService from './services/paymentmethod.service';
import CronService from './services/cron.service';
import SanitizerService from './services/sanitizer.service';
import WebhookService from './services/webhook.service';
import configureJwtStrategy from './config/strategies/jwt.strategy';

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
    });

    passport.use(container.resolve('localStrategy'));
    configureJwtStrategy();

    connectDB().then(() => {
        logger.info('DB Connection Ready');
    });

    app.use(scopePerRequest(container));
    app.use(passport.initialize());

    const cronService = container.resolve<CronService>('cronService');
    cronService.startJobs();
};

export default loadContainer;
