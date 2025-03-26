import { Card } from '../interfaces/user/card.interface';
import PaymentMethod from '../models/paymentMethod.model';

class PaymentMethodService {
    async createPaymentMethod(
        userId: string,
        card: Card,
    ): Promise<InstanceType<typeof PaymentMethod>> {
        const { cardType, last4, expiryDate } = card;
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

    async fetchPaymentMethods(userId: string) {
        const paymentMethods = await PaymentMethod.find({ userId });
        return paymentMethods;
    }

    async fetchPaymentMethod(card: Card, userId: string) {
        const { last4, expiryDate, cardType } = card;
        const paymentMethod = await PaymentMethod.findOne({
            last4,
            expiryDate,
            cardType,
            userId,
        });
        return paymentMethod;
    }

    async removePaymentMethod(
        userId: string,
        paymentMethodId: string,
    ): Promise<boolean> {
        const removePaymentMethod = await PaymentMethod.deleteOne({
            userId,
            _id: paymentMethodId,
        });
        return removePaymentMethod.deletedCount > 0;
    }

    async updatePaymentMethod(
        userId: string,
        paymentMethodId: string,
        card: Card,
    ) {
        const { last4, expiryDate, cardType } = card;
        const updatePaymentMethod = await PaymentMethod.updateOne(
            {
                userId,
                _id: paymentMethodId,
            },
            {
                last4,
                expiryDate,
                cardType,
            },
        );
        return updatePaymentMethod;
    }
}

export default PaymentMethodService;
