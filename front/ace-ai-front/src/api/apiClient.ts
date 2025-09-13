// API Client for QuizMaster API Contract
// Implements HTTP requests to backend API

import type {
  ErrorResponse,
  GenerateQuizRequest,
  GenerateQuizResponse,
  QuizReviewRequest,
  ReviewQuizResponse,
  VerifySubSubjectRequest,
  VerifySubSubjectResponse,
  VerifySubjectRequest,
  VerifySubjectResponse,
} from './types';

// Note: Legacy mock API available as fallback if needed
// import { QuizAPI as MockAPI } from './quizApi';

// Use relative URL in development (Vite proxy) or configured URL in production
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? '/api' : 'http://localhost:3000/api');

// HTTP client configuration
const HTTP_TIMEOUT = 30000; // 30 seconds for standard endpoints
const QUIZ_GENERATION_TIMEOUT = 45000; // 45 seconds for quiz generation

interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: string;
  timeout?: number;
}

// Generic HTTP request handler with timeout and error handling
async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions
): Promise<T | ErrorResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, options.timeout || HTTP_TIMEOUT);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // Handle HTTP error responses
      if (response.status === 429) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests, please try again later',
            details: errorData.details || { retryAfter: 900 },
          },
        };
      }

      if (response.status === 404) {
        const url = new URL(response.url);
        return {
          success: false,
          error: {
            code: 'API_ENDPOINT_NOT_FOUND',
            message: `API endpoint ${url.pathname} not found`,
            details: {
              method: options.method,
              path: url.pathname,
              baseUrl: '/api',
              hint: 'Check the API documentation for available endpoints',
            },
          },
        };
      }

      if (response.status >= 400 && response.status < 500) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: {
            code: errorData.error?.code || 'VALIDATION_ERROR',
            message: errorData.error?.message || 'Request validation failed',
            details: errorData.error?.details,
          },
        };
      }

      // Server error (5xx)
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: {
          code: errorData.error?.code || 'INTERNAL_SERVER_ERROR',
          message: errorData.error?.message || 'Server error occurred',
          details: errorData.error?.details,
        },
      };
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: {
            code: 'REQUEST_TIMEOUT',
            message: 'Request timed out',
            details: { timeout: options.timeout || HTTP_TIMEOUT },
          },
        };
      }

      // Handle CORS errors specifically
      if (
        error.message.includes('CORS') ||
        error.message.includes('cross-origin')
      ) {
        return {
          success: false,
          error: {
            code: 'CORS_ERROR',
            message:
              'CORS policy blocked the request. Backend server may need to allow requests from http://localhost:5173',
            details: {
              originalError: error.message,
              frontendUrl: 'http://localhost:5173',
              backendUrl: API_BASE_URL,
              suggestion:
                'Configure CORS_ORIGIN environment variable to allow requests from the frontend',
            },
          },
        };
      }

      if (error.message.includes('fetch')) {
        return {
          success: false,
          error: {
            code: 'NETWORK_ERROR',
            message:
              'Network request failed - server may be unavailable or CORS blocked',
            details: {
              originalError: error.message,
              frontendUrl: 'http://localhost:5173',
              backendUrl: API_BASE_URL,
            },
          },
        };
      }
    }

    return {
      success: false,
      error: {
        code: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred',
        details: {
          originalError:
            error instanceof Error ? error.message : 'Unknown error',
        },
      },
    };
  }
}

/**
 * Verify Subject API
 * POST /api/verify-subject
 */
export async function verifySubject(
  request: VerifySubjectRequest
): Promise<VerifySubjectResponse | ErrorResponse> {
  // Client-side validation
  if (!request.subject || request.subject.trim().length < 2) {
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: {
          subject: ['Subject must be at least 2 characters'],
        },
      },
    };
  }

  if (request.subject.length > 100) {
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: {
          subject: ['Subject must be no more than 100 characters'],
        },
      },
    };
  }

  return apiRequest<VerifySubjectResponse>('/verify-subject', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * Verify Sub-Subject API
 * POST /api/verify-sub-subject
 */
export async function verifySubSubject(
  request: VerifySubSubjectRequest
): Promise<VerifySubSubjectResponse | ErrorResponse> {
  // Client-side validation
  if (!request.subject || request.subject.trim().length < 2) {
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: {
          subject: ['Subject must be at least 2 characters'],
        },
      },
    };
  }

  if (!request.subSubject || request.subSubject.trim().length < 2) {
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: {
          subSubject: ['Sub-subject must be at least 2 characters'],
        },
      },
    };
  }

  if (request.subSubject.length > 150) {
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: {
          subSubject: ['Sub-subject must be no more than 150 characters'],
        },
      },
    };
  }

  return apiRequest<VerifySubSubjectResponse>('/verify-sub-subject', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * Generate Quiz API
 * POST /api/generate-quiz
 */
export async function generateQuiz(
  request: GenerateQuizRequest
): Promise<GenerateQuizResponse | ErrorResponse> {
  // Client-side validation
  if (!request.subject || request.subject.trim().length < 2) {
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: {
          subject: ['Subject must be at least 2 characters'],
        },
      },
    };
  }

  if (request.subSubjects.length > 10) {
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: {
          subSubjects: ['Maximum 10 sub-subjects allowed'],
        },
      },
    };
  }

  const validLevels = ['easy', 'intermediate', 'hard'];
  if (!validLevels.includes(request.level)) {
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: {
          level: [
            'Difficulty must be either "easy", "intermediate", or "hard"',
          ],
        },
      },
    };
  }

  return apiRequest<GenerateQuizResponse>('/generate-quiz', {
    method: 'POST',
    body: JSON.stringify(request),
    timeout: QUIZ_GENERATION_TIMEOUT,
  });
}

/**
 * Review Quiz API
 * POST /api/review-quiz
 */
export async function reviewQuiz(
  request: QuizReviewRequest
): Promise<ReviewQuizResponse | ErrorResponse> {
  // Client-side validation
  if (!request.userAnswers || request.userAnswers.length !== 10) {
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: {
          userAnswers: ['Must submit exactly 10 answers'],
        },
      },
    };
  }

  // Validate each user answer
  for (let i = 0; i < request.userAnswers.length; i++) {
    const answer = request.userAnswers[i];

    if (answer.questionNum < 1 || answer.questionNum > 10) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: {
            userAnswers: [
              `Question ${i + 1}: questionNum must be between 1 and 10`,
            ],
          },
        },
      };
    }

    if (!answer.question || answer.question.length < 10) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: {
            userAnswers: [
              `Question ${i + 1}: question must be at least 10 characters`,
            ],
          },
        },
      };
    }

    if (!answer.possibleAnswers || answer.possibleAnswers.length !== 4) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: {
            userAnswers: [
              `Question ${i + 1}: must have exactly 4 possible answers`,
            ],
          },
        },
      };
    }

    // Validate answer indices
    const invalidCorrectAnswers = answer.correctAnswer.some(
      idx => idx < 0 || idx > 3
    );
    if (invalidCorrectAnswers) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: {
            userAnswers: [
              `Question ${i + 1}: correctAnswer indices must be between 0 and 3`,
            ],
          },
        },
      };
    }

    const invalidUserAnswers = answer.userAnswer.some(
      idx => idx < 0 || idx > 3
    );
    if (invalidUserAnswers) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: {
            userAnswers: [
              `Question ${i + 1}: userAnswer indices must be between 0 and 3`,
            ],
          },
        },
      };
    }
  }

  return apiRequest<ReviewQuizResponse>('/review-quiz', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * Health Check APIs
 */
export async function checkSystemHealth(): Promise<any> {
  return apiRequest('/health', {
    method: 'GET',
    timeout: 10000,
  });
}

export async function checkApiHealth(): Promise<any> {
  return apiRequest('/api/health', {
    method: 'GET',
    timeout: 10000,
  });
}

// Export all API functions
export const ApiClient = {
  verifySubject,
  verifySubSubject,
  generateQuiz,
  reviewQuiz,
  checkSystemHealth,
  checkApiHealth,
};

export default ApiClient;
