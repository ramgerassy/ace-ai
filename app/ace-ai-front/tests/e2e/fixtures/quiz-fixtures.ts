/**
 * Quiz test fixtures for e2e tests
 * Contains predefined quiz data for consistent testing
 */

import type { Question, QuestionOption } from '../../../src/api/types';

/**
 * Test data for quiz generation form
 */
export const quizFormData = {
  valid: {
    subject: 'Mathematics',
    subSubjects: ['Algebra', 'Geometry'],
    level: 'intermediate' as const,
    questionCount: 5,
  },
  beginner: {
    subject: 'History',
    subSubjects: ['World War II', 'Ancient Rome'],
    level: 'beginner' as const,
    questionCount: 3,
  },
  advanced: {
    subject: 'Computer Science',
    subSubjects: ['Algorithms', 'Data Structures'],
    level: 'advanced' as const,
    questionCount: 10,
  },
  invalid: {
    emptySubject: {
      subject: '',
      subSubjects: ['Test'],
      level: 'beginner' as const,
      questionCount: 5,
    },
    emptySubSubjects: {
      subject: 'Mathematics',
      subSubjects: [],
      level: 'beginner' as const,
      questionCount: 5,
    },
    invalidQuestionCount: {
      subject: 'Mathematics',
      subSubjects: ['Algebra'],
      level: 'beginner' as const,
      questionCount: 0,
    },
  },
} as const;

/**
 * Mock quiz questions for testing
 */
export const mockQuestions: Question[] = [
  {
    id: 'q1',
    question: 'What is 2 + 2?',
    options: [
      { id: 'opt1', text: '3', isCorrect: false },
      { id: 'opt2', text: '4', isCorrect: true },
      { id: 'opt3', text: '5', isCorrect: false },
      { id: 'opt4', text: '6', isCorrect: false },
    ],
    correctAnswers: ['opt2'],
    explanation: 'Basic addition: 2 + 2 = 4',
    difficulty: 'easy',
    subSubject: 'Basic Math',
    tags: ['addition', 'arithmetic'],
  },
  {
    id: 'q2',
    question: 'Which of the following are prime numbers? (Select all that apply)',
    options: [
      { id: 'opt1', text: '2', isCorrect: true },
      { id: 'opt2', text: '3', isCorrect: true },
      { id: 'opt3', text: '4', isCorrect: false },
      { id: 'opt4', text: '9', isCorrect: false },
    ],
    correctAnswers: ['opt1', 'opt2'],
    explanation: 'Prime numbers are natural numbers greater than 1 that have no positive divisors other than 1 and themselves.',
    difficulty: 'medium',
    subSubject: 'Number Theory',
    tags: ['prime', 'numbers'],
  },
  {
    id: 'q3',
    question: 'What is the derivative of x²?',
    options: [
      { id: 'opt1', text: '2x', isCorrect: true },
      { id: 'opt2', text: 'x', isCorrect: false },
      { id: 'opt3', text: '2x²', isCorrect: false },
      { id: 'opt4', text: 'x²', isCorrect: false },
    ],
    correctAnswers: ['opt1'],
    explanation: 'Using the power rule: d/dx(x²) = 2x¹ = 2x',
    difficulty: 'hard',
    subSubject: 'Calculus',
    tags: ['derivative', 'calculus'],
  },
];

/**
 * Mock quiz generation response
 */
export const mockQuizResponse = {
  questions: mockQuestions,
  metadata: {
    subject: 'Mathematics',
    subSubjects: ['Algebra', 'Calculus'],
    level: 'intermediate',
    totalQuestions: mockQuestions.length,
    estimatedDuration: 15, // minutes
  },
};

/**
 * Test data for user answers
 */
export const testAnswers = {
  allCorrect: [
    { questionId: 'q1', selectedAnswers: ['opt2'] },
    { questionId: 'q2', selectedAnswers: ['opt1', 'opt2'] },
    { questionId: 'q3', selectedAnswers: ['opt1'] },
  ],
  allIncorrect: [
    { questionId: 'q1', selectedAnswers: ['opt1'] },
    { questionId: 'q2', selectedAnswers: ['opt3', 'opt4'] },
    { questionId: 'q3', selectedAnswers: ['opt2'] },
  ],
  mixed: [
    { questionId: 'q1', selectedAnswers: ['opt2'] }, // correct
    { questionId: 'q2', selectedAnswers: ['opt1'] }, // partially correct
    { questionId: 'q3', selectedAnswers: ['opt2'] }, // incorrect
  ],
  incomplete: [
    { questionId: 'q1', selectedAnswers: ['opt2'] },
    { questionId: 'q2', selectedAnswers: [] }, // no answer
    // q3 not answered at all
  ],
};

/**
 * Mock feedback response
 */
export const mockFeedbackResponse = {
  feedback: [
    {
      questionId: 'q1',
      isCorrect: true,
      userAnswers: ['opt2'],
      correctAnswers: ['opt2'],
      explanation: 'Basic addition: 2 + 2 = 4',
      tips: ['Great job with basic arithmetic!'],
    },
    {
      questionId: 'q2',
      isCorrect: false,
      userAnswers: ['opt1'],
      correctAnswers: ['opt1', 'opt2'],
      explanation: 'Prime numbers are natural numbers greater than 1 that have no positive divisors other than 1 and themselves.',
      tips: ['Remember that both 2 and 3 are prime numbers', 'You got one correct - 2 is indeed prime'],
    },
    {
      questionId: 'q3',
      isCorrect: false,
      userAnswers: ['opt2'],
      correctAnswers: ['opt1'],
      explanation: 'Using the power rule: d/dx(x²) = 2x¹ = 2x',
      tips: ['Review the power rule for derivatives', 'The derivative of x^n is n*x^(n-1)'],
    },
  ],
  analysis: {
    totalQuestions: 3,
    correctAnswers: 1,
    incorrectAnswers: 2,
    score: 1,
    percentage: 33,
    timeSpent: 300, // 5 minutes
    averageTimePerQuestion: 100, // seconds
    strongAreas: ['Basic Math'],
    weakAreas: ['Number Theory', 'Calculus'],
    recommendations: [
      'Focus on understanding prime numbers',
      'Practice derivative calculations',
      'Review fundamental mathematical concepts',
    ],
  },
  overallReview: {
    grade: 'C' as const,
    summary: 'You have a good foundation in basic math but need to work on more advanced topics.',
    strengths: ['Basic arithmetic operations'],
    improvements: ['Prime number identification', 'Calculus fundamentals'],
    nextSteps: [
      'Practice identifying prime numbers',
      'Study the power rule for derivatives',
      'Take more practice quizzes on these topics',
    ],
  },
};

/**
 * Validation test cases for quiz form
 */
export const validationTests = {
  subjects: {
    tooShort: 'A',
    tooLong: 'A'.repeat(101),
    withNumbers: 'Math 101',
    withSpecialChars: 'Computer Science & Engineering',
    valid: ['Mathematics', 'History', 'Science', 'Literature'],
  },
  subSubjects: {
    empty: [],
    tooMany: Array(21).fill('Topic'), // assuming max is 20
    mixed: ['Valid Topic', '', '  ', 'Another Valid Topic'],
    valid: ['Algebra', 'Geometry', 'Trigonometry'],
  },
  questionCounts: {
    tooLow: 0,
    tooHigh: 51, // assuming max is 50
    negative: -5,
    valid: [3, 5, 10, 15, 20],
  },
} as const;