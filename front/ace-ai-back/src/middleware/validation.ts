import { Response, NextFunction } from 'express';
import { z, ZodError, ZodSchema } from 'zod';
import { formatZodError } from '../utils/validation';
import { ValidationSchemas, ValidatedRequest } from '../types/validation.types';

/**
 * Middleware to validate request data against Zod schemas
 * @param schemas - Object containing Zod schemas for body, query, and params
 */
export const validateRequest = (schemas: ValidationSchemas) => {
    return async (
        req: ValidatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            // Validate request body if schema provided
            if (schemas.body) {
                const validatedBody = await schemas.body.parseAsync(req.body);
                req.validatedBody = validatedBody;
                req.body = validatedBody; // Also update original body for compatibility
            }

            // Validate query parameters if schema provided
            if (schemas.query) {
                const validatedQuery = await schemas.query.parseAsync(req.query);
                req.validatedQuery = validatedQuery;
                // Don't reassign req.query to avoid type conflicts
            }

            // Validate URL parameters if schema provided
            if (schemas.params) {
                const validatedParams = await schemas.params.parseAsync(req.params);
                req.validatedParams = validatedParams;
                // Don't reassign req.params to avoid type conflicts
            }

            // All validations passed, proceed to next middleware
            next();
        } catch (error) {
            // Handle Zod validation errors
            if (error instanceof ZodError) {
                res.status(400).json(formatZodError(error));
                return;
            }

            // Handle other errors
            console.error('Validation middleware error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'An error occurred during validation'
                }
            });
        }
    };
};

/**
 * Middleware to validate just the request body
 * Convenience function for common use case
 */
export const validateBody = (schema: ZodSchema) => {
    return validateRequest({ body: schema });
};

/**
 * Middleware to validate just query parameters
 * Convenience function for common use case
 */
export const validateQuery = (schema: ZodSchema) => {
    return validateRequest({ query: schema });
};

/**
 * Middleware to validate just URL parameters
 * Convenience function for common use case
 */
export const validateParams = (schema: ZodSchema) => {
    return validateRequest({ params: schema });
};

/**
 * Create a simple schema for basic param validation
 * Used in routes like GET /api/quiz/:quizId
 */
export const createParamSchema = (paramName: string, type: 'string' | 'number' | 'uuid' = 'string') => {
    const schemas: Record<string, ZodSchema> = {
        string: z.string().min(1, `${paramName} is required`),
        number: z.string().regex(/^\d+$/, `${paramName} must be a number`).transform(Number),
        uuid: z.string().uuid(`${paramName} must be a valid UUID`)
    };

    return z.object({
        [paramName]: schemas[type]
    });
};

/**
 * Create a simple schema for query validation with optional fields
 * Handles the '?' notation from the routes
 */
export const createQuerySchema = (fields: Record<string, string>) => {
    const schemaObject: Record<string, ZodSchema> = {};

    Object.entries(fields).forEach(([key, type]) => {
        const isOptional = type.endsWith('?');
        const baseType = type.replace('?', '');

        let schema: ZodSchema;
        switch (baseType) {
            case 'string':
                schema = z.string();
                break;
            case 'number':
                // For query params, numbers come as strings
                schema = z.string().regex(/^\d+$/, `${key} must be a number`).transform(Number);
                break;
            case 'boolean':
                // For query params, booleans come as strings
                schema = z.string().transform(val => val === 'true');
                break;
            default:
                schema = z.string();
        }

        schemaObject[key] = isOptional ? schema.optional() : schema;
    });

    return z.object(schemaObject);
};

/**
 * Async validation wrapper for custom validation logic
 */
export const createAsyncValidator = (
    validationFn: (data: any) => Promise<boolean>,
    errorMessage: string
) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const isValid = await validationFn(req.body);
            if (!isValid) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: errorMessage
                    }
                });
                return;
            }
            next();
        } catch (error) {
            console.error('Async validation error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Validation failed'
                }
            });
        }
    };
};

/**
 * Combine multiple validation middlewares
 */
export const combineValidators = (...validators: Array<any>) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        for (const validator of validators) {
            await new Promise<void>((resolve, reject) => {
                validator(req, res, (err?: any) => {
                    if (err) reject(err);
                    else resolve();
                });
            }).catch(() => {
                // Response already sent by validator
                return;
            });

            // If response was sent by a validator, stop processing
            if (res.headersSent) {
                return;
            }
        }
        next();
    };
};