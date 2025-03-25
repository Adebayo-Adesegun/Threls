import Joi from 'joi';

const createSubcriptionSchema = Joi.object({
    planId: Joi.string().required(),
    card: Joi.object({
        cardType: Joi.string().required(),
        last4: Joi.string().required(),
        expiryDate: Joi.string().required(),
    }).required(),
});

export default createSubcriptionSchema;
