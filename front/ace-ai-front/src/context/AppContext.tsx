import type { ReactNode } from 'react';
import { UserProvider } from './UserContext';
import { QuizProvider } from './QuizContext';

interface AppProviderProps {
  children: ReactNode;
}

/**
 * Combined provider that wraps the entire app with all necessary contexts
 */
export const AppProvider = ({ children }: AppProviderProps) => {
  return (
    <UserProvider>
      <QuizProvider>{children}</QuizProvider>
    </UserProvider>
  );
};

// Re-export hooks for convenience
export { useUser } from './useUser';
export { useQuiz } from './useQuiz';
