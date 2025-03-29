import Joi from 'joi';
import convert from 'joi-to-swagger';

export const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Invalid email format',
        'any.required': 'Email is required',
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'Password must be at least 6 characters long',
        'any.required': 'Password is required',
    }),
});

export const registerSchema = Joi.object({
    name: Joi.string().trim().required().messages({
        'any.required': 'Name is required',
    }),
    email: Joi.string().email().trim().lowercase().required().messages({
        'string.email': 'Invalid email format',
        'any.required': 'Email is required',
    }),
    password: Joi.string()
        .min(8)
        .pattern(/^(?=.*[A-Za-z])(?=.*\d).+$/)
        .required()
        .messages({
            'string.min': 'Password must be at least 8 characters long',
            'string.pattern.base': 'Password must contain at least one letter and one number',
            'any.required': 'Password is required',
        }),
});

export const { swagger: loginSchemaSwagger } = convert(loginSchema);
export const { swagger: registerSchemaSwagger } = convert(registerSchema);
