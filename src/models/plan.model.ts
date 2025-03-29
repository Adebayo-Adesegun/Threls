import mongoose from 'mongoose';
import { supportedCurrencies, billingCycle } from '../config/constants';

const planSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        features: {
            type: [String],
            required: true,
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
            enum: billingCycle,
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

const Plan = mongoose.model('Plan', planSchema);

export default Plan;
