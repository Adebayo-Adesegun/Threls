import Subscription from '../models/subscription.model';
import Plan from '../models/plan.model';
import PaymentMethodService from './paymentmethod.service';

class SubscriptionService {
    constructor(private readonly paymentMethodService: PaymentMethodService) {}

    async createSubscription(
        userId: string,
        planId: string,
        paymentMethodId: string,
    ): Promise<InstanceType<typeof Subscription>> {
        const plan = await Plan.findById(planId);

        if (!plan) {
            throw new Error('Plan not found');
        }

        const paymentMethod =
            await this.paymentMethodService.fetchPaymentMethod(userId);

        if (paymentMethod.length === 0) {
            throw new Error(
                'Payment method not found, please add a payment method',
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
            planId,
            paymentMethodId,
            nextBillingDate,
        });

        return subscription;
    }

    async cancelSubscription(subscriptionId: string) {
        const subscription = await Subscription.findById(subscriptionId);
        if (!subscription) {
            throw new Error('Subscription not found');
        }

        subscription.cancellationRequested = true;
        subscription.status = 'CANCELLED';
        subscription.nextBillingDate = null; // set to null since subscription has been cancelled;
        await subscription.save();
    }
}

export default SubscriptionService;
