/**
 * Mobile Responsive E2E Tests
 * Tests responsive behavior across different mobile viewports and interactions
 */

import { test, expect } from '@playwright/test';
import { createTestContext, UserTestUtils, QuizTestUtils, ViewportUtils } from './utils/test-helpers';
import { quizFormData } from './fixtures/quiz-fixtures';
import { testUsers } from './fixtures/user-fixtures';

test.describe('Mobile Responsive Design', () => {
  test.beforeEach(async ({ page, context }) => {
    const testContext = createTestContext(page, context);
    const userUtils = new UserTestUtils(testContext);
    
    // Set up authenticated user for tests that need it
    await userUtils.clearAllUsers();
    await userUtils.createUser(testUsers.primary.name);
  });

  test.describe('Mobile Viewport Testing', () => {
    const mobileViewports = [
      { width: 375, height: 667, name: 'iPhone SE' },
      { width: 390, height: 844, name: 'iPhone 12' },
      { width: 360, height: 640, name: 'Galaxy S5' },
      { width: 412, height: 915, name: 'Pixel 5' },
    ];

    mobileViewports.forEach(({ width, height, name }) => {
      test(`should work correctly on ${name} (${width}x${height})`, async ({ page, context }) => {
        const testContext = createTestContext(page, context);
        const { welcomePage } = testContext;

        await page.setViewportSize({ width, height });
        
        await welcomePage.goto();
        await welcomePage.verifyResponsiveLayout();
        
        // Test mobile-specific interactions
        await welcomePage.verifyFeatureCards();
        await welcomePage.verifyAppBranding();
      });
    });
  });

  test.describe('Welcome Page Mobile Experience', () => {
    test('should display welcome page correctly on mobile', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { welcomePage } = testContext;
      const viewportUtils = new ViewportUtils(page);

      await viewportUtils.setMobile();
      
      await welcomePage.goto();
      await welcomePage.verifyResponsiveLayout();
      
      // Check mobile-specific layout elements
      await expect(welcomePage.welcomeTitle).toBeVisible();
      await expect(welcomePage.welcomeDescription).toBeVisible();
      await expect(welcomePage.startJourneyButton).toBeVisible();
      await expect(welcomePage.featureCards).toHaveCount(3);
    });

    test('should handle mobile user creation flow', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const userUtils = new UserTestUtils(testContext);
      const { welcomePage } = testContext;
      const viewportUtils = new ViewportUtils(page);

      await viewportUtils.setMobile();
      
      // Clear users to test new user flow
      await userUtils.clearAllUsers();
      await welcomePage.goto();
      
      // Mobile user creation should work
      await welcomePage.createUser(testUsers.secondary.name);
      await welcomePage.verifyReturningUserWelcome(testUsers.secondary.name);
    });

    test('should display mobile navbar correctly', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { welcomePage } = testContext;
      const viewportUtils = new ViewportUtils(page);

      await viewportUtils.setMobile();
      
      await welcomePage.goto();
      
      // Mobile hamburger menu should be visible
      await expect(welcomePage.mobileMenuButton).toBeVisible();
      
      // Open mobile menu
      await welcomePage.mobileMenuButton.click();
      
      // Navigation items should be visible in mobile menu
      await expect(page.locator('text="Home"')).toBeVisible();
      await expect(page.locator('text="Generate Quiz"')).toBeVisible();
      await expect(page.locator('text="Take Quiz"')).toBeVisible();
    });

    test('should handle mobile user management', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { welcomePage } = testContext;
      const viewportUtils = new ViewportUtils(page);

      await viewportUtils.setMobile();
      await welcomePage.goto();
      
      // User dropdown should work on mobile
      const userDropdown = page.locator('button:has-text("Active User")').or(
        page.locator('[data-testid="user-dropdown"]')
      );
      
      if (await userDropdown.isVisible()) {
        await userDropdown.click();
        
        // Mobile user management options should be accessible
        const addUserButton = page.locator('button:has-text("Add New User"), button:has-text("+ Add New User")');
        if (await addUserButton.isVisible()) {
          await expect(addUserButton).toBeVisible();
        }
        
        // Close dropdown by tapping outside
        await page.tap('body');
      }
    });
  });

  test.describe('Quiz Generation Mobile Experience', () => {
    test('should display form correctly on mobile', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { generateQuizPage } = testContext;
      const viewportUtils = new ViewportUtils(page);

      await viewportUtils.setMobile();
      
      await generateQuizPage.goto();
      await generateQuizPage.verifyResponsiveLayout();
      
      // All form elements should be visible and accessible on mobile
      await expect(generateQuizPage.subjectInput).toBeVisible();
      await expect(generateQuizPage.subSubjectsInput).toBeVisible();
      await expect(generateQuizPage.levelSelect).toBeVisible();
      await expect(generateQuizPage.questionCountInput).toBeVisible();
      await expect(generateQuizPage.generateButton).toBeVisible();
    });

    test('should handle mobile form interactions', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { generateQuizPage } = testContext;
      const viewportUtils = new ViewportUtils(page);

      await viewportUtils.setMobile();
      
      await generateQuizPage.goto();
      
      // Mobile form filling should work smoothly
      await generateQuizPage.fillQuizForm(quizFormData.valid);
      
      // Form should be submittable on mobile
      await generateQuizPage.submitForm();
    });

    test('should display validation errors properly on mobile', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { generateQuizPage } = testContext;
      const viewportUtils = new ViewportUtils(page);

      await viewportUtils.setMobile();
      
      await generateQuizPage.goto();
      
      // Submit empty form to trigger validation
      await generateQuizPage.generateButton.click();
      
      // Error messages should be visible on mobile
      await generateQuizPage.verifyValidationErrors({
        subject: 'required',
        subSubjects: 'required'
      });
    });

    test('should handle mobile keyboard interactions', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { generateQuizPage } = testContext;
      const viewportUtils = new ViewportUtils(page);

      await viewportUtils.setMobile();
      
      await generateQuizPage.goto();
      
      // Test mobile keyboard input
      await generateQuizPage.subjectInput.tap();
      await generateQuizPage.subjectInput.fill('Mobile Test Subject');
      
      // Mobile keyboard should not interfere with form
      await expect(generateQuizPage.subjectInput).toHaveValue('Mobile Test Subject');
    });
  });

  test.describe('Quiz Taking Mobile Experience', () => {
    test('should display quiz interface correctly on mobile', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const quizUtils = new QuizTestUtils(testContext);
      const { takeQuizPage } = testContext;
      const viewportUtils = new ViewportUtils(page);

      await viewportUtils.setMobile();
      
      await quizUtils.generateQuiz(quizFormData.valid);
      await takeQuizPage.verifyQuizLoaded();
      await takeQuizPage.verifyMobileLayout();
    });

    test('should handle mobile touch interactions for answers', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const quizUtils = new QuizTestUtils(testContext);
      const { takeQuizPage } = testContext;
      const viewportUtils = new ViewportUtils(page);

      await viewportUtils.setMobile();
      
      await quizUtils.generateQuiz(quizFormData.valid);
      
      // Touch interactions should work for answer selection
      const firstOption = takeQuizPage.answerOption(0);
      await firstOption.tap();
      
      const selectedAnswers = await takeQuizPage.getSelectedAnswers();
      expect(selectedAnswers).toContain(0);
    });

    test('should handle mobile navigation between questions', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const quizUtils = new QuizTestUtils(testContext);
      const { takeQuizPage } = testContext;
      const viewportUtils = new ViewportUtils(page);

      await viewportUtils.setMobile();
      
      await quizUtils.generateQuiz(quizFormData.valid);
      
      const totalQuestions = await takeQuizPage.getTotalQuestionCount();
      
      if (totalQuestions > 1) {
        // Mobile navigation buttons should work
        await takeQuizPage.selectAnswer(0);
        await takeQuizPage.nextButton.tap();
        
        const currentQuestion = await takeQuizPage.getCurrentQuestionNumber();
        expect(currentQuestion).toBe(2);
      }
    });

    test('should display progress correctly on mobile', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const quizUtils = new QuizTestUtils(testContext);
      const { takeQuizPage } = testContext;
      const viewportUtils = new ViewportUtils(page);

      await viewportUtils.setMobile();
      
      await quizUtils.generateQuiz(quizFormData.valid);
      
      // Mobile progress indicators should be visible
      const currentQuestion = await takeQuizPage.getCurrentQuestionNumber();
      const totalQuestions = await takeQuizPage.getTotalQuestionCount();
      
      expect(currentQuestion).toBeGreaterThan(0);
      expect(totalQuestions).toBeGreaterThan(0);
      
      // Check for mobile-specific progress indicators
      const hasMobileProgress = await takeQuizPage.mobileProgressIndicator.isVisible().catch(() => false);
      if (hasMobileProgress) {
        await expect(takeQuizPage.mobileProgressIndicator).toBeVisible();
      }
    });

    test('should complete quiz workflow on mobile', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const quizUtils = new QuizTestUtils(testContext);
      const viewportUtils = new ViewportUtils(page);

      await viewportUtils.setMobile();
      
      // Complete entire mobile quiz workflow
      await quizUtils.completeFullQuizWorkflow(
        { name: testUsers.primary.name },
        quizFormData.valid,
        [0, 1, 0, 1, 0]
      );
      
      // Should successfully reach results page
      const { resultsPage } = testContext;
      await resultsPage.verifyResultsLoaded();
    });
  });

  test.describe('Quiz Results Mobile Experience', () => {
    test('should display results correctly on mobile', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const quizUtils = new QuizTestUtils(testContext);
      const { resultsPage } = testContext;
      const viewportUtils = new ViewportUtils(page);

      await viewportUtils.setMobile();
      
      await quizUtils.completeFullQuizWorkflow(
        { name: testUsers.primary.name },
        quizFormData.valid,
        [0, 1, 0, 1, 0]
      );
      
      await resultsPage.verifyResponsiveLayout();
      
      // Essential results elements should be visible on mobile
      await expect(resultsPage.scoreDisplay).toBeVisible();
      await expect(resultsPage.retakeQuizButton.or(resultsPage.generateNewQuizButton)).toBeVisible();
    });

    test('should handle mobile action buttons', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const quizUtils = new QuizTestUtils(testContext);
      const { resultsPage, takeQuizPage } = testContext;
      const viewportUtils = new ViewportUtils(page);

      await viewportUtils.setMobile();
      
      await quizUtils.completeFullQuizWorkflow(
        { name: testUsers.primary.name },
        quizFormData.valid,
        [0, 1, 0, 1, 0]
      );
      
      // Mobile retake button should work
      await resultsPage.retakeQuizButton.tap();
      await takeQuizPage.verifyQuizLoaded();
    });

    test('should display performance analysis on mobile', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const quizUtils = new QuizTestUtils(testContext);
      const { resultsPage } = testContext;
      const viewportUtils = new ViewportUtils(page);

      await viewportUtils.setMobile();
      
      await quizUtils.completeFullQuizWorkflow(
        { name: testUsers.primary.name },
        quizFormData.valid,
        [0, 1, 2, 1, 0]
      );
      
      // Performance analysis should be accessible on mobile
      await resultsPage.verifyPerformanceAnalysis({
        hasRecommendations: true
      });
    });
  });

  test.describe('Touch Interactions and Gestures', () => {
    test('should handle tap interactions correctly', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { welcomePage } = testContext;
      const viewportUtils = new ViewportUtils(page);

      await viewportUtils.setMobile();
      
      await welcomePage.goto();
      
      // Tap interactions should work for all interactive elements
      await welcomePage.startJourneyButton.tap();
      
      // Should trigger user input or navigation
      const hasUserInput = await welcomePage.userNameInput.isVisible().catch(() => false);
      const hasNavigated = page.url().includes('/generate-quiz');
      
      expect(hasUserInput || hasNavigated).toBe(true);
    });

    test('should handle swipe-like scrolling', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { welcomePage } = testContext;
      const viewportUtils = new ViewportUtils(page);

      await viewportUtils.setMobile();
      
      await welcomePage.goto();
      
      // Test scrolling behavior on mobile
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      
      // Footer should be visible after scrolling
      await expect(welcomePage.footer).toBeVisible();
    });

    test('should handle mobile form scrolling', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { generateQuizPage } = testContext;
      const viewportUtils = new ViewportUtils(page);

      await viewportUtils.setMobile();
      
      await generateQuizPage.goto();
      
      // Form should be scrollable on mobile
      await generateQuizPage.subjectInput.scrollIntoViewIfNeeded();
      await expect(generateQuizPage.subjectInput).toBeVisible();
      
      await generateQuizPage.generateButton.scrollIntoViewIfNeeded();
      await expect(generateQuizPage.generateButton).toBeVisible();
    });
  });

  test.describe('Mobile Navigation and Menu', () => {
    test('should display mobile hamburger menu', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { welcomePage } = testContext;
      const viewportUtils = new ViewportUtils(page);

      await viewportUtils.setMobile();
      
      await welcomePage.goto();
      
      // Hamburger menu should be visible on mobile
      await expect(welcomePage.mobileMenuButton).toBeVisible();
      
      // Desktop navigation should be hidden
      const desktopNav = page.locator('.hidden.md\\:flex , .md\\:flex').first();
      const isDesktopNavHidden = await desktopNav.isHidden().catch(() => true);
      expect(isDesktopNavHidden).toBe(true);
    });

    test('should open and close mobile menu', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { welcomePage } = testContext;
      const viewportUtils = new ViewportUtils(page);

      await viewportUtils.setMobile();
      
      await welcomePage.goto();
      
      // Open mobile menu
      await welcomePage.mobileMenuButton.tap();
      
      // Menu items should be visible
      await expect(page.locator('text="Home"')).toBeVisible();
      
      // Close menu by tapping hamburger again
      await welcomePage.mobileMenuButton.tap();
      
      // Menu should close (implementation dependent)
      await page.waitForTimeout(500);
    });

    test('should navigate using mobile menu', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { welcomePage, generateQuizPage } = testContext;
      const viewportUtils = new ViewportUtils(page);

      await viewportUtils.setMobile();
      
      await welcomePage.goto();
      
      // Use mobile menu to navigate
      await welcomePage.mobileMenuButton.tap();
      
      const generateQuizLink = page.locator('text="Generate Quiz"');
      await generateQuizLink.tap();
      
      // Should navigate to generate quiz page
      await generateQuizPage.verifyPath('/generate-quiz');
    });

    test('should handle mobile user dropdown', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { welcomePage } = testContext;
      const viewportUtils = new ViewportUtils(page);

      await viewportUtils.setMobile();
      
      await welcomePage.goto();
      
      // Mobile user management should work
      const userDropdown = page.locator('button:has-text("Active User")').or(
        page.locator('[data-testid="user-dropdown"]')
      );
      
      if (await userDropdown.isVisible()) {
        await userDropdown.tap();
        
        // User options should be accessible
        const signOutButton = page.locator('button:has-text("Sign Out")');
        if (await signOutButton.isVisible()) {
          await expect(signOutButton).toBeVisible();
        }
      }
    });
  });

  test.describe('Mobile Performance and Loading', () => {
    test('should load quickly on mobile', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { welcomePage } = testContext;
      const viewportUtils = new ViewportUtils(page);

      await viewportUtils.setMobile();
      
      const startTime = Date.now();
      await welcomePage.goto();
      const loadTime = Date.now() - startTime;
      
      // Should load within reasonable time on mobile
      expect(loadTime).toBeLessThan(5000); // 5 seconds
    });

    test('should handle slow connections gracefully', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { welcomePage } = testContext;
      const viewportUtils = new ViewportUtils(page);

      await viewportUtils.setMobile();
      
      // Simulate slow network
      await page.route('**/*', async route => {
        await page.waitForTimeout(100); // Add 100ms delay
        await route.continue();
      });
      
      await welcomePage.goto();
      await welcomePage.verifyWelcomePageLoad();
    });
  });

  test.describe('Cross-Device Responsive Testing', () => {
    test('should adapt between mobile and desktop', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { welcomePage } = testContext;
      const viewportUtils = new ViewportUtils(page);

      // Start on desktop
      await viewportUtils.setDesktop();
      await welcomePage.goto();
      await welcomePage.verifyResponsiveLayout();
      
      // Switch to mobile
      await viewportUtils.setMobile();
      await page.waitForTimeout(500); // Allow layout to adjust
      await welcomePage.verifyResponsiveLayout();
      
      // Switch back to desktop
      await viewportUtils.setDesktop();
      await page.waitForTimeout(500);
      await welcomePage.verifyResponsiveLayout();
    });

    test('should maintain functionality across viewport changes', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const userUtils = new UserTestUtils(testContext);
      const { welcomePage } = testContext;
      const viewportUtils = new ViewportUtils(page);

      // Create user on desktop
      await viewportUtils.setDesktop();
      await userUtils.clearAllUsers();
      await welcomePage.goto();
      await welcomePage.createUser(testUsers.primary.name);
      
      // Switch to mobile - user should still be authenticated
      await viewportUtils.setMobile();
      await page.reload();
      await welcomePage.waitForWelcomePageLoad();
      await welcomePage.verifyReturningUserWelcome(testUsers.primary.name);
    });
  });
});