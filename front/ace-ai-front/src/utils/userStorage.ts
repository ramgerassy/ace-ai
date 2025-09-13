import type { UserProfile, UserStorage } from '../types/user.types';

const USER_STORAGE_KEY = 'ace-quiz-users';

// Schema validation for localStorage data
const isValidUserStorage = (data: any): data is UserStorage => {
  return (
    data &&
    typeof data === 'object' &&
    Array.isArray(data.users) &&
    (data.currentUserId === null || typeof data.currentUserId === 'string') &&
    (data.lastActiveUserId === null ||
      typeof data.lastActiveUserId === 'string') &&
    data.users.every(
      (user: any) =>
        user &&
        typeof user === 'object' &&
        typeof user.id === 'string' &&
        typeof user.name === 'string' &&
        typeof user.createdAt === 'string' &&
        typeof user.lastActiveAt === 'string' &&
        Array.isArray(user.quizHistory)
    )
  );
};

// Generate unique ID for users
const generateUserId = (): string => {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Get all user data from localStorage
export const getUserStorage = (): UserStorage => {
  const stored = localStorage.getItem(USER_STORAGE_KEY);
  if (!stored) {
    return {
      users: [],
      currentUserId: null,
      lastActiveUserId: null,
    };
  }
  try {
    const parsed = JSON.parse(stored);
    // Validate the parsed data structure
    if (isValidUserStorage(parsed)) {
      return parsed;
    } else {
      // Log security event in development
      if (import.meta.env.DEV) {
        console.warn(
          'Invalid user storage data detected, resetting to default'
        );
      }
      throw new Error('Invalid storage format');
    }
  } catch {
    // Return default structure if parsing fails or validation fails
    return {
      users: [],
      currentUserId: null,
      lastActiveUserId: null,
    };
  }
};

// Save user data to localStorage
const saveUserStorage = (storage: UserStorage): void => {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(storage));
};

// Get current user
export const getCurrentUser = (): UserProfile | null => {
  const storage = getUserStorage();
  if (!storage.currentUserId) {
    // Try to use last active user if no current user
    if (storage.lastActiveUserId) {
      const lastUser = storage.users.find(
        u => u.id === storage.lastActiveUserId
      );
      if (lastUser) {
        setCurrentUser(lastUser.id);
        return lastUser;
      }
    }
    return null;
  }
  return storage.users.find(u => u.id === storage.currentUserId) || null;
};

// Create new user
export const createUser = (name: string): UserProfile => {
  const storage = getUserStorage();
  const newUser: UserProfile = {
    id: generateUserId(),
    name: name.trim(),
    createdAt: Date.now(),
    lastLoginAt: Date.now(),
    quizHistory: [],
  };

  storage.users.push(newUser);
  storage.currentUserId = newUser.id;
  storage.lastActiveUserId = newUser.id;
  saveUserStorage(storage);

  return newUser;
};

// Create new user without switching to them
export const addUser = (name: string): UserProfile => {
  const storage = getUserStorage();
  const newUser: UserProfile = {
    id: generateUserId(),
    name: name.trim(),
    createdAt: Date.now(),
    lastLoginAt: Date.now(),
    quizHistory: [],
  };

  storage.users.push(newUser);
  // Don't change current user
  saveUserStorage(storage);

  return newUser;
};

// Set current user
export const setCurrentUser = (userId: string): UserProfile | null => {
  const storage = getUserStorage();
  const user = storage.users.find(u => u.id === userId);

  if (user) {
    user.lastLoginAt = Date.now();
    storage.currentUserId = userId;
    storage.lastActiveUserId = userId;
    saveUserStorage(storage);
    return user;
  }

  return null;
};

// Get all users
export const getAllUsers = (): UserProfile[] => {
  const storage = getUserStorage();
  return storage.users;
};

// Delete user
export const deleteUser = (userId: string): boolean => {
  const storage = getUserStorage();
  const userIndex = storage.users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    return false;
  }

  storage.users.splice(userIndex, 1);

  // If deleted user was current user, clear current user
  if (storage.currentUserId === userId) {
    storage.currentUserId = null;
  }

  // If deleted user was last active, clear or set to another user
  if (storage.lastActiveUserId === userId) {
    storage.lastActiveUserId =
      storage.users.length > 0 ? storage.users[0].id : null;
  }

  saveUserStorage(storage);
  return true;
};

// Check if user exists with name
export const userExistsWithName = (name: string): boolean => {
  const storage = getUserStorage();
  return storage.users.some(
    u => u.name.toLowerCase() === name.trim().toLowerCase()
  );
};

// Logout current user (doesn't delete, just clears current)
export const logoutCurrentUser = (): void => {
  const storage = getUserStorage();
  storage.currentUserId = null;
  saveUserStorage(storage);
};
