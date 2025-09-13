import { Request, Response } from 'express';

/**
 * 404 Not Found middleware
 * This should be placed after all other routes and before error handlers
 */
export const notFoundHandler = (
    req: Request,
    res: Response,
): void => {
    const error = {
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: `Cannot ${req.method} ${req.originalUrl}`,
            details: {
                method: req.method,
                path: req.originalUrl,
                timestamp: new Date().toISOString()
            }
        }
    };

    res.status(404).json(error);
};

/**
 * Alternative 404 handler with more detailed information
 * Use this if you want to provide API documentation hints
 */
export const detailedNotFoundHandler = (
    req: Request,
    res: Response,
): void => {
    const availableEndpoints = [
        'POST /api/verify-subject',
        'POST /api/verify-sub-subject',
        'POST /api/generate-quiz',
        'POST /api/review-quiz',
        'GET /api/health',
        'GET /health'
    ];

    const error = {
        success: false,
        error: {
            code: 'ENDPOINT_NOT_FOUND',
            message: `The endpoint ${req.method} ${req.originalUrl} does not exist`,
            details: {
                requestedMethod: req.method,
                requestedPath: req.originalUrl,
                availableEndpoints,
                hint: 'Please check the API documentation for valid endpoints',
                timestamp: new Date().toISOString()
            }
        }
    };

    res.status(404).json(error);
};

/**
 * Middleware to handle requests to /api without a specific endpoint
 */
export const apiRootHandler = (
    _req: Request,
    res: Response
): void => {
    res.status(200).json({
        success: true,
        service: 'QuizMaster API',
        version: '1.0.0',
        message: 'Welcome to QuizMaster API. Please use one of the available endpoints.',
        endpoints: {
            quiz: {
                verifySubject: {
                    method: 'POST',
                    path: '/api/verify-subject',
                    description: 'Verify if a subject is valid for quiz generation'
                },
                verifySubSubject: {
                    method: 'POST',
                    path: '/api/verify-sub-subject',
                    description: 'Verify if a sub-subject is related to the main subject'
                },
                generateQuiz: {
                    method: 'POST',
                    path: '/api/generate-quiz',
                    description: 'Generate a quiz with 10 multiple choice questions'
                },
                reviewQuiz: {
                    method: 'POST',
                    path: '/api/review-quiz',
                    description: 'Review quiz answers and get feedback'
                }
            },
            health: {
                serviceHealth: {
                    method: 'GET',
                    path: '/api/health',
                    description: 'Check quiz service health'
                },
                appHealth: {
                    method: 'GET',
                    path: '/health',
                    description: 'Check application health'
                }
            }
        },
        documentation: 'https://your-docs-url.com/api'
    });
};

/**
 * Middleware to handle method not allowed
 * Use this when a route exists but the HTTP method is not supported
 */
export const methodNotAllowedHandler = (allowedMethods: string[]) => {
    return (req: Request, res: Response): void => {
        res.status(405).json({
            success: false,
            error: {
                code: 'METHOD_NOT_ALLOWED',
                message: `Method ${req.method} is not allowed for ${req.originalUrl}`,
                details: {
                    allowedMethods,
                    receivedMethod: req.method,
                    path: req.originalUrl
                }
            }
        });
    };
};

/**
 * Create a custom 404 handler for specific route groups
 */
export const createCustomNotFoundHandler = (routeGroup: string) => {
    return (req: Request, res: Response): void => {
        res.status(404).json({
            success: false,
            error: {
                code: 'NOT_FOUND',
                message: `No ${routeGroup} endpoint found at ${req.originalUrl}`,
                details: {
                    routeGroup,
                    path: req.originalUrl,
                    method: req.method,
                    hint: `This appears to be a ${routeGroup} route, but it doesn't exist. Check your endpoint path.`
                }
            }
        });
    };
};