import { useEffect, useState } from 'react';

import {
  UserContext,
  type UserContextType,
  type UserProfile,
  type UserProviderProps,
} from '../types/user.types';
import {
  addUser as addStoredUser,
  userExistsWithName as checkUserExists,
  createUser as createStoredUser,
  deleteUser as deleteStoredUser,
  getAllUsers as getStoredAllUsers,
  getCurrentUser as getStoredCurrentUser,
  logoutCurrentUser as logoutStoredUser,
  setCurrentUser as setStoredCurrentUser,
} from '../utils/userStorage';
import { validateUserName } from '../utils/inputSanitization';

export const UserProvider = ({ children }: UserProviderProps) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial user data
  useEffect(() => {
    refreshUsers();
  }, []);

  const refreshUsers = () => {
    try {
      setIsLoading(true);
      const user = getStoredCurrentUser();
      const users = getStoredAllUsers();

      setCurrentUser(user);
      setAllUsers(users);
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createUser = async (
    name: string
  ): Promise<{ success: boolean; user?: UserProfile; error?: string }> => {
    // Validate the name
    const validation = validateUserName(name);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    const trimmedName = name.trim();

    // Check if user already exists
    if (checkUserExists(trimmedName)) {
      return { success: false, error: 'A user with this name already exists' };
    }

    try {
      const newUser = createStoredUser(trimmedName);
      setCurrentUser(newUser);
      setAllUsers(getStoredAllUsers());

      return { success: true, user: newUser };
    } catch (error) {
      return { success: false, error: `Failed to create user:${error}` };
    }
  };

  const addUser = async (
    name: string
  ): Promise<{ success: boolean; user?: UserProfile; error?: string }> => {
    // Validate the name
    const validation = validateUserName(name);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    const trimmedName = name.trim();

    // Check if user already exists
    if (checkUserExists(trimmedName)) {
      return { success: false, error: 'A user with this name already exists' };
    }

    try {
      const newUser = addStoredUser(trimmedName);
      // Don't change current user, just update the users list
      setAllUsers(getStoredAllUsers());

      return { success: true, user: newUser };
    } catch (error) {
      return { success: false, error: `Failed to add user:${error}` };
    }
  };

  const switchUser = (userId: string) => {
    try {
      setStoredCurrentUser(userId);
      const user = getStoredCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Failed to switch user:', error);
    }
  };

  const deleteUser = (userId: string) => {
    try {
      deleteStoredUser(userId);
      const updatedUsers = getStoredAllUsers();
      setAllUsers(updatedUsers);

      // If deleted user was current user, clear current user
      if (currentUser?.id === userId) {
        setCurrentUser(null);
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const logout = () => {
    try {
      logoutStoredUser();
      setCurrentUser(null);
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const getUserById = (id: string): UserProfile | undefined => {
    return allUsers.find(user => user.id === id);
  };

  const value: UserContextType = {
    // State
    currentUser,
    allUsers,
    isLoading,

    // Actions
    createUser,
    addUser,
    switchUser,
    deleteUser,
    logout,
    refreshUsers,

    // Helpers
    isAuthenticated: !!currentUser,
    getUserById,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
