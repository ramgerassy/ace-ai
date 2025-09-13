/**
 * User test fixtures for e2e tests
 * Contains predefined user data for consistent testing
 */

import type { UserProfile } from '../../../src/types/user.types';

export const testUsers = {
  primary: {
    name: 'John Doe',
    expectedId: 'john-doe', // This will be generated based on name sanitization
  },
  secondary: {
    name: 'Jane Smith',
    expectedId: 'jane-smith',
  },
  withSpecialChars: {
    name: 'Test User!@#',
    expectedId: 'test-user', // Special chars should be stripped
  },
  longName: {
    name: 'This is a very long user name that should be handled properly',
    expectedId: 'this-is-a-very-long-user-name-that-should-be-handled-properly',
  },
  emptyName: {
    name: '',
    shouldFail: true,
  },
  whitespaceOnly: {
    name: '   ',
    shouldFail: true,
  },
} as const;

/**
 * Helper to create a mock user profile
 */
export function createMockUser(name: string, overrides: Partial<UserProfile> = {}): UserProfile {
  const now = Date.now();
  const sanitizedId = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  
  return {
    id: sanitizedId,
    name: name.trim(),
    createdAt: now,
    lastLoginAt: now,
    quizHistory: [],
    ...overrides,
  };
}

/**
 * Create multiple mock users for testing user switching
 */
export function createMockUsers(count: number = 3): UserProfile[] {
  const names = ['Alice Johnson', 'Bob Wilson', 'Charlie Brown', 'Diana Prince', 'Eve Adams'];
  
  return names.slice(0, count).map((name, index) => 
    createMockUser(name, {
      createdAt: Date.now() - (index * 86400000), // Each user created a day apart
      lastLoginAt: Date.now() - (index * 3600000), // Each user last logged in an hour apart
    })
  );
}