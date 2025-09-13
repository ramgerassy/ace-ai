// API Types and Interfaces for Quiz System - Updated to match API Contract

// Base API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

// Verify Subject API Types
export interface VerifySubjectRequest {
  subject: string; // 2-100 characters, alphanumeric + basic punctuation
}

export interface ValidSubjectResponse {
  success: true;
  valid: true;
  subject: string; // Normalized subject name
  message: string; // Confirmation message
}

export interface InvalidSubjectResponse {
  success: true;
  valid: false;
  suggestions: string[]; // Exactly 5 alternative subjects
  message: string; // Explanation why invalid
}

export type VerifySubjectResponse =
  | ValidSubjectResponse
  | InvalidSubjectResponse;

// Verify Sub-Subject API Types
export interface VerifySubSubjectRequest {
  subject: string; // 2-100 characters
  subSubject: string; // 2-150 characters
}

export interface ValidSubSubjectResponse {
  success: true;
  valid: true;
  subject: string; // Normalized subject
  subSubject: string; // Normalized sub-subject
  message: string; // Confirmation message
}

export interface InvalidSubSubjectResponse {
  success: true;
  valid: false;
  suggestions: string[]; // Up to 5 related sub-subjects
  message: string; // Explanation why invalid
}

export type VerifySubSubjectResponse =
  | ValidSubSubjectResponse
  | InvalidSubSubjectResponse;

// Generate Quiz API Types
export interface GenerateQuizRequest {
  subject: string; // 2-100 characters
  subSubjects: string[]; // 0-10 sub-subjects, each 2-150 chars
  level: 'easy' | 'intermediate' | 'hard';
}

export interface Question {
  questionNum: number; // 1-10
  question: string; // 10-500 characters
  possibleAnswers: string[]; // Exactly 4 options
  correctAnswer: number[]; // Indices of correct answers (0-3)
}

export interface GenerateQuizResponse {
  success: true;
  questions: Question[]; // Array of exactly 10 questions
  metadata: {
    subject: string;
    subSubjects: string[];
    level: 'easy' | 'intermediate' | 'hard';
    generatedAt: string; // ISO 8601 datetime
  };
}

// Review Quiz API Types
export interface UserAnswer {
  questionNum: number; // 1-10
  question: string; // The original question
  possibleAnswers: string[]; // The 4 options
  correctAnswer: number[]; // Correct answer indices
  userAnswer: number[]; // User's selected indices (can be empty)
}

export interface QuizReviewRequest {
  userAnswers: UserAnswer[]; // Exactly 10 answers
}

export interface ReviewQuizResponse {
  success: true;
  score: number; // 0-100 percentage
  correctAnswers: number; // 0-10
  totalQuestions: 10; // Always 10
  reflection: string; // 100-1000 chars personalized feedback
  questionReviews: {
    questionNum: number;
    isCorrect: boolean;
    explanation?: string; // Why answer was wrong/partial
  }[];
}

// Legacy types for backward compatibility (deprecated)
export interface SubjectVerificationRequest {
  subject: string;
}

export interface SubjectVerificationResponse {
  isValid: boolean;
  isAppropriate: boolean;
  suggestedSubjects?: string[];
  warnings?: string[];
}

export interface SubSubjectVerificationRequest {
  subject: string;
  subSubjects: string[];
}

export interface SubSubjectVerificationResponse {
  validSubjects: string[];
  invalidSubjects: string[];
  inappropriateSubjects: string[];
  suggestions?: Record<string, string[]>;
}

export interface QuestionGenerationRequest {
  subject: string;
  subSubjects: string[];
  level: 'beginner' | 'intermediate' | 'advanced';
  questionCount?: number;
}

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface LegacyQuestion {
  id: string;
  question: string;
  options: QuestionOption[];
  correctAnswers: string[];
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  subSubject: string;
  tags: string[];
}

export interface QuestionGenerationResponse {
  questions: LegacyQuestion[];
  metadata: {
    subject: string;
    subSubjects: string[];
    level: string;
    totalQuestions: number;
    estimatedDuration: number;
  };
}

export interface LegacyUserAnswer {
  questionId: string;
  selectedAnswers: string[];
}

export interface FeedbackRequest {
  questions: LegacyQuestion[];
  userAnswers: LegacyUserAnswer[];
  metadata?: {
    subject: string;
    level: string;
    timeSpent?: number;
  };
}

export interface QuestionFeedback {
  questionId: string;
  isCorrect: boolean;
  userAnswers: string[];
  correctAnswers: string[];
  explanation: string;
  tips?: string[];
}

export interface PerformanceAnalysis {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  score: number;
  percentage: number;
  timeSpent?: number;
  averageTimePerQuestion?: number;
  strongAreas: string[];
  weakAreas: string[];
  recommendations: string[];
}

export interface FeedbackResponse {
  feedback: QuestionFeedback[];
  analysis: PerformanceAnalysis;
  overallReview: {
    grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
    summary: string;
    strengths: string[];
    improvements: string[];
    nextSteps: string[];
  };
}

export type QuizLevel = 'beginner' | 'intermediate' | 'advanced';
export type QuizDifficulty = 'easy' | 'medium' | 'hard';

// Error types
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: ValidationError[];
}
