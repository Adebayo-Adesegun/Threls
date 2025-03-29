import swaggerJsdoc from 'swagger-jsdoc';
import {
    loginSchemaSwagger,
    registerSchemaSwagger,
} from '../schemas/validations/auth/auth.validation';
import { createPlanSchemaSwagger } from '../schemas/validations/plan/createPlan.validation';
import { updatePlanSchemaSwagger } from '../schemas/validations/plan/updatePlan.validation';
import { createSubcriptionSchemaSchemaSwagger } from '../schemas/validations/user/createSubscription.validation';
import loginResponseSwagger from '../schemas/responses/auth/login.response';
import registerResponseSwagger from '../schemas/responses/auth/register.response';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Docs',
            version: '1.0.0',
        },
        components: {
            schemas: {
                Login: loginSchemaSwagger,
                Register: registerSchemaSwagger,
                CreatePlan: createPlanSchemaSwagger,
                UpdatePlan: updatePlanSchemaSwagger,
                CreateSubcription: createSubcriptionSchemaSchemaSwagger,
                LoginResponse: loginResponseSwagger,
                RegisterResponse: registerResponseSwagger,
            },
        },
    },
    apis: ['./src/controllers/**/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;
