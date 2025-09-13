import { createContext, type ReactNode } from 'react';

export interface UserProfile {
  id: string;
  name: string;
  createdAt: number;
  lastLoginAt: number;
  quizHistory?: {
    quizId: string;
    subject: string;
    score: number;
    completedAt: number;
  }[];
}

export interface UserContextType {
  // State
  currentUser: UserProfile | null;
  allUsers: UserProfile[];
  isLoading: boolean;

  // Actions
  createUser: (
    name: string
  ) => Promise<{ success: boolean; user?: UserProfile; error?: string }>;
  addUser: (
    name: string
  ) => Promise<{ success: boolean; user?: UserProfile; error?: string }>;
  switchUser: (userId: string) => void;
  deleteUser: (userId: string) => void;
  logout: () => void;
  refreshUsers: () => void;

  // Helpers
  isAuthenticated: boolean;
  getUserById: (id: string) => UserProfile | undefined;
}

export interface UserProviderProps {
  children: ReactNode;
}

export interface UserStorage {
  users: UserProfile[];
  currentUserId: string | null;
  lastActiveUserId: string | null;
}
export const UserContext = createContext<UserContextType | undefined>(
  undefined
);
