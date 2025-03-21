import Joi from 'joi';
import { supportedCurrencies, billingCycle } from '../../config/constants';

const CreatePlanSchema = Joi.object({
    name: Joi.string().required(),
    price: Joi.number().min(0).required(),
    currency: Joi.string()
        .valid(...supportedCurrencies)
        .required(),
    billingCycle: Joi.string()
        .valid(...billingCycle)
        .required(),
    isActive: Joi.boolean().default(true),
});

export default CreatePlanSchema;
