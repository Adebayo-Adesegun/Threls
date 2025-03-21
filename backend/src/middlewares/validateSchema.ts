import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';

function validateSchema(schema: Schema) {
    return async function schemaValidator(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        const { error } = schema.validate(req.body, { abortEarly: false });

        if (error) {
            res.status(400).json({
                message: 'Validation failed',
                errors: error.details.map((detail) => ({
                    field: detail.path[0],
                    message: detail.message,
                })),
            });
            return;
        }

        next();
    };
}

export default validateSchema;
