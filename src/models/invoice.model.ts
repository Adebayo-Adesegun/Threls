import mongoose from 'mongoose';
import { supportedCurrencies, invoiceStatus } from '../config/constants';

const invoiceSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        invoiceId: {
            type: String,
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
            enum: invoiceStatus,
            default: 'PENDING',
        },
    },
    {
        timestamps: true,
    },
);

const Invoice = mongoose.model('Invoice', invoiceSchema);

export default Invoice;
