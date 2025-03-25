import Subscription from '../models/subscription.model';
import Plan from '../models/plan.model';
import Transaction from '../models/transaction.model';
import PaymentMethodService from './paymentmethod.service';
import logger from '../config/logger';
import { CreateSubscription } from '../interfaces/user/create-subscription.interface';

class SubscriptionService {
    constructor(private readonly paymentMethodService: PaymentMethodService) {}

    async createSubscription(
        newsub: CreateSubscription,
        userId: string,
    ): Promise<object> {
        const { card, planId } = newsub;
        const plan = await Plan.findById(planId);

        if (!plan) {
            throw new Error('Plan not found');
        }

        // check if user has an active subscriotion on the plan
        const existingSubscription = await Subscription.findOne({
            userId,
            planId,
            status: 'ACTIVE',
        });

        if (existingSubscription) {
            throw new Error(
                'you already have an active subscription on this plan',
            );
        }

        let paymentMethod = await this.paymentMethodService.fetchPaymentMethod(
            card,
            userId,
        );

        // create payment method if it doesn't already exist
        if (!paymentMethod) {
            paymentMethod = await this.paymentMethodService.createPaymentMethod(
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

        const subscription = await Subscription.create({
            userId,
            planId: newsub.planId,
            paymentMethodId: paymentMethod?._id,
            nextBillingDate: nextBillingDate.setHours(0, 0, 0, 0),
        });

        return subscription.toObject();
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

                await Transaction.create({
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
