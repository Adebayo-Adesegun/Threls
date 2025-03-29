import Joi from 'joi';
import convert from 'joi-to-swagger';
import { UserSchema } from './login.response';

export const registerResponseSchema = Joi.object({
    success: Joi.boolean(),
    message: Joi.string(),
    data: UserSchema,
});

const { swagger: registerResponseSwagger } = convert(registerResponseSchema);

export default registerResponseSwagger;
