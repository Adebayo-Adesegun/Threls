import Joi from 'joi';
import convert from 'joi-to-swagger';

export const UserSchema = Joi.object({
    id: Joi.string(),
    name: Joi.string(),
    email: Joi.string().email(),
    role: Joi.string().valid('user', 'admin'),
    created_at: Joi.date().iso(),
    updated_at: Joi.date().iso(),
});

const DataSchema = Joi.object({
    access_token: Joi.string(),
    user: UserSchema,
});

const LoginResponseSchema = Joi.object({
    success: Joi.boolean(),
    message: Joi.string(),
    data: DataSchema,
});

const { swagger: loginResponseSwagger } = convert(LoginResponseSchema);

export default loginResponseSwagger;
