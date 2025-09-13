import { Router } from 'express';
import {
    validateRequest,
} from '../middleware/validation';
import {
    subjectVerificationLimiter,
    quizGenerationLimiter,
    quizReviewLimiter
} from '../middleware/rateLimit';
import {
    verifySubjectSchema,
    verifySubSubjectSchema,
    generateQuizSchema,
    quizReviewSchema
} from '../utils/validation';
import {
    verifySubject,
    verifySubSubject,
    generateQuiz,
    reviewQuiz
} from '../controller/quiz.controller';

// Create router instance
const router = Router();

/**
 * @route   POST /api/verify-subject
 * @desc    Verify if a subject is valid, suggest alternatives if not
 * @access  Public (rate limited)
 * @returns Valid subject confirmation or array of 5 subject suggestions
 */
router.post(
    '/verify-subject',
    subjectVerificationLimiter,
    validateRequest({ body: verifySubjectSchema }),
    verifySubject
);

/**
 * @route   POST /api/verify-sub-subject
 * @desc    Verify if sub-subject is related to main subject
 * @access  Public (rate limited)
 * @returns Valid sub-subject confirmation or array of up to 5 related sub-subjects
 */
router.post(
    '/verify-sub-subject',
    subjectVerificationLimiter,
    validateRequest({ body: verifySubSubjectSchema }),
    verifySubSubject
);

/**
 * @route   POST /api/generate-quiz
 * @desc    Generate 10 multiple choice questions based on subject and level
 * @access  Public (rate limited)
 * @returns Array of 10 Question objects with questionNum, question, possibleAnswers, correctAnswer
 */
router.post(
    '/generate-quiz',
    quizGenerationLimiter,
    validateRequest({ body: generateQuizSchema }),
    generateQuiz
);

/**
 * @route   POST /api/review-quiz
 * @desc    Review user's quiz answers and provide feedback
 * @access  Public (rate limited)
 * @returns Score, reflection paragraph, and detailed review
 */
router.post(
    '/review-quiz',
    quizReviewLimiter,
    validateRequest({ body: quizReviewSchema }),
    reviewQuiz
);

// Health check for quiz service
router.get('/health', (_req, res) => {
    res.json({
        service: 'quiz-api',
        status: 'healthy',
        version: '1.0.0',
        endpoints: [
            {
                method: 'POST',
                path: '/api/verify-subject',
                description: 'Verify subject validity'
            },
            {
                method: 'POST',
                path: '/api/verify-sub-subject',
                description: 'Verify sub-subject relation to subject'
            },
            {
                method: 'POST',
                path: '/api/generate-quiz',
                description: 'Generate 10 multiple choice questions'
            },
            {
                method: 'POST',
                path: '/api/review-quiz',
                description: 'Review quiz answers and provide feedback'
            }
        ],
        timestamp: new Date().toISOString()
    });
});

// Export the router
export default router;