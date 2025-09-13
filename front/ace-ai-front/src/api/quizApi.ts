// Quiz API implementation with mock data and validation

import type {
  ApiResponse,
  FeedbackRequest,
  FeedbackResponse,
  PerformanceAnalysis,
  Question,
  QuestionFeedback,
  QuestionGenerationRequest,
  QuestionGenerationResponse,
  SubSubjectVerificationRequest,
  SubSubjectVerificationResponse,
  SubjectVerificationRequest,
  SubjectVerificationResponse,
} from './types';

import {
  INAPPROPRIATE_SUBJECTS,
  INAPPROPRIATE_SUB_SUBJECTS,
  LEARNING_RECOMMENDATIONS,
  MOCK_QUESTIONS,
  PERFORMANCE_MESSAGES,
  SUBJECT_SUGGESTIONS,
  VALID_SUBJECTS,
  VALID_SUB_SUBJECTS,
} from './mockData';

// Utility functions for validation
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ');
};

const containsInappropriateContent = (
  text: string,
  inappropriateList: string[]
): boolean => {
  const normalizedText = normalizeText(text);
  return inappropriateList.some(inappropriate =>
    normalizedText.includes(normalizeText(inappropriate))
  );
};

const findSimilarSubjects = (input: string): string[] => {
  const normalized = normalizeText(input);

  // Check direct suggestions
  for (const [key, suggestions] of Object.entries(SUBJECT_SUGGESTIONS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return suggestions;
    }
  }

  // Check partial matches with valid subjects
  return VALID_SUBJECTS.filter(
    subject => subject.includes(normalized) || normalized.includes(subject)
  ).slice(0, 5);
};

// Simulate API delay
const simulateDelay = (ms: number = 1000): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Verify Subject Endpoint
 * Validates if a subject is appropriate and educational
 */
export const verifySubject = async (
  request: SubjectVerificationRequest
): Promise<ApiResponse<SubjectVerificationResponse>> => {
  await simulateDelay(800);

  const { subject } = request;

  if (!subject || subject.trim().length === 0) {
    return {
      success: false,
      error: 'Subject is required',
    };
  }

  const normalizedSubject = normalizeText(subject);

  // Check for inappropriate content
  const isInappropriate = containsInappropriateContent(
    subject,
    INAPPROPRIATE_SUBJECTS
  );

  if (isInappropriate) {
    return {
      success: true,
      data: {
        isValid: false,
        isAppropriate: false,
        suggestedSubjects: ['mathematics', 'science', 'history', 'literature'],
        warnings: [
          'This subject contains inappropriate content.',
          'Please choose an educational topic that promotes positive learning.',
        ],
      },
    };
  }

  // Check if subject is in valid subjects list
  const isValidSubject = VALID_SUBJECTS.some(
    validSubject =>
      normalizedSubject.includes(normalizeText(validSubject)) ||
      normalizeText(validSubject).includes(normalizedSubject)
  );

  if (isValidSubject) {
    return {
      success: true,
      data: {
        isValid: true,
        isAppropriate: true,
      },
    };
  }

  // Subject might be valid but not in our list - provide suggestions
  const suggestions = findSimilarSubjects(subject);

  return {
    success: true,
    data: {
      isValid: suggestions.length > 0,
      isAppropriate: true,
      suggestedSubjects:
        suggestions.length > 0 ? suggestions : VALID_SUBJECTS.slice(0, 5),
      warnings:
        suggestions.length === 0
          ? [
              "We couldn't find an exact match for your subject.",
              'Here are some popular educational topics you might be interested in.',
            ]
          : undefined,
    },
  };
};

/**
 * Verify Sub-Subjects Endpoint
 * Validates sub-subjects for logical connection and appropriateness
 */
export const verifySubSubjects = async (
  request: SubSubjectVerificationRequest
): Promise<ApiResponse<SubSubjectVerificationResponse>> => {
  await simulateDelay(1000);

  const { subject, subSubjects } = request;

  if (!subject || !subSubjects || subSubjects.length === 0) {
    return {
      success: false,
      error: 'Subject and sub-subjects are required',
    };
  }

  const normalizedSubject = normalizeText(subject);
  const validSubjects: string[] = [];
  const invalidSubjects: string[] = [];
  const inappropriateSubjects: string[] = [];
  const suggestions: Record<string, string[]> = {};

  // Get inappropriate list for this subject
  const subjectInappropriateList = Object.entries(INAPPROPRIATE_SUB_SUBJECTS)
    .filter(
      ([key]) =>
        normalizedSubject.includes(key) || key.includes(normalizedSubject)
    )
    .flatMap(([, list]) => list);

  // Also include general inappropriate subjects
  const allInappropriate = [
    ...INAPPROPRIATE_SUBJECTS,
    ...subjectInappropriateList,
  ];

  for (const subSubject of subSubjects) {
    const normalizedSubSubject = normalizeText(subSubject);

    // Check for inappropriate content
    if (containsInappropriateContent(subSubject, allInappropriate)) {
      inappropriateSubjects.push(subSubject);

      // Provide alternative suggestions for this subject
      const mainSubjectKey = Object.keys(VALID_SUB_SUBJECTS).find(
        key =>
          normalizedSubject.includes(key) || key.includes(normalizedSubject)
      );

      if (mainSubjectKey && VALID_SUB_SUBJECTS[mainSubjectKey]) {
        suggestions[subSubject] = VALID_SUB_SUBJECTS[mainSubjectKey].slice(
          0,
          3
        );
      }
      continue;
    }

    // Check logical connection with main subject
    const hasLogicalConnection = Object.entries(VALID_SUB_SUBJECTS).some(
      ([key, subList]) => {
        if (
          normalizedSubject.includes(key) ||
          key.includes(normalizedSubject)
        ) {
          return subList.some(
            validSub =>
              normalizedSubSubject.includes(normalizeText(validSub)) ||
              normalizeText(validSub).includes(normalizedSubSubject)
          );
        }
        return false;
      }
    );

    if (hasLogicalConnection) {
      validSubjects.push(subSubject);
    } else {
      invalidSubjects.push(subSubject);

      // Provide suggestions for invalid but not inappropriate subjects
      const mainSubjectKey = Object.keys(VALID_SUB_SUBJECTS).find(
        key =>
          normalizedSubject.includes(key) || key.includes(normalizedSubject)
      );

      if (mainSubjectKey && VALID_SUB_SUBJECTS[mainSubjectKey]) {
        suggestions[subSubject] = VALID_SUB_SUBJECTS[mainSubjectKey]
          .filter(validSub => {
            const normalizedValid = normalizeText(validSub);
            return (
              normalizedValid.includes(normalizedSubSubject.split(' ')[0]) ||
              normalizedSubSubject.includes(normalizedValid.split(' ')[0])
            );
          })
          .slice(0, 3);

        if (suggestions[subSubject].length === 0) {
          suggestions[subSubject] = VALID_SUB_SUBJECTS[mainSubjectKey].slice(
            0,
            3
          );
        }
      }
    }
  }

  return {
    success: true,
    data: {
      validSubjects,
      invalidSubjects,
      inappropriateSubjects,
      suggestions:
        Object.keys(suggestions).length > 0 ? suggestions : undefined,
    },
  };
};

/**
 * Generate Questions Endpoint
 * Creates quiz questions based on subject, sub-subjects, and level
 */
export const generateQuestions = async (
  request: QuestionGenerationRequest
): Promise<ApiResponse<QuestionGenerationResponse>> => {
  await simulateDelay(2000);

  const { subject, subSubjects, level, questionCount = 10 } = request;

  if (!subject || !subSubjects || subSubjects.length === 0) {
    return {
      success: false,
      error: 'Subject and sub-subjects are required',
    };
  }

  const normalizedSubject = normalizeText(subject);

  // Find matching questions from our mock database
  let availableQuestions: Question[] = [];

  // Get questions for the main subject
  for (const [subjectKey, questions] of Object.entries(MOCK_QUESTIONS)) {
    if (
      normalizedSubject.includes(subjectKey) ||
      subjectKey.includes(normalizedSubject)
    ) {
      availableQuestions = [...availableQuestions, ...questions];
    }
  }

  // If no specific questions found, generate generic ones
  if (availableQuestions.length === 0) {
    availableQuestions = generateGenericQuestions(subject, subSubjects, level);
  }

  // Filter questions by sub-subjects and level
  let filteredQuestions = availableQuestions.filter(question => {
    const levelMatch = mapLevelToDifficulty(level).includes(
      question.difficulty
    );
    const subSubjectMatch = subSubjects.some(
      subSubject =>
        normalizeText(question.subSubject).includes(
          normalizeText(subSubject)
        ) ||
        normalizeText(subSubject).includes(normalizeText(question.subSubject))
    );
    return levelMatch && (subSubjectMatch || subSubjects.length === 0);
  });

  // If still no questions after filtering, include all available questions
  if (filteredQuestions.length === 0) {
    filteredQuestions = availableQuestions;
  }

  // Shuffle and select the requested number of questions
  const shuffledQuestions = shuffleArray([...filteredQuestions]);
  const selectedQuestions = shuffledQuestions.slice(0, questionCount);

  // If we don't have enough questions, generate additional ones
  while (selectedQuestions.length < questionCount) {
    const additionalQuestions = generateGenericQuestions(
      subject,
      subSubjects,
      level,
      questionCount - selectedQuestions.length
    );
    selectedQuestions.push(
      ...additionalQuestions.slice(0, questionCount - selectedQuestions.length)
    );
  }

  const estimatedDuration = questionCount * 90; // 90 seconds per question

  return {
    success: true,
    data: {
      questions: selectedQuestions,
      metadata: {
        subject,
        subSubjects,
        level,
        totalQuestions: selectedQuestions.length,
        estimatedDuration,
      },
    },
  };
};

/**
 * Generate Feedback and Review Endpoint
 * Analyzes user performance and provides detailed feedback
 */
export const generateFeedback = async (
  request: FeedbackRequest
): Promise<ApiResponse<FeedbackResponse>> => {
  await simulateDelay(1500);

  const { questions, userAnswers, metadata } = request;

  if (!questions || !userAnswers) {
    return {
      success: false,
      error: 'Questions and user answers are required',
    };
  }

  // Generate feedback for each question
  const feedback: QuestionFeedback[] = questions.map(question => {
    const userAnswer = userAnswers.find(
      answer => answer.questionId === question.id
    );
    const selectedAnswers = userAnswer?.selectedAnswers || [];

    const isCorrect = arraysEqual(
      selectedAnswers.sort(),
      question.correctAnswers.sort()
    );

    const tips = generateTips(question, isCorrect, selectedAnswers);

    return {
      questionId: question.id,
      isCorrect,
      userAnswers: selectedAnswers,
      correctAnswers: question.correctAnswers,
      explanation: question.explanation,
      tips,
    };
  });

  // Calculate performance analysis
  const correctCount = feedback.filter(f => f.isCorrect).length;
  const totalQuestions = questions.length;
  const percentage = (correctCount / totalQuestions) * 100;

  // Analyze performance by sub-subject
  const subSubjectPerformance = analyzeSubSubjectPerformance(
    questions,
    feedback
  );

  const analysis: PerformanceAnalysis = {
    totalQuestions,
    correctAnswers: correctCount,
    incorrectAnswers: totalQuestions - correctCount,
    score: correctCount,
    percentage,
    timeSpent: metadata?.timeSpent,
    averageTimePerQuestion: metadata?.timeSpent
      ? metadata.timeSpent / totalQuestions
      : undefined,
    strongAreas: subSubjectPerformance.strong,
    weakAreas: subSubjectPerformance.weak,
    recommendations: generateRecommendations(
      percentage,
      subSubjectPerformance.weak
    ),
  };

  // Generate overall review
  const overallReview = generateOverallReview(
    percentage,
    analysis,
    metadata?.subject
  );

  return {
    success: true,
    data: {
      feedback,
      analysis,
      overallReview,
    },
  };
};

// Helper functions

const mapLevelToDifficulty = (level: string): string[] => {
  switch (level) {
    case 'beginner':
      return ['easy'];
    case 'intermediate':
      return ['easy', 'medium'];
    case 'advanced':
      return ['medium', 'hard'];
    default:
      return ['easy', 'medium', 'hard'];
  }
};

const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const arraysEqual = (a: string[], b: string[]): boolean => {
  if (a.length !== b.length) {
    return false;
  }
  return a.every(item => b.includes(item));
};

const generateGenericQuestions = (
  subject: string,
  subSubjects: string[],
  level: string,
  count: number = 10
): Question[] => {
  const questions: Question[] = [];
  const difficulty = mapLevelToDifficulty(level)[0] as
    | 'easy'
    | 'medium'
    | 'hard';

  for (let i = 0; i < count; i++) {
    const subSubject = subSubjects[i % subSubjects.length] || 'general';

    questions.push({
      id: `generated_${i + 1}`,
      question: `What is an important concept in ${subSubject} related to ${subject}?`,
      options: [
        { id: 'a', text: `Basic principle of ${subSubject}`, isCorrect: true },
        { id: 'b', text: `Alternative concept A`, isCorrect: false },
        { id: 'c', text: `Alternative concept B`, isCorrect: false },
        { id: 'd', text: `Alternative concept C`, isCorrect: false },
      ],
      correctAnswers: ['a'],
      explanation: `This question tests your understanding of fundamental concepts in ${subSubject} as it relates to ${subject}.`,
      difficulty,
      subSubject,
      tags: [subject.toLowerCase(), subSubject.toLowerCase()],
    });
  }

  return questions;
};

const generateTips = (
  question: Question,
  isCorrect: boolean,
  _selectedAnswers: string[]
): string[] => {
  if (isCorrect) {
    return [
      'Great job! You got this question correct.',
      `Keep studying ${question.subSubject} to maintain your strong understanding.`,
    ];
  }

  const tips = [
    'Review the explanation carefully to understand the correct answer.',
    `Focus on studying ${question.subSubject} concepts.`,
  ];

  // Add specific tips based on the question tags
  if (question.tags.includes('formulas')) {
    tips.push('Practice memorizing and applying key formulas.');
  }
  if (question.tags.includes('concepts')) {
    tips.push(
      'Focus on understanding underlying concepts rather than memorization.'
    );
  }

  return tips;
};

const analyzeSubSubjectPerformance = (
  questions: Question[],
  feedback: QuestionFeedback[]
): { strong: string[]; weak: string[] } => {
  const subSubjectScores: Record<string, { correct: number; total: number }> =
    {};

  questions.forEach((question, index) => {
    const subSubject = question.subSubject;
    if (!subSubjectScores[subSubject]) {
      subSubjectScores[subSubject] = { correct: 0, total: 0 };
    }

    subSubjectScores[subSubject].total++;
    if (feedback[index]?.isCorrect) {
      subSubjectScores[subSubject].correct++;
    }
  });

  const strong: string[] = [];
  const weak: string[] = [];

  Object.entries(subSubjectScores).forEach(([subSubject, scores]) => {
    const percentage = (scores.correct / scores.total) * 100;
    if (percentage >= 70) {
      strong.push(subSubject);
    } else if (percentage < 50) {
      weak.push(subSubject);
    }
  });

  return { strong, weak };
};

const generateRecommendations = (
  percentage: number,
  weakAreas: string[]
): string[] => {
  let recommendations: string[] = [];

  if (percentage >= 90) {
    recommendations = [...LEARNING_RECOMMENDATIONS.high_performer];
  } else if (percentage >= 60) {
    recommendations = [...LEARNING_RECOMMENDATIONS.average_performer];
  } else {
    recommendations = [...LEARNING_RECOMMENDATIONS.struggling_performer];
  }

  // Add specific recommendations for weak areas
  if (weakAreas.length > 0) {
    recommendations.push(`Focus extra attention on: ${weakAreas.join(', ')}`);
  }

  return recommendations;
};

const generateOverallReview = (
  percentage: number,
  analysis: PerformanceAnalysis,
  _subject?: string
) => {
  let performanceLevel: keyof typeof PERFORMANCE_MESSAGES;

  if (percentage >= 95) {
    performanceLevel = 'excellent';
  } else if (percentage >= 85) {
    performanceLevel = 'very_good';
  } else if (percentage >= 75) {
    performanceLevel = 'good';
  } else if (percentage >= 60) {
    performanceLevel = 'satisfactory';
  } else if (percentage >= 40) {
    performanceLevel = 'needs_improvement';
  } else {
    performanceLevel = 'poor';
  }

  const template = PERFORMANCE_MESSAGES[performanceLevel];

  return {
    grade: template.grade,
    summary: template.summary,
    strengths:
      analysis.strongAreas.length > 0
        ? [
            `Strong performance in: ${analysis.strongAreas.join(', ')}`,
            ...template.generalStrengths,
          ]
        : template.generalStrengths,
    improvements:
      analysis.weakAreas.length > 0
        ? [
            `Need improvement in: ${analysis.weakAreas.join(', ')}`,
            ...template.generalImprovements,
          ]
        : template.generalImprovements,
    nextSteps: analysis.recommendations,
  };
};

// Export all API functions
export const QuizAPI = {
  verifySubject,
  verifySubSubjects,
  generateQuestions,
  generateFeedback,
};

export default QuizAPI;
