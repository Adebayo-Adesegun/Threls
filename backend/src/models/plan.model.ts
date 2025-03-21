import mongoose from 'mongoose';
import { supportedCurrencies, billingCyle } from '../config/constants';

const planSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        currency: {
            type: String,
            required: true,
            enum: supportedCurrencies,
        },
        billingCycle: {
            type: String,
            required: true,
            enum: billingCyle,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    },
);

planSchema.index({ name: 1 });

export default mongoose.model('Plan', planSchema);
