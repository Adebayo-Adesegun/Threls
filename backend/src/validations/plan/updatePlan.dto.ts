import Joi from 'joi';

const updatePlanSchema = Joi.object({
    name: Joi.string().optional(),
    description: Joi.string().optional(),
    price: Joi.number().optional(),
    duration: Joi.number().integer().optional(),
    isActive: Joi.boolean().optional(),
});

export default updatePlanSchema;
