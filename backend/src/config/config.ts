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
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number().required(),
    JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number().required(),
    JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: Joi.number().required(),
    SMTP_HOST: Joi.string().hostname().required(),
    SMTP_PORT: Joi.number().required(),
    SMTP_USERNAME: Joi.string().required(),
    SMTP_PASSWORD: Joi.string().required(),
    EMAIL_FROM: Joi.string().email().required(),
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
        refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
        resetPasswordExpirationMinutes:
            envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
        verifyEmailExpirationMinutes:
            envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
    },
    email: {
        smtp: {
            host: envVars.SMTP_HOST,
            port: envVars.SMTP_PORT,
            auth: {
                user: envVars.SMTP_USERNAME,
                pass: envVars.SMTP_PASSWORD,
            },
        },
        from: envVars.EMAIL_FROM,
    },
};
