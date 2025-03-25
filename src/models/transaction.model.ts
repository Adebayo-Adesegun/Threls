import mongoose from 'mongoose';
import { supportedCurrencies } from '../config/constants';

const transactionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        paymentMethodId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'PaymentMethod',
            required: true,
        },
        subscriptionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subscription',
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        curreny: {
            type: String,
            required: true,
            enum: supportedCurrencies,
            default: 'USD',
        },
        status: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    },
);

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
