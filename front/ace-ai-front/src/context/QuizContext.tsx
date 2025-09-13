import { useEffect, useState } from 'react';
import type { Question, QuestionGenerationResponse } from '../api/types';
import {
  QuizContext,
  type QuizContextType,
  type QuizFormData,
  type QuizProviderProps,
  type QuizResults,
  type QuizSession,
  type ValidationState,
  initialFormData,
  initialValidationState,
  QUIZ_FORM_DATA_KEY,
  QUIZ_SESSION_KEY,
  QUIZ_RESULTS_KEY,
  QUIZ_VALIDATION_KEY,
} from '../types/quiz.types';

// localStorage utilities
function saveToLocalStorage<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn(`Failed to save ${key} to localStorage:`, error);
    }
  }
}

function loadFromLocalStorage<T>(key: string, defaultValue: T) {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored) as T;
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn(`Failed to load ${key} from localStorage:`, error);
    }
  }
  return defaultValue;
}

const clearFromLocalStorage = (key: string) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn(`Failed to clear ${key} from localStorage:`, error);
    }
  }
};

// Debug utility to check localStorage contents
const debugLocalStorage = () => {
  if (import.meta.env.DEV) {
    console.group('Quiz localStorage Debug');
    console.log('Form Data:', loadFromLocalStorage(QUIZ_FORM_DATA_KEY, ''));
    console.log(
      'Validation State:',
      loadFromLocalStorage(QUIZ_VALIDATION_KEY, '')
    );
    console.log('Quiz Session:', loadFromLocalStorage(QUIZ_SESSION_KEY, ''));
    console.log('Quiz Results:', loadFromLocalStorage(QUIZ_RESULTS_KEY, ''));
    console.groupEnd();
  }
};

export const QuizProvider = ({ children }: QuizProviderProps) => {
  const [formData, setFormData] = useState<QuizFormData>(() =>
    loadFromLocalStorage(QUIZ_FORM_DATA_KEY, initialFormData)
  );
  const [validationState, setValidationState] = useState<ValidationState>(() =>
    loadFromLocalStorage(QUIZ_VALIDATION_KEY, initialValidationState)
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [session, setSession] = useState<QuizSession | null>(() =>
    loadFromLocalStorage(QUIZ_SESSION_KEY, null)
  );
  const [results, setResults] = useState<QuizResults | null>(() =>
    loadFromLocalStorage(QUIZ_RESULTS_KEY, null)
  );

  // Save to localStorage whenever state changes
  useEffect(() => {
    saveToLocalStorage(QUIZ_FORM_DATA_KEY, formData);
  }, [formData]);

  useEffect(() => {
    saveToLocalStorage(QUIZ_VALIDATION_KEY, validationState);
  }, [validationState]);

  useEffect(() => {
    if (session) {
      saveToLocalStorage(QUIZ_SESSION_KEY, session);
    } else {
      clearFromLocalStorage(QUIZ_SESSION_KEY);
    }
  }, [session]);

  useEffect(() => {
    if (results) {
      saveToLocalStorage(QUIZ_RESULTS_KEY, results);
    } else {
      clearFromLocalStorage(QUIZ_RESULTS_KEY);
    }
  }, [results]);

  // Debug utility in development
  useEffect(() => {
    if (import.meta.env.DEV) {
      // Make debug function available globally in development
      window.debugQuizStorage = debugLocalStorage;

      // Auto-log localStorage contents when session changes
      if (session) {
        console.log('📚 Quiz session updated, localStorage contents:', {
          formData: loadFromLocalStorage(QUIZ_FORM_DATA_KEY, null),
          sessionQuestions: session.questions.length,
          currentIndex: session.currentQuestionIndex,
        });
      }
    }
  }, [session]);

  // Quiz Generation Actions
  const updateFormData = (data: Partial<QuizFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const updateValidationState = (state: Partial<ValidationState>) => {
    setValidationState(prev => ({
      subject: { ...prev.subject, ...(state.subject || {}) },
      subSubjects: { ...prev.subSubjects, ...(state.subSubjects || {}) },
    }));
  };

  const setGenerating = (loading: boolean) => {
    setIsGenerating(loading);
  };

  // Quiz Session Actions
  const startQuiz = (
    questions: Question[],
    metadata: QuestionGenerationResponse['metadata']
  ) => {
    setSession({
      questions,
      metadata,
      currentQuestionIndex: 0,
      answers: {},
      startTime: Date.now(),
      isComplete: false,
    });
    setResults(null); // Clear previous results
    clearFromLocalStorage(QUIZ_RESULTS_KEY); // Clear old results from localStorage
  };

  const answerQuestion = (questionId: number, answers: string[]) => {
    if (!session) {
      return;
    }

    setSession(prev => ({
      ...prev!,
      answers: {
        ...prev!.answers,
        [questionId]: answers,
      },
    }));
  };

  const goToQuestion = (index: number) => {
    if (!session || index < 0 || index >= session.questions.length) {
      return;
    }

    setSession(prev => ({
      ...prev!,
      currentQuestionIndex: index,
    }));
  };

  const nextQuestion = (): boolean => {
    if (!session) {
      return false;
    }

    if (session.currentQuestionIndex < session.questions.length - 1) {
      setSession(prev => ({
        ...prev!,
        currentQuestionIndex: prev!.currentQuestionIndex + 1,
      }));
      return false;
    } else {
      // Quiz complete
      setSession(prev => ({
        ...prev!,
        isComplete: true,
      }));
      return true;
    }
  };

  const previousQuestion = () => {
    if (!session || session.currentQuestionIndex <= 0) {
      return;
    }

    setSession(prev => ({
      ...prev!,
      currentQuestionIndex: prev!.currentQuestionIndex - 1,
    }));
  };

  const clearFormData = () => {
    setFormData(initialFormData);
    setValidationState(initialValidationState);

    // Clear form data from localStorage
    clearFromLocalStorage(QUIZ_FORM_DATA_KEY);
    clearFromLocalStorage(QUIZ_VALIDATION_KEY);
  };

  const resetQuiz = () => {
    setFormData(initialFormData);
    setValidationState(initialValidationState);
    setIsGenerating(false);
    setSession(null);
    setResults(null);

    // Clear localStorage
    clearFromLocalStorage(QUIZ_FORM_DATA_KEY);
    clearFromLocalStorage(QUIZ_VALIDATION_KEY);
    clearFromLocalStorage(QUIZ_SESSION_KEY);
    clearFromLocalStorage(QUIZ_RESULTS_KEY);
  };

  // Helper computed values
  const canProceed =
    formData.topic.trim() &&
    formData.subSubjects.trim() &&
    validationState.subject.validated &&
    validationState.subject.isValid &&
    validationState.subject.isAppropriate &&
    validationState.subSubjects.validated &&
    (validationState.subSubjects.validSubjects.length > 0 ||
      validationState.subSubjects.invalidSubjects.length > 0) &&
    validationState.subSubjects.inappropriateSubjects.length === 0;

  const currentQuestion = session
    ? session.questions[session.currentQuestionIndex]
    : null;

  const progress = session
    ? ((session.currentQuestionIndex + 1) / session.questions.length) * 100
    : 0;

  const hasAnsweredCurrentQuestion =
    session && currentQuestion
      ? !!session.answers[currentQuestion.questionNum]?.length
      : false;

  const value: QuizContextType = {
    // State
    formData,
    validationState,
    isGenerating,
    session,
    results,

    // Actions
    updateFormData,
    updateValidationState,
    setGenerating,
    startQuiz,
    answerQuestion,
    goToQuestion,
    nextQuestion,
    previousQuestion,
    setResults,
    resetQuiz,
    clearFormData,

    // Helpers
    canProceed,
    currentQuestion,
    progress,
    hasAnsweredCurrentQuestion,
  };

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
};
