import { z } from 'zod';
import {
    verifySubjectSchema,
    verifySubSubjectSchema,
    generateQuizSchema,
    quizReviewSchema,
    questionSchema,
    userAnswerSchema,
    difficultyLevel,
    errorResponseSchema,
    verifySubjectSuccessResponseSchema,
    verifySubSubjectSuccessResponseSchema,
    generateQuizSuccessResponseSchema,
    reviewQuizSuccessResponseSchema
} from '../utils/validation';

/**
 * Request types
 */
export type VerifySubjectRequest = z.infer<typeof verifySubjectSchema>;
export type VerifySubSubjectRequest = z.infer<typeof verifySubSubjectSchema>;
export type GenerateQuizRequest = z.infer<typeof generateQuizSchema>;
export type QuizReviewRequest = z.infer<typeof quizReviewSchema>;

/**
 * Entity types
 */
export type Question = z.infer<typeof questionSchema>;
export type UserAnswer = z.infer<typeof userAnswerSchema>;
export type DifficultyLevel = z.infer<typeof difficultyLevel>;

/**
 * Response types
 */
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
export type VerifySubjectResponse = z.infer<typeof verifySubjectSuccessResponseSchema> | ErrorResponse;
export type VerifySubSubjectResponse = z.infer<typeof verifySubSubjectSuccessResponseSchema> | ErrorResponse;
export type GenerateQuizResponse = z.infer<typeof generateQuizSuccessResponseSchema> | ErrorResponse;
export type ReviewQuizResponse = z.infer<typeof reviewQuizSuccessResponseSchema> | ErrorResponse;