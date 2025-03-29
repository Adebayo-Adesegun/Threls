import Joi from 'joi';

import convert from 'joi-to-swagger';

export const createSubcriptionSchema = Joi.object({
    plan_id: Joi.string().required(),
    card: Joi.object({
        card_type: Joi.string().required(),
        last4: Joi.string().required(),
        expiry_date: Joi.string().required(),
    }).required(),
});

export const { swagger: createSubcriptionSchemaSchemaSwagger } = convert(
    createSubcriptionSchema,
);
