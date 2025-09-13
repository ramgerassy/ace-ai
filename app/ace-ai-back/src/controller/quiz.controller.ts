import { Response } from 'express';
import {
    VerifySubjectRequest,
    VerifySubSubjectRequest,
    GenerateQuizRequest,
    QuizReviewRequest,
    Question,
    UserAnswer
} from '../types/quiz.types';

import { ValidatedRequest } from '../types/validation.types';
import { generateQuizWithAgent, reviewQuizWithAgent, verifySubjectWithAgent, verifySubSubjectWithAgent } from '../agent/coordinator';

/**
 * Verify if a subject is valid
* If invalid, returns 5 alternative suggestions
*/
export const verifySubject = async (
    req: ValidatedRequest<VerifySubjectRequest>,
    res: Response
): Promise<void> => {
    try {
        const { subject } = req.validatedBody!;

        console.log(`Verifying subject: ${subject}`);

        // Call AI agent to verify subject
        const result = await verifySubjectWithAgent(subject);

        if (result.isValid) {
            res.json({
                success: true,
                valid: true,
                subject: result.normalizedSubject || subject,
                message: `"${subject}" is a valid subject for quiz generation.`
            });
        } else {
            res.json({
                success: true,
                valid: false,
                suggestions: result.suggestions,
                message: `"${subject}" is not recognized. Here are some related subjects you might be interested in.`
            });
        }
    } catch (error) {
        console.error('Error in verifySubject:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'An error occurred while verifying the subject. Please try again.'
            }
        });
    }
};

/**
 * Verify if a sub-subject is related to the main subject
 * If not related, returns up to 5 related sub-subject suggestions
 */
export const verifySubSubject = async (
    req: ValidatedRequest<VerifySubSubjectRequest>,
    res: Response
): Promise<void> => {
    try {
        const { subject, subSubject } = req.validatedBody!;

        console.log(`Verifying sub-subject: ${subSubject} for subject: ${subject}`);

        // Call AI agent to verify sub-subject relationship
        const result = await verifySubSubjectWithAgent(subject, subSubject);

        if (result.isValid) {
            res.json({
                success: true,
                valid: true,
                subject: subject,
                subSubject: result.normalizedSubSubject || subSubject,
                message: `"${subSubject}" is a valid sub-topic of ${subject}.`
            });
        } else {
            res.json({
                success: true,
                valid: false,
                suggestions: result.suggestions,
                message: `"${subSubject}" is not directly related to ${subject}. Here are some related sub-topics.`
            });
        }
    } catch (error) {
        console.error('Error in verifySubSubject:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'An error occurred while verifying the sub-subject. Please try again.'
            }
        });
    }
};

/**
 * Generate a quiz with 10 multiple choice questions
 */
export const generateQuiz = async (
    req: ValidatedRequest<GenerateQuizRequest>,
    res: Response
): Promise<void> => {
    try {
        const { subject, subSubjects, level } = req.validatedBody!;

        console.log(`Generating quiz - Subject: ${subject}, Level: ${level}, Sub-subjects: ${subSubjects.join(', ') || 'None'}`);

        // Call AI agent to generate quiz
        const questions = await generateQuizWithAgent({
            subject,
            subSubjects,
            level,
            questionCount: 10
        });

        // Ensure questions are properly numbered
        const numberedQuestions: Question[] = questions.map((q: Question, index: number) => ({
            ...q,
            questionNum: index + 1
        }));

        res.json({
            success: true,
            questions: numberedQuestions,
            metadata: {
                subject,
                subSubjects,
                level,
                generatedAt: new Date().toISOString()
            }
        });
    } catch (error: any) {
        console.error('Error in generateQuiz:', error);
        
        // Handle specific insufficient questions error
        if (error.code === 'INSUFFICIENT_QUESTIONS') {
            res.status(422).json({
                success: false,
                error: {
                    code: 'INSUFFICIENT_QUESTIONS',
                    message: error.message,
                    details: {
                        requested: error.details.requested,
                        generated: error.details.generated,
                        suggestion: error.details.suggestion,
                        possibleSolutions: [
                            'Try using a broader subject (e.g., "Mathematics" instead of "Advanced Differential Equations")',
                            'Reduce the number of sub-subjects',
                            'Choose a different difficulty level',
                            'Use more common educational topics'
                        ]
                    }
                }
            });
            return;
        }
        
        // Handle general errors
        res.status(500).json({
            success: false,
            error: {
                code: 'QUIZ_GENERATION_ERROR',
                message: 'Unable to generate quiz at this time. Please try again with different parameters.',
                details: {
                    suggestion: 'Try simplifying your request or choose a different subject/topic combination.'
                }
            }
        });
    }
};

/**
 * Review user's quiz answers and provide feedback
 */
export const reviewQuiz = async (
    req: ValidatedRequest<QuizReviewRequest>,
    res: Response
): Promise<void> => {
    try {
        const { userAnswers } = req.validatedBody!;

        console.log('Reviewing quiz submission with 10 answers');

        // Calculate score
        const scoreResult = calculateScore(userAnswers);

        // Call AI agent to generate reflection paragraph
        const reflection = await reviewQuizWithAgent(userAnswers, scoreResult);

        // Create detailed review for each question
        const questionReviews = userAnswers.map((answer) => ({
            questionNum: answer.questionNum,
            isCorrect: isAnswerCorrect(answer),
            explanation: generateExplanation(answer)
        }));

        res.json({
            success: true,
            score: scoreResult.percentage,
            correctAnswers: scoreResult.correctCount,
            totalQuestions: 10,
            reflection,
            questionReviews
        });
    } catch (error) {
        console.error('Error in reviewQuiz:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'An error occurred while reviewing the quiz. Please try again.'
            }
        });
    }
};

/**
 * Calculate quiz score based on correct answers
 */
function calculateScore(userAnswers: UserAnswer[]): {
    correctCount: number;
    totalCount: number;
    percentage: number;
} {
    let correctCount = 0;
    const totalCount = userAnswers.length;

    for (const answer of userAnswers) {
        if (isAnswerCorrect(answer)) {
            correctCount++;
        }
    }

    const percentage = Math.round((correctCount / totalCount) * 100);

    return {
        correctCount,
        totalCount,
        percentage
    };
}

/**
 * Check if user's answer matches the correct answer(s)
 */
function isAnswerCorrect(answer: UserAnswer): boolean {
    // Sort arrays to compare regardless of order
    const correctAnswers = [...answer.correctAnswer].sort();
    const userAnswers = [...answer.userAnswer].sort();

    // Check if arrays are equal
    return correctAnswers.length === userAnswers.length &&
        correctAnswers.every((val, index) => val === userAnswers[index]);
}

/**
 * Generate explanation for why an answer is correct or incorrect
 */
function generateExplanation(answer: UserAnswer): string {
    const isCorrect = isAnswerCorrect(answer);

    if (isCorrect) {
        return `Correct! You selected ${formatAnswerIndices(answer.userAnswer, answer.possibleAnswers)}.`;
    } else {
        const correctText = formatAnswerIndices(answer.correctAnswer, answer.possibleAnswers);
        const userText = answer.userAnswer.length > 0
            ? formatAnswerIndices(answer.userAnswer, answer.possibleAnswers)
            : 'no answer';

        return `Incorrect. You selected ${userText}, but the correct answer is ${correctText}.`;
    }
}

/**
 * Format answer indices to readable text
 */
function formatAnswerIndices(indices: number[], possibleAnswers: string[]): string {
    if (indices.length === 0) return 'nothing';

    if (indices.length === 1) {
        return `"${possibleAnswers[indices[0]]}"`;
    }

    const answers = indices.map(i => `"${possibleAnswers[i]}"`);
    const lastAnswer = answers.pop();
    return `${answers.join(', ')} and ${lastAnswer}`;
}