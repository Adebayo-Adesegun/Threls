import mongoose from 'mongoose';

const paymentMethodSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        cardType: {
            type: String,
            required: true,
        },
        last4: {
            type: String,
            required: true,
            minlength: 4,
            maxlength: 4,
        },
        expiryDate: {
            type: String,
            required: true,
        },
        isDefault: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    },
);

export const PaymentMethod = mongoose.model(
    'PaymentMethod',
    paymentMethodSchema,
);
