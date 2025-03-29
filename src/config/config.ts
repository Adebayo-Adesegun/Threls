import dotenv from 'dotenv';
import Joi from 'joi';

dotenv.config();

const envSchema = Joi.object({
    NODE_ENV: Joi.string()
        .valid('development', 'production', 'test')
        .required(),
    PORT: Joi.number().default(3000),
    MONGODB_URL: Joi.string().uri().required(),
    JWT_SECRET: Joi.string().required(),
    JWT_ACCESS_EXPIRATION_SECONDS: Joi.number().required(),
}).unknown(true);

const { value: envVars, error } = envSchema
    .prefs({ errors: { label: 'key' } })
    .validate(process.env);

if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

export default {
    env: envVars.NODE_ENV,
    port: envVars.PORT,
    mongoose: {
        url: envVars.MONGODB_URL,
    },
    jwt: {
        secret: envVars.JWT_SECRET,
        accessExpirationSeconds: envVars.JWT_ACCESS_EXPIRATION_SECONDS,
    },
};
