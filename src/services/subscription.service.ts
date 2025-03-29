import mongoose from 'mongoose';
import Subscription from '../models/subscription.model';
import Plan from '../models/plan.model';
import Invoice from '../models/invoice.model';
import PaymentMethodService from './paymentmethod.service';
import logger from '../config/logger';
import { CreateSubscription } from '../interfaces/user/create-subscription.interface';
import Counter from '../models/invoiceCounter.model';
import PaymentMethod from '../models/paymentMethod.model';

class SubscriptionService {
    constructor(private readonly paymentMethodService: PaymentMethodService) {}

    async generateInvoiceId(): Promise<string> {
        const counter = await Counter.findOneAndUpdate(
            { name: 'invoice' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true },
        );
        return `INV-${counter.seq.toString().padStart(4, '0')}`;
    }

    async createSubscription(
        newsub: CreateSubscription,
        userId: string,
    ): Promise<object> {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const { card, plan_id: planId } = newsub;
            const plan = await Plan.findById(planId).session(session);

            if (!plan) {
                throw new Error('Plan not found');
            }

            const existingSubscription = await Subscription.findOne({
                userId,
                status: 'ACTIVE',
            }).session(session);

            if (existingSubscription) {
                throw new Error('You already have an active subscription');
            }

            if (
                existingSubscription &&
                existingSubscription.planId?.toString() === planId
            ) {
                throw new Error(
                    'You already have an active subscription on this plan',
                );
            }

            let paymentMethod =
                await this.paymentMethodService.fetchPaymentMethod(
                    card,
                    userId,
                );

            if (!paymentMethod) {
                paymentMethod =
                    await this.paymentMethodService.createPaymentMethod(
                        userId,
                        card,
                    );
            }

            const today = new Date();
            const nextBillingDate = new Date();

            if (plan.billingCycle === 'MONTHLY') {
                nextBillingDate.setUTCMonth(today.getUTCMonth() + 1);
            } else {
                nextBillingDate.setUTCFullYear(today.getUTCFullYear() + 1);
            }

            const subscription = await Subscription.create(
                [
                    {
                        userId,
                        planId,
                        paymentMethodId: paymentMethod?._id,
                        nextBillingDate: nextBillingDate.setUTCHours(
                            0,
                            0,
                            0,
                            0,
                        ),
                    },
                ],
                { session },
            );

            const invoiceId = await this.generateInvoiceId();

            await Invoice.create(
                [
                    {
                        userId,
                        invoiceId,
                        paymentMethodId: paymentMethod?._id,
                        subscriptionId: subscription[0]._id,
                        amount: plan.price,
                        currency: plan.currency,
                        status: 'PAID',
                    },
                ],
                { session },
            );

            await session.commitTransaction();
            session.endSession();

            return subscription[0].toObject();
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }

    async cancelSubscription(
        subscriptionId: string,
        userId: string,
    ): Promise<void> {
        const subscription = await Subscription.findOne({
            _id: subscriptionId,
            userId,
        });

        if (!subscription) {
            throw new Error('Subscription not found');
        }

        subscription.cancellationRequested = true;
        subscription.status = 'CANCELLED';
        subscription.nextBillingDate = null; // set to null since subscription has been cancelled;
        await subscription.save();
    }

    async markExpiredSubscriptionsAsInactive(): Promise<boolean> {
        const midnightToday = new Date().setHours(0, 0, 0, 0);

        const { modifiedCount } = await Subscription.updateMany(
            { nextBillingDate: { $lt: midnightToday }, status: 'ACTIVE' },
            { $set: { status: 'INACTIVE' } },
        );

        logger.info(
            `Marked ${modifiedCount} expired subscriptions as INACTIVE.`,
        );
        return modifiedCount > 0;
    }

    async fetchSubscriptionByUserId(
        userId: string,
    ): Promise<InstanceType<typeof Subscription>[]> {
        const subscriptions = await Subscription.find({ userId });
        return subscriptions;
    }

    async fetchSubscriptionById(
        subscriptionId: string,
        userId: string,
    ): Promise<InstanceType<typeof Subscription>> {
        const subscription = await Subscription.findOne({
            _id: subscriptionId,
            userId,
        });

        if (!subscription) {
            throw new Error('Subscription not found');
        }

        return subscription;
    }

    async chargeActiveSubscriptions(): Promise<boolean> {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const startOfDay = new Date();
            startOfDay.setUTCHours(0, 0, 0, 0);

            const endOfDay = new Date(startOfDay);
            endOfDay.setUTCHours(23, 59, 59, 999);

            const subscriptions = await Subscription.find({
                nextBillingDate: { $gte: startOfDay, $lte: endOfDay },
                status: 'ACTIVE',
            }).session(session);

            logger.info(
                `Found ${subscriptions.length} subscriptions to charge today.`,
            );

            await Promise.all(
                subscriptions.map(async (subscription) => {
                    const { userId, _id, planId } = subscription;
                    logger.info(
                        `Charging user ${userId} for subscription ${_id}`,
                    );

                    const plan = await Plan.findById(planId).session(session);
                    if (!plan) {
                        logger.warn(`Plan not found for subscription ${_id}`);
                        return;
                    }

                    const invoiceId = await this.generateInvoiceId();
                    const paymentMethod = await PaymentMethod.findOne({
                        userId,
                    }).session(session);
                    if (!paymentMethod) {
                        logger.warn(
                            `No payment method found for user ${userId}, skipping charge.`,
                        );
                        return;
                    }

                    await Invoice.create(
                        [
                            {
                                userId,
                                invoiceId,
                                paymentMethodId: paymentMethod._id,
                                subscriptionId: _id,
                                amount: plan.price,
                                currency: plan.currency,
                                status: 'PAID',
                            },
                        ],
                        { session },
                    );

                    const nextBillingDate = new Date();

                    if (plan.billingCycle === 'MONTHLY') {
                        nextBillingDate.setUTCMonth(
                            nextBillingDate.getUTCMonth() + 1,
                        );
                    } else {
                        nextBillingDate.setUTCFullYear(
                            nextBillingDate.getUTCFullYear() + 1,
                        );
                    }

                    // Normalize time to midnight UTC to match MongoDB stored dates
                    nextBillingDate.setUTCHours(0, 0, 0, 0);

                    await Subscription.updateOne(
                        { _id },
                        { nextBillingDate },
                    ).session(session);

                    logger.info(
                        `Charged user ${userId} for subscription ${_id}`,
                    );
                }),
            );

            await session.commitTransaction();
            session.endSession();
            return true;
        } catch (error: any) {
            await session.abortTransaction();
            session.endSession();
            logger.error(`Error charging subscriptions: ${error.message}`);
            return false;
        }
    }
}

export default SubscriptionService;
