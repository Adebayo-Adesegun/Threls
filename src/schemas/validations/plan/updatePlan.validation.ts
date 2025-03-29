import Joi from 'joi';
import convert from 'joi-to-swagger';

import { billingCycle, supportedCurrencies } from '../../../config/constants';

export const updatePlanSchema = Joi.object({
    name: Joi.string().optional(),
    currency: Joi.string()
        .valid(...supportedCurrencies)
        .optional(),
    price: Joi.number().min(0).optional(),
    billing_cycle: Joi.string()
        .valid(...billingCycle)
        .optional(),
    is_active: Joi.boolean().optional(),
});

export const { swagger: updatePlanSchemaSwagger } = convert(updatePlanSchema);
