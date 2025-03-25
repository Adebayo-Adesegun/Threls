import { Request, Response, NextFunction } from 'express';
import { ObjectSchema } from 'joi';

type AsyncRequestHandler = (
    req: Request,
    res: Response,
    next: NextFunction,
) => Promise<unknown>;

function validateDecorator(
    schema: ObjectSchema,
): (
    target: unknown,
    key: string,
    descriptor: PropertyDescriptor,
) => PropertyDescriptor {
    return function applyValidation(
        _target: unknown,
        _key: string,
        descriptor: PropertyDescriptor,
    ): PropertyDescriptor {
        const originalMethod = descriptor.value as AsyncRequestHandler;

        async function validatedHandler(
            this: unknown,
            req: Request,
            res: Response,
            next: NextFunction,
        ): Promise<unknown> {
            try {
                const { error } = schema.validate(req.body, {
                    abortEarly: false,
                });

                if (error) {
                    return res.status(400).json({
                        message: 'Validation error',
                        errors: error.details.map((d) => d.message),
                    });
                }

                return await originalMethod.apply(this, [req, res, next]);
            } catch (err) {
                next(err);
                return Promise.resolve(); // Ensures consistent return
            }
        }

        return {
            ...descriptor,
            value: validatedHandler,
        };
    };
}

export default validateDecorator;
