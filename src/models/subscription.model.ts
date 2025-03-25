import mongoose from 'mongoose';
import { subscriptionStatus } from '../config/constants';

const subscriptionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        planId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Plan',
            required: true,
        },
        status: {
            type: String,
            enum: subscriptionStatus,
            default: 'ACTIVE',
        },
        paymentMethodId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'PaymentMethod',
            required: true,
        },
        nextBillingDate: {
            type: Date,
            required: false,
            default: null,
        },
        cancellationRequested: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    },
);

subscriptionSchema.index({ userId: 1, planId: 1 });

export default mongoose.model('Subscription', subscriptionSchema);
