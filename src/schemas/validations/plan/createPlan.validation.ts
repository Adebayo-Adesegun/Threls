import Joi from 'joi';
import convert from 'joi-to-swagger';

import { supportedCurrencies, billingCycle } from '../../../config/constants';

export const createPlanSchema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    features: Joi.array().items(Joi.string()).required(),
    price: Joi.number().min(0).required(),
    currency: Joi.string()
        .valid(...supportedCurrencies)
        .required(),
    billing_cycle: Joi.string()
        .valid(...billingCycle)
        .required(),
    is_active: Joi.boolean().default(true),
});

export const { swagger: createPlanSchemaSwagger } = convert(createPlanSchema);
