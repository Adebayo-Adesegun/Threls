import PaymentMethod from '../models/paymentMethod.model';

class PaymentMethodService {
    async createPaymentMethod(
        userId: string,
        cardType: string,
        last4: string,
        expiryDate: string,
    ): Promise<InstanceType<typeof PaymentMethod>> {
        const existingPaymentMethod = await PaymentMethod.findOne({
            userId,
            cardType,
            last4,
            expiryDate,
        });

        if (existingPaymentMethod) {
            throw new Error('Payment method already exists.');
        }

        const hasDefaultPaymentMethod = await PaymentMethod.findOne({
            userId,
            isDefault: true,
        });

        const createPaymentMethod = await PaymentMethod.create({
            userId,
            cardType,
            last4,
            expiryDate,
            isDefault: !hasDefaultPaymentMethod,
        });

        return createPaymentMethod;
    }

    async fetchPaymentMethod(userId: string) {
        const paymentMethods = await PaymentMethod.find({ userId });
        return paymentMethods;
    }
}

export default PaymentMethodService;
