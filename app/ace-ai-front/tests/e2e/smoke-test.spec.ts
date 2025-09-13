/**
 * Smoke Tests for Quiz Application
 * Quick end-to-end tests to verify basic functionality works
 */

import { test, expect } from '@playwright/test';
import { createTestContext, UserTestUtils, QuizTestUtils, NavigationUtils } from './utils/test-helpers';
import { quizFormData } from './fixtures/quiz-fixtures';
import { testUsers } from './fixtures/user-fixtures';

test.describe('Smoke Tests', () => {
  test('complete happy path user journey', async ({ page, context }) => {
    const testContext = createTestContext(page, context);
    const userUtils = new UserTestUtils(testContext);
    const quizUtils = new QuizTestUtils(testContext);
    const { welcomePage, generateQuizPage, takeQuizPage, resultsPage } = testContext;

    // 1. Start as new user
    await userUtils.clearAllUsers();
    await welcomePage.goto();
    await welcomePage.verifyNewUserWelcome();

    // 2. Create user
    await welcomePage.createUser(testUsers.primary.name);
    await welcomePage.verifyReturningUserWelcome(testUsers.primary.name);

    // 3. Start quiz journey
    await welcomePage.startQuiz();
    await generateQuizPage.verifyPageLoaded();

    // 4. Generate quiz
    await generateQuizPage.fillQuizForm(quizFormData.valid);
    await generateQuizPage.submitForm();

    // 5. Take quiz
    await takeQuizPage.verifyQuizLoaded();
    const totalQuestions = await takeQuizPage.getTotalQuestionCount();
    const answers = Array(totalQuestions).fill(0); // Simple answers
    await takeQuizPage.completeQuiz(answers);

    // 6. View results
    await resultsPage.verifyResultsLoaded();
    const scoreInfo = await resultsPage.getScoreInfo();
    expect(scoreInfo.total).toBe(totalQuestions);

    // 7. Retake quiz
    await resultsPage.retakeQuiz();
    await takeQuizPage.verifyQuizLoaded();
  });

  test('navigation between all pages', async ({ page, context }) => {
    const testContext = createTestContext(page, context);
    const navigationUtils = new NavigationUtils(testContext);

    await navigationUtils.verifyAllPagesLoad();
    await navigationUtils.testNavigationFlow();
  });

  test('mobile responsive functionality', async ({ page, context }) => {
    const testContext = createTestContext(page, context);
    const userUtils = new UserTestUtils(testContext);
    const { welcomePage } = testContext;

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await userUtils.clearAllUsers();
    await welcomePage.goto();
    await welcomePage.verifyResponsiveLayout();

    // Mobile user creation
    await welcomePage.createUser(testUsers.primary.name);
    await welcomePage.verifyReturningUserWelcome(testUsers.primary.name);

    // Mobile navigation
    await welcomePage.mobileMenuButton.click();
    await expect(page.locator('text="Generate Quiz"')).toBeVisible();
  });

  test('user management functionality', async ({ page, context }) => {
    const testContext = createTestContext(page, context);
    const userUtils = new UserTestUtils(testContext);
    const { welcomePage } = testContext;

    await userUtils.clearAllUsers();

    // Create first user
    await userUtils.createUser(testUsers.primary.name);
    
    // Create second user
    await welcomePage.goto();
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
    
    await welcomePage.verifyReturningUserWelcome(testUsers.secondary.name);

    // Switch between users
    await userUtils.switchUser(testUsers.primary.name);
    await welcomePage.verifyReturningUserWelcome(testUsers.primary.name);
  });

  test('form validation works correctly', async ({ page, context }) => {
    const testContext = createTestContext(page, context);
    const userUtils = new UserTestUtils(testContext);
    const { generateQuizPage } = testContext;

    await userUtils.createUser(testUsers.primary.name);
    
    await generateQuizPage.goto();
    
    // Test empty form validation
    await generateQuizPage.generateButton.click();
    await generateQuizPage.verifyValidationErrors({
      subject: 'required',
      subSubjects: 'required'
    });

    // Test successful form submission
    await generateQuizPage.fillQuizForm(quizFormData.valid);
    await generateQuizPage.verifyNoValidationErrors();
    await generateQuizPage.submitForm();
  });

  test('application loads and displays correctly', async ({ page, context }) => {
    const testContext = createTestContext(page, context);
    const { welcomePage } = testContext;

    await welcomePage.goto();
    
    // Verify essential elements are present
    await expect(welcomePage.welcomeTitle).toBeVisible();
    await expect(welcomePage.welcomeDescription).toBeVisible();
    await expect(welcomePage.startJourneyButton).toBeVisible();
    await expect(welcomePage.featureCards).toHaveCount(3);
    await expect(welcomePage.navbar).toBeVisible();
    await expect(welcomePage.logo).toBeVisible();
  });

  test('error states are handled gracefully', async ({ page, context }) => {
    const testContext = createTestContext(page, context);
    const userUtils = new UserTestUtils(testContext);
    const { generateQuizPage } = testContext;

    await userUtils.createUser(testUsers.primary.name);

    // Mock API failure
    await page.route('**/api/**', route => 
      route.fulfill({ status: 500, body: 'Server Error' })
    );

    await generateQuizPage.goto();
    await generateQuizPage.fillQuizForm(quizFormData.valid);
    await generateQuizPage.submitForm(false);

    // Should stay on form page and not crash
    await generateQuizPage.verifyPath('/generate-quiz');
    await expect(generateQuizPage.generateButton).toBeVisible();
  });
});

test.describe('Critical Path Tests', () => {
  test('user can complete quiz successfully on first visit', async ({ page, context }) => {
    const testContext = createTestContext(page, context);
    const quizUtils = new QuizTestUtils(testContext);

    const scoreInfo = await quizUtils.completeFullQuizWorkflow(
      { name: testUsers.primary.name },
      quizFormData.beginner,
      [0, 1, 0] // Simple answer pattern
    );

    expect(scoreInfo.total).toBeGreaterThan(0);
    expect(scoreInfo.score).toBeGreaterThanOrEqual(0);
    expect(scoreInfo.percentage).toBeGreaterThanOrEqual(0);
    expect(scoreInfo.percentage).toBeLessThanOrEqual(100);
  });

  test('all action buttons are functional', async ({ page, context }) => {
    const testContext = createTestContext(page, context);
    const quizUtils = new QuizTestUtils(testContext);
    const { resultsPage, takeQuizPage, generateQuizPage, welcomePage } = testContext;

    await quizUtils.completeFullQuizWorkflow(
      { name: testUsers.primary.name },
      quizFormData.valid,
      [0, 1, 0, 1, 0]
    );

    // Test retake button
    await resultsPage.retakeQuizButton.click();
    await takeQuizPage.verifyPath('/take-quiz');

    // Go back to results
    await page.goBack();
    
    // Test new quiz button
    await resultsPage.generateNewQuizButton.click();
    await generateQuizPage.verifyPath('/generate-quiz');

    // Test home navigation
    await generateQuizPage.goBack();
    await welcomePage.verifyPath('/');
  });

  test('data persistence works correctly', async ({ page, context }) => {
    const testContext = createTestContext(page, context);
    const userUtils = new UserTestUtils(testContext);
    const { welcomePage } = testContext;

    await userUtils.createUser(testUsers.primary.name);
    
    // Reload page
    await page.reload();
    await welcomePage.waitForWelcomePageLoad();
    
    // User should still be authenticated
    await welcomePage.verifyReturningUserWelcome(testUsers.primary.name);
  });
});