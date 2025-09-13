import { DifficultyLevel } from './quiz.types';

/**
 * Agent-related types for quiz operations
 */

export interface SubjectValidationResult {
    isValid: boolean;
    normalizedSubject?: string;
    suggestions: string[];
    reasoning?: string;
}

export interface SubSubjectValidationResult {
    isValid: boolean;
    normalizedSubSubject?: string;
    suggestions: string[];
    reasoning?: string;
}

export interface QuizGenerationParams {
    subject: string;
    subSubjects: string[];
    level: DifficultyLevel;
    questionCount: number;
}

export interface ScoreResult {
    correctCount: number;
    totalCount: number;
    percentage: number;
}