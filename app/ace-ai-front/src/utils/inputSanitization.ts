/**
 * Input sanitization utilities for security
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates and sanitizes user name input
 */
export const validateUserName = (name: string): ValidationResult => {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return { isValid: false, error: 'Please enter your name' };
  }

  if (trimmedName.length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters' };
  }

  if (trimmedName.length > 30) {
    return { isValid: false, error: 'Name must be less than 30 characters' };
  }

  // Enhanced security: validate against malicious characters and patterns
  const nameRegex = /^[a-zA-Z0-9\s\-_'.]+$/;
  if (!nameRegex.test(trimmedName)) {
    return {
      isValid: false,
      error:
        'Name contains invalid characters. Only letters, numbers, spaces, hyphens, underscores, and apostrophes are allowed.',
    };
  }

  // Prevent names that could be XSS attempts
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<.*>/,
    /&\w+;/,
  ];

  if (suspiciousPatterns.some(pattern => pattern.test(trimmedName))) {
    return { isValid: false, error: 'Name contains invalid content' };
  }

  return { isValid: true };
};

/**
 * Sanitizes general text input to prevent XSS
 */
export const sanitizeTextInput = (input: string): string => {
  return input
    .trim()
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Validates quiz subject input
 */
export const validateSubjectInput = (subject: string): ValidationResult => {
  const trimmed = subject.trim();

  if (!trimmed) {
    return { isValid: false, error: 'Subject cannot be empty' };
  }

  if (trimmed.length > 100) {
    return {
      isValid: false,
      error: 'Subject must be less than 100 characters',
    };
  }

  // Check for suspicious patterns
  const suspiciousPatterns = [/<script/i, /javascript:/i, /on\w+\s*=/i, /<.*>/];

  if (suspiciousPatterns.some(pattern => pattern.test(trimmed))) {
    return { isValid: false, error: 'Subject contains invalid content' };
  }

  return { isValid: true };
};

/**
 * Validates quiz sub-subjects input
 */
export const validateSubSubjectsInput = (
  subSubjects: string
): ValidationResult => {
  const trimmed = subSubjects.trim();

  if (!trimmed) {
    return { isValid: false, error: 'Sub-subjects cannot be empty' };
  }

  if (trimmed.length > 500) {
    return {
      isValid: false,
      error: 'Sub-subjects must be less than 500 characters',
    };
  }

  // Check each sub-subject
  const subjects = trimmed
    .split(',')
    .map(s => s.trim())
    .filter(s => s);

  for (const subject of subjects) {
    const validation = validateSubjectInput(subject);
    if (!validation.isValid) {
      return {
        isValid: false,
        error: `Invalid sub-subject "${subject}": ${validation.error}`,
      };
    }
  }

  return { isValid: true };
};
