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
    ): Promise<InstanceType<typeof Subscription>> {
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
            nextBillingDate,
        });

        return subscription;
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
        const today = new Date();
        const result = await Subscription.updateMany(
            { nextBillingDate: { $lt: today }, status: 'ACTIVE' },
            { $set: { status: 'INACTIVE' } },
        );

        logger.info(
            `Marked ${result.modifiedCount} subscriptions as INACTIVE.`,
        );
        return true;
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

    async chargeActiveSubscriptions() {
        const today = new Date();
        const subscriptions = await Subscription.find({
            nextBillingDate: today,
            status: 'ACTIVE',
        });
        logger.info(
            `Found ${subscriptions.length} subscriptions to charge for today`,
        );
        await Promise.all(
            subscriptions.map(async (subscription) => {
                logger.info(
                    `Charging user ${subscription.userId} for subscription ${subscription._id}`,
                );
                const plan = await Plan.findById(subscription.planId);
                await Transaction.create({
                    userId: subscription.userId,
                    amount: plan?.price,
                    subscriptionId: subscription._id,
                });

                const nextBillingDate = new Date();

                if (plan?.billingCycle === 'MONTHLY') {
                    nextBillingDate.setMonth(today.getMonth() + 1);
                } else {
                    nextBillingDate.setFullYear(today.getFullYear() + 1);
                }

                const updatedSubscription = subscription;
                updatedSubscription.nextBillingDate = nextBillingDate;
                await updatedSubscription.save();

                logger.info(
                    `Charged user ${subscription.userId} for subscription ${subscription._id}`,
                );
            }),
        );
        return true;
    }
}

export default SubscriptionService;
