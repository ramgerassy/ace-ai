import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

/**
 * Custom key generator to handle rate limiting per IP
 */
const keyGenerator = (req: Request): string => {
    // Use x-forwarded-for header if behind a proxy, otherwise use IP
    return req.headers['x-forwarded-for'] as string ||
        req.socket.remoteAddress ||
        'unknown';
};

/**
 * Custom rate limit exceeded handler
 */
const limitHandler = (_req: Request, res: Response) => {
    res.status(429).json({
        success: false,
        error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests from this IP, please try again later.',
            retryAfter: res.getHeader('Retry-After')
        }
    });
};

/**
 * Rate limiter for subject/sub-subject verification endpoints
 * More lenient as these are lightweight operations
 */
export const subjectVerificationLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute window
    max: 30, // 30 requests per minute
    message: {
        success: false,
        error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many verification requests. Please wait a moment before trying again.'
        }
    },
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false, // Disable X-RateLimit headers
    keyGenerator,
    handler: limitHandler,
    skip: (_req: Request) => {
        // Skip rate limiting in test environment
        return process.env.NODE_ENV === 'test';
    }
});

/**
 * Rate limiter for quiz generation endpoint
 * Stricter limit as this involves AI generation
 */
export const quizGenerationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes window
    max: 10, // 10 quiz generations per 15 minutes
    message: {
        success: false,
        error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many quiz generation requests. Please try again in a few minutes.'
        }
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator,
    handler: limitHandler,
    skip: (_req: Request) => {
        return process.env.NODE_ENV === 'test';
    },
    // Store to track attempts (in production, consider using Redis)
    skipSuccessfulRequests: false, // Count all requests, not just successful ones
});

/**
 * Rate limiter for quiz review endpoint
 * Moderate limit as this also involves AI processing
 */
export const quizReviewLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes window
    max: 20, // 20 reviews per 5 minutes
    message: {
        success: false,
        error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many quiz review requests. Please wait a moment before submitting again.'
        }
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator,
    handler: limitHandler,
    skip: (_req: Request) => {
        return process.env.NODE_ENV === 'test';
    }
});

/**
 * Global rate limiter for all API endpoints
 * Prevents general API abuse
 */
export const globalApiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute across all endpoints
    message: {
        success: false,
        error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests. Please slow down.'
        }
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator,
    handler: limitHandler,
    skip: (req: Request) => {
        // Skip rate limiting for health checks and in test environment
        return req.path === '/health' || process.env.NODE_ENV === 'test';
    }
});

/**
 * Create a custom rate limiter with specific options
 */
export const createCustomLimiter = (options: {
    windowMinutes: number;
    maxRequests: number;
    message: string;
}) => {
    return rateLimit({
        windowMs: options.windowMinutes * 60 * 1000,
        max: options.maxRequests,
        message: {
            success: false,
            error: {
                code: 'RATE_LIMIT_EXCEEDED',
                message: options.message
            }
        },
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator,
        handler: limitHandler,
        skip: (_req: Request) => {
            return process.env.NODE_ENV === 'test';
        }
    });
};

/**
 * Rate limit configuration that can be adjusted via environment variables
 */
export const getRateLimitConfig = () => {
    return {
        subjectVerification: {
            windowMs: parseInt(process.env.SUBJECT_VERIFY_WINDOW_MS || '60000'),
            max: parseInt(process.env.SUBJECT_VERIFY_MAX_REQUESTS || '30')
        },
        quizGeneration: {
            windowMs: parseInt(process.env.QUIZ_GEN_WINDOW_MS || '900000'),
            max: parseInt(process.env.QUIZ_GEN_MAX_REQUESTS || '10')
        },
        quizReview: {
            windowMs: parseInt(process.env.QUIZ_REVIEW_WINDOW_MS || '300000'),
            max: parseInt(process.env.QUIZ_REVIEW_MAX_REQUESTS || '20')
        },
        global: {
            windowMs: parseInt(process.env.GLOBAL_WINDOW_MS || '60000'),
            max: parseInt(process.env.GLOBAL_MAX_REQUESTS || '100')
        }
    };
};