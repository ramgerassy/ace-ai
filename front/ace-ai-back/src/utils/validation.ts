import { z } from 'zod';
import type { Question, UserAnswer } from '../types/quiz.types';

/**
 * Schema for verify-subject endpoint
 */
export const verifySubjectSchema = z.object({
    subject: z.string()
        .min(2, 'Subject must be at least 2 characters')
        .max(100, 'Subject must be less than 100 characters')
        .trim()
        .regex(
            /^[a-zA-Z0-9\s\-&,.()]+$/,
            'Subject contains invalid characters. Only letters, numbers, spaces, and basic punctuation allowed.'
        )
});

/**
 * Schema for verify-sub-subject endpoint
 */
export const verifySubSubjectSchema = z.object({
    subject: z.string()
        .min(2, 'Subject must be at least 2 characters')
        .max(100, 'Subject must be less than 100 characters')
        .trim()
        .regex(
            /^[a-zA-Z0-9\s\-&,.()]+$/,
            'Subject contains invalid characters'
        ),
    subSubject: z.string()
        .min(2, 'Sub-subject must be at least 2 characters')
        .max(150, 'Sub-subject must be less than 150 characters')
        .trim()
        .regex(
            /^[a-zA-Z0-9\s\-&,.()/:]+$/,
            'Sub-subject contains invalid characters'
        )
});

/**
 * Schema for difficulty level
 */
export const difficultyLevel = z.enum(['easy', 'intermediate', 'hard'], {
    message: 'Difficulty must be either "easy", "intermediate", or "hard"'
});

/**
 * Schema for generate-quiz endpoint
 */
export const generateQuizSchema = z.object({
    subject: z.string()
        .min(2, 'Subject must be at least 2 characters')
        .max(100, 'Subject must be less than 100 characters')
        .trim()
        .regex(
            /^[a-zA-Z0-9\s\-&,.()]+$/,
            'Subject contains invalid characters'
        ),
    subSubjects: z.array(
        z.string()
            .min(2, 'Each sub-subject must be at least 2 characters')
            .max(150, 'Each sub-subject must be less than 150 characters')
            .trim()
    )
        .min(0, 'Sub-subjects array cannot have negative length')
        .max(10, 'Maximum 10 sub-subjects allowed')
        .default([]),
    level: difficultyLevel
});

/**
 * Schema for Question object returned from quiz generation
 */
export const questionSchema = z.object({
    questionNum: z.number()
        .int('Question number must be an integer')
        .min(1, 'Question number must be at least 1')
        .max(10, 'Question number must not exceed 10'),
    question: z.string()
        .min(10, 'Question must be at least 10 characters')
        .max(500, 'Question must be less than 500 characters'),
    possibleAnswers: z.array(z.string())
        .length(4, 'Must have exactly 4 possible answers'),
    correctAnswer: z.array(
        z.number()
            .int('Answer index must be an integer')
            .min(0, 'Answer index must be at least 0')
            .max(3, 'Answer index must not exceed 3')
    )
        .min(1, 'At least one correct answer must be specified')
        .max(4, 'Cannot have more than 4 correct answers')
});

/**
 * Schema for UserAnswer object (includes user's selection)
 */
export const userAnswerSchema = questionSchema.extend({
    userAnswer: z.array(
        z.number()
            .int('Answer index must be an integer')
            .min(0, 'Answer index must be at least 0')
            .max(3, 'Answer index must not exceed 3')
    )
        .min(0, 'User answer can be empty')
        .max(4, 'Cannot select more than 4 answers')
});

/**
 * Schema for review-quiz endpoint
 */
export const quizReviewSchema = z.object({
    userAnswers: z.array(userAnswerSchema)
        .length(10, 'Must submit exactly 10 answers')
});

/**
 * Common error response schema
 */
export const errorResponseSchema = z.object({
    success: z.literal(false),
    error: z.object({
        code: z.string(),
        message: z.string(),
        details: z.any().optional()
    })
});

/**
 * Response schemas for type safety
 */

// Verify subject response
export const verifySubjectSuccessResponseSchema = z.discriminatedUnion('valid', [
    z.object({
        success: z.literal(true),
        valid: z.literal(true),
        subject: z.string(),
        message: z.string()
    }),
    z.object({
        success: z.literal(true),
        valid: z.literal(false),
        suggestions: z.array(z.string()).length(5),
        message: z.string()
    })
]);

// Verify sub-subject response
export const verifySubSubjectSuccessResponseSchema = z.discriminatedUnion('valid', [
    z.object({
        success: z.literal(true),
        valid: z.literal(true),
        subject: z.string(),
        subSubject: z.string(),
        message: z.string()
    }),
    z.object({
        success: z.literal(true),
        valid: z.literal(false),
        suggestions: z.array(z.string()).max(5),
        message: z.string()
    })
]);

// Generate quiz response
export const generateQuizSuccessResponseSchema = z.object({
    success: z.literal(true),
    questions: z.array(questionSchema).length(10),
    metadata: z.object({
        subject: z.string(),
        subSubjects: z.array(z.string()),
        level: difficultyLevel,
        generatedAt: z.string().datetime()
    })
});

// Review quiz response
export const reviewQuizSuccessResponseSchema = z.object({
    success: z.literal(true),
    score: z.number().min(0).max(100),
    correctAnswers: z.number().int().min(0).max(10),
    totalQuestions: z.literal(10),
    reflection: z.string()
        .min(100, 'Reflection must be at least 100 characters')
        .max(1000, 'Reflection must be less than 1000 characters'),
    questionReviews: z.array(
        z.object({
            questionNum: z.number(),
            isCorrect: z.boolean(),
            explanation: z.string().optional()
        })
    )
});

/**
 * Note: Type exports have been moved to src/types/quiz.types.ts
 * Import types from there instead of this file
 */

/**
 * Validation helper functions
 */
export const validateQuestionArray = (questions: unknown): Question[] => {
    const questionsArray = z.array(questionSchema).length(10);
    return questionsArray.parse(questions);
};

export const validateUserAnswerArray = (answers: unknown): UserAnswer[] => {
    const answersArray = z.array(userAnswerSchema).length(10);
    return answersArray.parse(answers);
};

/**
 * Custom error formatter for better error messages
 */
export const formatZodError = (error: z.ZodError) => {
    return {
        success: false,
        error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: error.message
        }
    };
};