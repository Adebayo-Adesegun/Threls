import mongoose from 'mongoose';
import Subscription from '../models/subscription.model';
import Plan from '../models/plan.model';
import Invoice from '../models/invoice.model';
import PaymentMethodService from './paymentmethod.service';
import logger from '../config/logger';
import { CreateSubscription } from '../interfaces/user/create-subscription.interface';
import Counter from '../models/invoiceCounter.model';

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
                planId,
                status: 'ACTIVE',
            }).session(session);

            if (existingSubscription) {
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
                nextBillingDate.setMonth(today.getMonth() + 1);
            } else {
                nextBillingDate.setFullYear(today.getFullYear() + 1);
            }

            const subscription = await Subscription.create(
                [
                    {
                        userId,
                        planId,
                        paymentMethodId: paymentMethod?._id,
                        nextBillingDate: nextBillingDate.setHours(0, 0, 0, 0),
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

    async fetchSubscriptions(
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
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to midnight for accurate date comparison

        const subscriptions = await Subscription.find({
            nextBillingDate: today,
            status: 'ACTIVE',
        });

        logger.info(
            `Found ${subscriptions.length} subscriptions to charge today.`,
        );

        await Promise.all(
            subscriptions.map(async (subscription) => {
                const { userId, _id, planId } = subscription;
                logger.info(`Charging user ${userId} for subscription ${_id}`);

                const plan = await Plan.findById(planId);
                if (!plan) {
                    logger.warn(`Plan not found for subscription ${_id}`);
                    return;
                }

                await Invoice.create({
                    userId,
                    amount: plan.price,
                    subscriptionId: _id,
                });

                // Determine next billing date
                const nextBillingDate = new Date(today);
                if (plan.billingCycle === 'MONTHLY') {
                    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
                } else {
                    nextBillingDate.setFullYear(
                        nextBillingDate.getFullYear() + 1,
                    );
                }

                await Subscription.updateOne({ _id }, { nextBillingDate });

                logger.info(`Charged user ${userId} for subscription ${_id}`);
            }),
        );

        return true;
    }
}

export default SubscriptionService;
