import Joi from 'joi';

const createSubcriptionSchema = Joi.object({
    planId: Joi.string().required(),
    paymentMethodId: Joi.string().required(),
});

export default createSubcriptionSchema;
