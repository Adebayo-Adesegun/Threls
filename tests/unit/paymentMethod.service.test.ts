import { Card } from '../../src/interfaces/user/card.interface';
import PaymentMethod from '../../src/models/paymentMethod.model';
import PaymentMethodService from '../../src/services/paymentmethod.service';

jest.mock('../../src/models/paymentMethod.model');

describe('PaymentMethodService', () => {
    let paymentMethodService: PaymentMethodService;

    beforeEach(() => {
        paymentMethodService = new PaymentMethodService();
        jest.clearAllMocks();
    });

    const mockCard: Card = {
        cardType: 'Visa',
        last4: '4242',
        expiryDate: '12/26',
    };

    const mockPaymentMethod = {
        _id: 'mockId',
        userId: 'user123',
        cardType: 'Visa',
        last4: '4242',
        expiryDate: '12/26',
        isDefault: true,
    };

    test('should create a new payment method', async () => {
        (PaymentMethod.findOne as jest.Mock)
            .mockResolvedValueOnce(null) // No existing card
            .mockResolvedValueOnce({ isDefault: true }); // User has a default card

        (PaymentMethod.create as jest.Mock).mockResolvedValue(
            mockPaymentMethod,
        );

        const result = await paymentMethodService.createPaymentMethod(
            'user123',
            mockCard,
        );
        expect(result).toEqual(mockPaymentMethod);
        expect(PaymentMethod.create).toHaveBeenCalledWith({
            userId: 'user123',
            cardType: 'Visa',
            last4: '4242',
            expiryDate: '12/26',
            isDefault: false, // Because user already has a default card
        });
    });

    test('should throw an error if payment method already exists', async () => {
        (PaymentMethod.findOne as jest.Mock).mockResolvedValue(
            mockPaymentMethod,
        );

        await expect(
            paymentMethodService.createPaymentMethod('user123', mockCard),
        ).rejects.toThrow('Payment method already exists.');
    });

    test('should fetch all payment methods for a user', async () => {
        (PaymentMethod.find as jest.Mock).mockResolvedValue([
            mockPaymentMethod,
        ]);

        const result =
            await paymentMethodService.fetchPaymentMethods('user123');
        expect(result).toEqual([mockPaymentMethod]);
        expect(PaymentMethod.find).toHaveBeenCalledWith({ userId: 'user123' });
    });

    test('should fetch a specific payment method', async () => {
        (PaymentMethod.findOne as jest.Mock).mockResolvedValue(
            mockPaymentMethod,
        );

        const result = await paymentMethodService.fetchPaymentMethod(
            mockCard,
            'user123',
        );
        expect(result).toEqual(mockPaymentMethod);
        expect(PaymentMethod.findOne).toHaveBeenCalledWith({
            last4: '4242',
            expiryDate: '12/26',
            cardType: 'Visa',
            userId: 'user123',
        });
    });

    test('should remove a payment method', async () => {
        (PaymentMethod.deleteOne as jest.Mock).mockResolvedValue({
            deletedCount: 1,
        });

        const result = await paymentMethodService.removePaymentMethod(
            'user123',
            'mockId',
        );
        expect(result).toBe(true);
        expect(PaymentMethod.deleteOne).toHaveBeenCalledWith({
            userId: 'user123',
            _id: 'mockId',
        });
    });

    test('should return false if no payment method is removed', async () => {
        (PaymentMethod.deleteOne as jest.Mock).mockResolvedValue({
            deletedCount: 0,
        });

        const result = await paymentMethodService.removePaymentMethod(
            'user123',
            'mockId',
        );
        expect(result).toBe(false);
    });

    test('should update a payment method', async () => {
        (PaymentMethod.updateOne as jest.Mock).mockResolvedValue(true);

        const result = await paymentMethodService.updatePaymentMethod(
            'user123',
            'mockId',
            mockCard,
        );
        expect(result).toEqual(false);
        expect(PaymentMethod.updateOne).toHaveBeenCalledWith(
            { userId: 'user123', _id: 'mockId' },
            {
                last4: '4242',
                expiryDate: '12/26',
                cardType: 'Visa',
            },
        );
    });

    test('should return unchanged response if no update occurs', async () => {
        (PaymentMethod.updateOne as jest.Mock).mockResolvedValue(false);

        const result = await paymentMethodService.updatePaymentMethod(
            'user123',
            'mockId',
            mockCard,
        );
        expect(result).toEqual(false);
    });
});
