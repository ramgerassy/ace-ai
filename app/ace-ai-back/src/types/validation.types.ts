import { Request } from 'express';
import { ZodSchema } from 'zod';

/**
 * Interface for validation schemas
 */
export interface ValidationSchemas {
    body?: ZodSchema;
    query?: ZodSchema;
    params?: ZodSchema;
}

/**
 * Extended request interface to include validated data
 */
export interface ValidatedRequest<
    TBody = any,
    TQuery = any,
    TParams = any
> extends Request {
    validatedBody?: TBody;
    validatedQuery?: TQuery;
    validatedParams?: TParams;
}