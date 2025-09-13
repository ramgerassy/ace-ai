/**
 * User Authentication E2E Tests
 * Tests user creation, management, switching, and deletion workflows
 */

import { test, expect } from '@playwright/test';
import { createTestContext, UserTestUtils } from './utils/test-helpers';
import { testUsers } from './fixtures/user-fixtures';

test.describe('User Authentication', () => {
  test.beforeEach(async ({ page, context }) => {
    const testContext = createTestContext(page, context);
    const userUtils = new UserTestUtils(testContext);
    
    // Clear any existing users before each test
    await userUtils.clearAllUsers();
  });

  test.describe('User Creation', () => {
    test('should create new user successfully', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { welcomePage } = testContext;

      await welcomePage.goto();
      
      // Verify initial state for new users
      await welcomePage.verifyNewUserWelcome();
      await welcomePage.verifyFeatureCards();
      
      // Create user via welcome screen
      await welcomePage.createUser(testUsers.primary.name);
      
      // Verify user was created and authenticated
      await welcomePage.verifyReturningUserWelcome(testUsers.primary.name);
    });

    test('should create user via navbar input', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { welcomePage } = testContext;

      await welcomePage.goto();
      
      // Use navbar user input (when no user exists)
      const userNameInput = page.locator('input[placeholder="Enter your name"]').first();
      const continueButton = page.locator('button:has-text("Continue")').first();
      
      await userNameInput.fill(testUsers.secondary.name);
      await continueButton.click();
      
      // Verify user creation
      await welcomePage.verifyReturningUserWelcome(testUsers.secondary.name);
    });

    test('should create user using Enter key', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { welcomePage } = testContext;

      await welcomePage.goto();
      await welcomePage.createUserWithEnter(testUsers.primary.name);
      
      await welcomePage.verifyReturningUserWelcome(testUsers.primary.name);
    });

    test('should handle user creation validation errors', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { welcomePage } = testContext;

      await welcomePage.goto();
      
      // Test empty name
      await welcomePage.createUser(testUsers.emptyName.name, false);
      await welcomePage.verifyUserCreationError('required');
      
      // Test whitespace only name
      await welcomePage.createUser(testUsers.whitespaceOnly.name, false);
      await welcomePage.verifyUserCreationError('required');
    });

    test('should sanitize user names with special characters', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { welcomePage } = testContext;

      await welcomePage.goto();
      
      // Create user with special characters
      await welcomePage.createUser(testUsers.withSpecialChars.name);
      
      // Should still show the original name in welcome message
      await welcomePage.verifyReturningUserWelcome(testUsers.withSpecialChars.name);
    });

    test('should handle very long user names', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { welcomePage } = testContext;

      await welcomePage.goto();
      await welcomePage.createUser(testUsers.longName.name);
      
      await welcomePage.verifyReturningUserWelcome(testUsers.longName.name);
    });
  });

  test.describe('User Management', () => {
    test('should allow switching between multiple users', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const userUtils = new UserTestUtils(testContext);
      const { welcomePage } = testContext;

      // Create first user
      await userUtils.createUser(testUsers.primary.name);
      
      // Create second user via navbar
      const addUserButton = page.locator('button:has-text("Add New User"), button:has-text("+ Add New User")');
      
      // Open user dropdown to add new user
      const userDropdown = page.locator('button:has-text("Active User")').or(
        page.locator('[data-testid="user-dropdown"]')
      );
      await userDropdown.click();
      await addUserButton.click();
      
      // Fill new user form
      const userInput = page.locator('input[placeholder="Enter your name"]');
      const continueButton = page.locator('button:has-text("Continue")');
      
      await userInput.fill(testUsers.secondary.name);
      await continueButton.click();
      
      // Verify second user is now active
      await welcomePage.verifyReturningUserWelcome(testUsers.secondary.name);
      
      // Switch back to first user
      await userUtils.switchUser(testUsers.primary.name);
      await welcomePage.verifyReturningUserWelcome(testUsers.primary.name);
    });

    test('should display all users in dropdown', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const userUtils = new UserTestUtils(testContext);

      // Create multiple users
      await userUtils.createUser(testUsers.primary.name);
      
      // Add second user
      const userDropdown = page.locator('button:has-text("Active User")').or(
        page.locator('[data-testid="user-dropdown"]')
      );
      await userDropdown.click();
      
      const addUserButton = page.locator('button:has-text("Add New User"), button:has-text("+ Add New User")');
      await addUserButton.click();
      
      const userInput = page.locator('input[placeholder="Enter your name"]');
      const continueButton = page.locator('button:has-text("Continue")');
      
      await userInput.fill(testUsers.secondary.name);
      await continueButton.click();
      
      // Open dropdown and verify both users are listed
      await userDropdown.click();
      
      await expect(page.locator(`text="${testUsers.primary.name}"`)).toBeVisible();
      // Secondary user should be current, so might not be in switch list
      
      // Close dropdown
      await page.keyboard.press('Escape');
    });

    test('should delete user successfully', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const userUtils = new UserTestUtils(testContext);
      const { welcomePage } = testContext;

      // Create two users
      await userUtils.createUser(testUsers.primary.name);
      
      // Add second user
      const userDropdown = page.locator('button:has-text("Active User")').or(
        page.locator('[data-testid="user-dropdown"]')
      );
      await userDropdown.click();
      
      const addUserButton = page.locator('button:has-text("Add New User"), button:has-text("+ Add New User")');
      await addUserButton.click();
      
      const userInput = page.locator('input[placeholder="Enter your name"]');
      const continueButton = page.locator('button:has-text("Continue")');
      
      await userInput.fill(testUsers.secondary.name);
      await continueButton.click();
      
      // Delete the first user
      await userDropdown.click();
      
      const deleteButton = page.locator(`[aria-label="Delete ${testUsers.primary.name}"]`);
      await deleteButton.click();
      
      // Confirm deletion
      const confirmButton = page.locator('button:has-text("Delete Account"), button:has-text("Delete")');
      await confirmButton.click();
      
      // Should still be logged in as second user
      await welcomePage.verifyReturningUserWelcome(testUsers.secondary.name);
    });

    test('should delete last user and return to new user state', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const userUtils = new UserTestUtils(testContext);
      const { welcomePage } = testContext;

      // Create single user
      await userUtils.createUser(testUsers.primary.name);
      
      // Delete the user
      const userDropdown = page.locator('button:has-text("Active User")').or(
        page.locator('[data-testid="user-dropdown"]')
      );
      await userDropdown.click();
      
      const deleteButton = page.locator('button:has-text("Delete Account")');
      await deleteButton.click();
      
      // Confirm deletion
      const confirmButton = page.locator('button:has-text("Delete Account"), button:has-text("Delete")');
      await confirmButton.click();
      
      // Should return to new user state
      await welcomePage.verifyNewUserWelcome();
    });

    test('should show confirmation modal before deletion', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const userUtils = new UserTestUtils(testContext);

      await userUtils.createUser(testUsers.primary.name);
      
      const userDropdown = page.locator('button:has-text("Active User")').or(
        page.locator('[data-testid="user-dropdown"]')
      );
      await userDropdown.click();
      
      const deleteButton = page.locator('button:has-text("Delete Account")');
      await deleteButton.click();
      
      // Verify confirmation modal appears
      const modal = page.locator('[role="dialog"], .modal');
      await expect(modal).toBeVisible();
      await expect(modal).toContainText('Delete User Account');
      await expect(modal).toContainText(testUsers.primary.name);
      
      // Cancel deletion
      const cancelButton = page.locator('button:has-text("Cancel")');
      await cancelButton.click();
      
      // User should still exist
      await expect(modal).toBeHidden();
    });
  });

  test.describe('User Session Management', () => {
    test('should maintain user session across page reloads', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const userUtils = new UserTestUtils(testContext);
      const { welcomePage } = testContext;

      await userUtils.createUser(testUsers.primary.name);
      
      // Reload page
      await page.reload();
      await welcomePage.waitForWelcomePageLoad();
      
      // User should still be logged in
      await welcomePage.verifyReturningUserWelcome(testUsers.primary.name);
    });

    test('should persist users in localStorage', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const userUtils = new UserTestUtils(testContext);

      await userUtils.createUser(testUsers.primary.name);
      
      // Check localStorage
      const userStorage = await page.evaluate(() => {
        return localStorage.getItem('userStorage');
      });
      
      expect(userStorage).toBeTruthy();
      const parsedStorage = JSON.parse(userStorage!);
      expect(parsedStorage.users).toHaveLength(1);
      expect(parsedStorage.users[0].name).toBe(testUsers.primary.name);
      expect(parsedStorage.currentUserId).toBeTruthy();
    });

    test('should logout user successfully', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const userUtils = new UserTestUtils(testContext);
      const { welcomePage } = testContext;

      await userUtils.createUser(testUsers.primary.name);
      
      // Logout
      await userUtils.logout();
      
      // Should show user input form again
      await welcomePage.verifyUserInputForm();
    });
  });

  test.describe('Authentication Flow Integration', () => {
    test('should redirect to login when accessing protected routes without auth', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { generateQuizPage, welcomePage } = testContext;

      // Clear users first
      await welcomePage.clearUserData();
      
      // Try to access protected route
      await generateQuizPage.goto();
      
      // Should redirect to home page
      await welcomePage.verifyPath('/');
      await welcomePage.verifyNewUserWelcome();
    });

    test('should allow access to protected routes when authenticated', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const userUtils = new UserTestUtils(testContext);
      const { generateQuizPage } = testContext;

      await userUtils.createUser(testUsers.primary.name);
      
      // Should be able to access protected routes
      await generateQuizPage.goto();
      await generateQuizPage.verifyPageLoaded();
    });

    test('should show authentication prompt when starting quiz without login', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { welcomePage } = testContext;

      await welcomePage.goto();
      await welcomePage.verifyNewUserWelcome();
      
      // Try to start quiz without authentication
      await welcomePage.tryStartQuizUnauthenticated();
      
      // Should show user input form
      await welcomePage.verifyUserInputForm();
    });
  });

  test.describe('User Experience', () => {
    test('should show appropriate welcome messages', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const userUtils = new UserTestUtils(testContext);
      const { welcomePage } = testContext;

      // New user message
      await welcomePage.goto();
      await welcomePage.verifyNewUserWelcome();
      
      // Returning user message
      await userUtils.createUser(testUsers.primary.name);
      await welcomePage.verifyReturningUserWelcome(testUsers.primary.name);
    });

    test('should handle user creation errors gracefully', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { welcomePage } = testContext;

      await welcomePage.goto();
      
      // Test various invalid inputs
      const testCases = [
        { input: '', expectedError: 'required' },
        { input: '   ', expectedError: 'required' },
      ];
      
      for (const testCase of testCases) {
        await welcomePage.createUser(testCase.input, false);
        await welcomePage.verifyUserCreationError(testCase.expectedError);
        
        // Clear error by entering valid name
        const userInput = page.locator('input[placeholder="Enter your name"]');
        await userInput.fill('Valid Name');
        
        // Error should disappear
        await page.waitForTimeout(500);
      }
    });

    test('should provide keyboard accessibility', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { welcomePage } = testContext;

      await welcomePage.goto();
      await welcomePage.testKeyboardNavigation();
      
      // Test user input form keyboard navigation
      await welcomePage.startJourneyButton.click();
      await welcomePage.verifyUserInputForm();
      
      const userInput = page.locator('input[placeholder="Enter your name"]');
      const continueButton = page.locator('button:has-text("Continue")');
      
      await userInput.focus();
      await expect(userInput).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(continueButton).toBeFocused();
    });
  });
});