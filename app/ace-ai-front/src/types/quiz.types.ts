import { createContext, type ReactNode } from 'react';
import type {
  PerformanceAnalysis,
  Question,
  QuestionFeedback,
  QuestionGenerationResponse,
} from '../api/types';

declare global {
  interface Window {
    debugQuizStorage?: () => void;
  }
}

export interface ValidationState {
  subject: {
    validated: boolean;
    isValid: boolean;
    isAppropriate: boolean;
    suggestions: string[];
    warnings: string[];
    loading: boolean;
  };
  subSubjects: {
    validated: boolean;
    validSubjects: string[];
    invalidSubjects: string[];
    inappropriateSubjects: string[];
    suggestions: Record<string, string[]>;
    loading: boolean;
  };
}

export interface QuizFormData {
  topic: string;
  subSubjects: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface QuizProviderProps {
  children: ReactNode;
}

export const initialValidationState: ValidationState = {
  subject: {
    validated: false,
    isValid: false,
    isAppropriate: false,
    suggestions: [],
    warnings: [],
    loading: false,
  },
  subSubjects: {
    validated: false,
    validSubjects: [],
    invalidSubjects: [],
    inappropriateSubjects: [],
    suggestions: {},
    loading: false,
  },
};

export interface QuizSession {
  questions: Question[];
  metadata: QuestionGenerationResponse['metadata'] | null;
  currentQuestionIndex: number;
  answers: Record<string, string[]>;
  startTime: number;
  isComplete: boolean;
}

export interface QuizResults {
  // New API response fields
  score?: number; // 0-100 percentage
  correctAnswers?: number; // 0-10
  totalQuestions?: number; // Always 10 for new API
  reflection?: string; // 100-1000 chars personalized feedback
  questionReviews?: {
    questionNum: number;
    isCorrect: boolean;
    explanation?: string; // Why answer was wrong/partial
  }[];

  // Legacy fields for backward compatibility
  feedback?: QuestionFeedback[];
  analysis?: PerformanceAnalysis;
  overallReview?: {
    grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
    summary: string;
    strengths: string[];
    improvements: string[];
    nextSteps: string[];
  };
  basicScore?: number;
}

export interface QuizContextType {
  // Quiz Generation State
  formData: QuizFormData;
  validationState: ValidationState;
  isGenerating: boolean;

  // Quiz Session State
  session: QuizSession | null;

  // Quiz Results State
  results: QuizResults | null;

  // Actions
  updateFormData: (data: Partial<QuizFormData>) => void;
  updateValidationState: (state: Partial<ValidationState>) => void;
  setGenerating: (loading: boolean) => void;

  startQuiz: (
    questions: Question[],
    metadata: QuestionGenerationResponse['metadata']
  ) => void;
  answerQuestion: (questionId: number, answers: string[]) => void;
  goToQuestion: (index: number) => void;
  nextQuestion: () => boolean; // returns true if quiz is complete
  previousQuestion: () => void;

  setResults: (results: QuizResults) => void;
  resetQuiz: () => void;
  clearFormData: () => void;

  // Helpers
  canProceed: string | boolean;
  currentQuestion: Question | null;
  progress: number;
  hasAnsweredCurrentQuestion: boolean;
}

export const QuizContext = createContext<QuizContextType | undefined>(
  undefined
);

export const initialFormData: QuizFormData = {
  topic: '',
  subSubjects: '',
  difficulty: 'intermediate',
};

// localStorage keys
export const QUIZ_FORM_DATA_KEY = 'ace-quiz-form-data';
export const QUIZ_SESSION_KEY = 'ace-quiz-session';
export const QUIZ_RESULTS_KEY = 'ace-quiz-results';
export const QUIZ_VALIDATION_KEY = 'ace-quiz-validation';
