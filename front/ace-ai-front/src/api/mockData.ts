// Mock data for Quiz API responses

import type { Question } from './types';

// Inappropriate subjects that should be blocked
export const INAPPROPRIATE_SUBJECTS = [
  'bomb making',
  'bomb manufacturing',
  'explosive devices',
  'weapons manufacturing',
  'drug manufacturing',
  'meth production',
  'cocaine production',
  'illegal drugs',
  'hacking passwords',
  'identity theft',
  'credit card fraud',
  'money laundering',
  'tax evasion',
  'human trafficking',
  'child exploitation',
  'terrorism',
  'violence',
  'self-harm',
  'suicide methods',
  'hate speech',
  'discrimination tactics',
];

// Inappropriate sub-subjects by main subject
export const INAPPROPRIATE_SUB_SUBJECTS: Record<string, string[]> = {
  chemistry: [
    'meth production',
    'cocaine synthesis',
    'explosive compounds',
    'poison creation',
    'illegal drug synthesis',
    'chemical weapons',
  ],
  biology: [
    'bioweapons',
    'virus cultivation',
    'bacterial weapons',
    'genetic manipulation for harm',
    'poison extraction',
  ],
  physics: [
    'nuclear weapons',
    'radioactive materials handling',
    'explosive physics',
    'electromagnetic pulse weapons',
  ],
  computer_science: [
    'malware creation',
    'virus programming',
    'hacking techniques',
    'ddos attacks',
    'password cracking',
    'social engineering for fraud',
  ],
  psychology: [
    'manipulation tactics',
    'brainwashing techniques',
    'psychological torture',
    'cult indoctrination',
  ],
  history: [
    'genocide methods',
    'torture techniques',
    'war crimes',
    'hate group tactics',
  ],
};

// Valid subjects with suggestions
export const VALID_SUBJECTS = [
  'mathematics',
  'physics',
  'chemistry',
  'biology',
  'computer science',
  'history',
  'geography',
  'literature',
  'psychology',
  'economics',
  'philosophy',
  'astronomy',
  'geology',
  'medicine',
  'engineering',
  'art',
  'music',
  'languages',
  'sociology',
  'anthropology',
];

// Subject suggestions for common misspellings or related topics
export const SUBJECT_SUGGESTIONS: Record<string, string[]> = {
  math: ['mathematics', 'algebra', 'geometry', 'calculus'],
  science: ['physics', 'chemistry', 'biology', 'astronomy'],
  programming: ['computer science', 'software engineering', 'web development'],
  coding: ['computer science', 'programming', 'software development'],
  english: ['literature', 'linguistics', 'grammar', 'writing'],
  social_studies: ['history', 'geography', 'sociology', 'political science'],
};

// Valid sub-subjects by main subject
export const VALID_SUB_SUBJECTS: Record<string, string[]> = {
  mathematics: [
    'algebra',
    'geometry',
    'calculus',
    'statistics',
    'trigonometry',
    'number theory',
    'linear algebra',
    'discrete mathematics',
  ],
  physics: [
    'mechanics',
    'thermodynamics',
    'electromagnetism',
    'quantum physics',
    'optics',
    'waves',
    'relativity',
    'atomic physics',
  ],
  chemistry: [
    'organic chemistry',
    'inorganic chemistry',
    'physical chemistry',
    'biochemistry',
    'analytical chemistry',
    'polymer chemistry',
    'environmental chemistry',
  ],
  biology: [
    'cell biology',
    'genetics',
    'ecology',
    'evolution',
    'anatomy',
    'physiology',
    'microbiology',
    'botany',
    'zoology',
  ],
  computer_science: [
    'algorithms',
    'data structures',
    'programming languages',
    'databases',
    'web development',
    'machine learning',
    'software engineering',
    'cybersecurity ethics',
  ],
  history: [
    'ancient history',
    'medieval history',
    'modern history',
    'world wars',
    'renaissance',
    'industrial revolution',
    'cultural history',
  ],
  geography: [
    'physical geography',
    'human geography',
    'cartography',
    'climate studies',
    'urban planning',
    'environmental studies',
  ],
};

// Mock questions database
export const MOCK_QUESTIONS: Record<string, Question[]> = {
  mathematics: [
    {
      id: 'math_001',
      question: 'What is the derivative of x²?',
      options: [
        { id: 'a', text: 'x', isCorrect: false },
        { id: 'b', text: '2x', isCorrect: true },
        { id: 'c', text: 'x²', isCorrect: false },
        { id: 'd', text: '2x²', isCorrect: false },
      ],
      correctAnswers: ['b'],
      explanation:
        'The derivative of x² is 2x according to the power rule: d/dx(xⁿ) = nxⁿ⁻¹',
      difficulty: 'medium',
      subSubject: 'calculus',
      tags: ['derivatives', 'power rule'],
    },
    {
      id: 'math_002',
      question: 'What is the value of π (pi) rounded to 2 decimal places?',
      options: [
        { id: 'a', text: '3.14', isCorrect: true },
        { id: 'b', text: '3.16', isCorrect: false },
        { id: 'c', text: '3.12', isCorrect: false },
        { id: 'd', text: '3.18', isCorrect: false },
      ],
      correctAnswers: ['a'],
      explanation:
        'π (pi) is approximately 3.14159, which rounds to 3.14 when expressed to 2 decimal places.',
      difficulty: 'easy',
      subSubject: 'geometry',
      tags: ['constants', 'geometry', 'circles'],
    },
  ],
  physics: [
    {
      id: 'phys_001',
      question: "What is Newton's second law of motion?",
      options: [
        { id: 'a', text: 'F = ma', isCorrect: true },
        { id: 'b', text: 'E = mc²', isCorrect: false },
        { id: 'c', text: 'v = u + at', isCorrect: false },
        { id: 'd', text: 'P = mv', isCorrect: false },
      ],
      correctAnswers: ['a'],
      explanation:
        "Newton's second law states that Force equals mass times acceleration (F = ma).",
      difficulty: 'medium',
      subSubject: 'mechanics',
      tags: ['newton laws', 'force', 'acceleration'],
    },
  ],
  chemistry: [
    {
      id: 'chem_001',
      question: 'What is the chemical symbol for gold?',
      options: [
        { id: 'a', text: 'Go', isCorrect: false },
        { id: 'b', text: 'Au', isCorrect: true },
        { id: 'c', text: 'Ag', isCorrect: false },
        { id: 'd', text: 'Gd', isCorrect: false },
      ],
      correctAnswers: ['b'],
      explanation:
        'Gold\'s chemical symbol is Au, derived from the Latin word "aurum" meaning gold.',
      difficulty: 'easy',
      subSubject: 'inorganic chemistry',
      tags: ['elements', 'periodic table', 'symbols'],
    },
  ],
  biology: [
    {
      id: 'bio_001',
      question: 'What is the basic unit of life?',
      options: [
        { id: 'a', text: 'Atom', isCorrect: false },
        { id: 'b', text: 'Molecule', isCorrect: false },
        { id: 'c', text: 'Cell', isCorrect: true },
        { id: 'd', text: 'Organ', isCorrect: false },
      ],
      correctAnswers: ['c'],
      explanation:
        'The cell is considered the basic unit of life, as it is the smallest structural and functional unit of living organisms.',
      difficulty: 'easy',
      subSubject: 'cell biology',
      tags: ['cells', 'basic biology', 'life'],
    },
  ],
  computer_science: [
    {
      id: 'cs_001',
      question: 'What does HTML stand for?',
      options: [
        { id: 'a', text: 'HyperText Markup Language', isCorrect: true },
        { id: 'b', text: 'High Tech Modern Language', isCorrect: false },
        { id: 'c', text: 'Home Tool Markup Language', isCorrect: false },
        {
          id: 'd',
          text: 'Hyperlink and Text Markup Language',
          isCorrect: false,
        },
      ],
      correctAnswers: ['a'],
      explanation:
        'HTML stands for HyperText Markup Language, which is the standard markup language for creating web pages.',
      difficulty: 'easy',
      subSubject: 'web development',
      tags: ['html', 'web development', 'markup'],
    },
  ],
};

// Performance messages based on score percentage
export const PERFORMANCE_MESSAGES = {
  excellent: {
    grade: 'A+' as const,
    summary:
      'Outstanding performance! You have demonstrated exceptional mastery of the subject.',
    generalStrengths: [
      'Excellent comprehension',
      'Strong analytical skills',
      'Consistent accuracy',
    ],
    generalImprovements: [
      'Continue practicing to maintain this level',
      'Consider advanced topics',
    ],
  },
  very_good: {
    grade: 'A' as const,
    summary:
      'Very good work! You show strong understanding with minor areas for improvement.',
    generalStrengths: [
      'Good comprehension',
      'Solid foundation',
      'Good problem-solving',
    ],
    generalImprovements: [
      'Review missed concepts',
      'Practice more challenging problems',
    ],
  },
  good: {
    grade: 'B+' as const,
    summary: 'Good performance! You have a solid grasp of most concepts.',
    generalStrengths: ['Understanding of core concepts', 'Good effort'],
    generalImprovements: ['Focus on weak areas', 'Additional practice needed'],
  },
  satisfactory: {
    grade: 'B' as const,
    summary:
      'Satisfactory work. You understand the basics but need more practice.',
    generalStrengths: ['Basic understanding', 'Room for growth'],
    generalImprovements: [
      'Study fundamental concepts',
      'Consistent practice required',
    ],
  },
  needs_improvement: {
    grade: 'C' as const,
    summary:
      'More study is needed. Focus on understanding fundamental concepts.',
    generalStrengths: ['Some basic knowledge', 'Potential for improvement'],
    generalImprovements: [
      'Review all topics',
      'Seek additional help',
      'Practice regularly',
    ],
  },
  poor: {
    grade: 'D' as const,
    summary:
      'Significant improvement needed. Consider reviewing the basics thoroughly.',
    generalStrengths: ['Willingness to learn'],
    generalImprovements: [
      'Start with fundamentals',
      'Get tutoring help',
      'Dedicated study time',
    ],
  },
};

// Learning recommendations based on performance
export const LEARNING_RECOMMENDATIONS = {
  high_performer: [
    'Explore advanced topics in this subject',
    'Consider teaching others to reinforce your knowledge',
    'Take on challenging projects or competitions',
    'Look into related subjects that build on this knowledge',
  ],
  average_performer: [
    'Review the topics you missed',
    'Practice with additional exercises',
    'Form study groups with peers',
    'Use multiple learning resources (videos, books, tutorials)',
  ],
  struggling_performer: [
    'Focus on fundamental concepts first',
    'Break down complex topics into smaller parts',
    'Seek help from teachers or tutors',
    'Use visual aids and practical examples',
    'Practice regularly with easier problems first',
  ],
};

export default {
  INAPPROPRIATE_SUBJECTS,
  INAPPROPRIATE_SUB_SUBJECTS,
  VALID_SUBJECTS,
  SUBJECT_SUGGESTIONS,
  VALID_SUB_SUBJECTS,
  MOCK_QUESTIONS,
  PERFORMANCE_MESSAGES,
  LEARNING_RECOMMENDATIONS,
};
