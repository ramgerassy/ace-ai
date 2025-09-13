/**
 * Test utilities and helper functions for e2e tests
 * Common operations and assertions used across test files
 */

import { Page, expect, BrowserContext, Locator } from '@playwright/test';
import { WelcomePage } from '../pages/welcome-page';
import { GenerateQuizPage } from '../pages/generate-quiz-page';
import { TakeQuizPage } from '../pages/take-quiz-page';
import { QuizResultsPage } from '../pages/quiz-results-page';

/**
 * Test context with all page objects
 */
export interface TestContext {
  page: Page;
  context: BrowserContext;
  welcomePage: WelcomePage;
  generateQuizPage: GenerateQuizPage;
  takeQuizPage: TakeQuizPage;
  resultsPage: QuizResultsPage;
}

/**
 * Create test context with all page objects
 */
export function createTestContext(page: Page, context: BrowserContext): TestContext {
  return {
    page,
    context,
    welcomePage: new WelcomePage(page),
    generateQuizPage: new GenerateQuizPage(page),
    takeQuizPage: new TakeQuizPage(page),
    resultsPage: new QuizResultsPage(page),
  };
}

/**
 * User management utilities
 */
export class UserTestUtils {
  constructor(private testContext: TestContext) {}

  /**
   * Create a new user and verify success
   */
  async createUser(userName: string, expectSuccess: boolean = true) {
    await this.testContext.welcomePage.goto();
    await this.testContext.welcomePage.createUser(userName, expectSuccess);
    
    if (expectSuccess) {
      // Verify user is created and authenticated
      await this.testContext.welcomePage.verifyReturningUserWelcome(userName);
    }
  }

  /**
   * Clear all users and reset to initial state
   */
  async clearAllUsers() {
    await this.testContext.welcomePage.clearUserData();
    await this.testContext.welcomePage.verifyNewUserWelcome();
  }

  /**
   * Switch between users via navbar
   */
  async switchUser(targetUserName: string) {
    const { page } = this.testContext;
    
    // Open user dropdown
    const userDropdown = page.locator('[data-testid="user-dropdown"]').or(
      page.locator('button:has-text("Active User")')
    );
    await userDropdown.click();
    
    // Click on target user
    await page.locator(`text="${targetUserName}"`).click();
    
    // Verify switch was successful
    await this.testContext.welcomePage.verifyReturningUserWelcome(targetUserName);
  }

  /**
   * Delete a user via navbar
   */
  async deleteUser(userName: string) {
    const { page } = this.testContext;
    
    // Open user dropdown
    const userDropdown = page.locator('[data-testid="user-dropdown"]').or(
      page.locator('button:has-text("Active User")')
    );
    await userDropdown.click();
    
    // Click delete button for target user
    const deleteButton = page.locator(`[aria-label="Delete ${userName}"]`);
    await deleteButton.click();
    
    // Confirm deletion in modal
    const confirmButton = page.locator('button:has-text("Delete")');
    await confirmButton.click();
  }

  /**
   * Logout current user
   */
  async logout() {
    const { page } = this.testContext;
    
    const userDropdown = page.locator('[data-testid="user-dropdown"]').or(
      page.locator('button:has-text("Active User")')
    );
    await userDropdown.click();
    
    const signOutButton = page.locator('button:has-text("Sign Out")');
    await signOutButton.click();
    
    await this.testContext.welcomePage.verifyNewUserWelcome();
  }
}

/**
 * Quiz workflow utilities
 */
export class QuizTestUtils {
  constructor(private testContext: TestContext) {}

  /**
   * Complete full quiz workflow from generation to results
   */
  async completeFullQuizWorkflow(
    userData: { name: string },
    quizData: {
      subject: string;
      subSubjects: string[];
      level: 'beginner' | 'intermediate' | 'advanced';
      questionCount?: number;
    },
    answers: number[]
  ) {
    // 1. Create user
    const userUtils = new UserTestUtils(this.testContext);
    await userUtils.createUser(userData.name);
    
    // 2. Generate quiz
    await this.testContext.welcomePage.startQuiz();
    await this.testContext.generateQuizPage.fillQuizForm(quizData);
    await this.testContext.generateQuizPage.submitForm();
    
    // 3. Take quiz
    await this.testContext.takeQuizPage.verifyQuizLoaded();
    await this.testContext.takeQuizPage.completeQuiz(answers);
    
    // 4. View results
    await this.testContext.resultsPage.verifyResultsLoaded();
    
    return this.testContext.resultsPage.getScoreInfo();
  }

  /**
   * Generate quiz with validation
   */
  async generateQuiz(quizData: {
    subject: string;
    subSubjects: string[];
    level: 'beginner' | 'intermediate' | 'advanced';
    questionCount?: number;
  }, expectSuccess: boolean = true) {
    await this.testContext.generateQuizPage.goto();
    await this.testContext.generateQuizPage.fillQuizForm(quizData);
    await this.testContext.generateQuizPage.submitForm(expectSuccess);
  }

  /**
   * Take quiz with specific answers
   */
  async takeQuiz(answers: number[], expectedQuestionCount?: number) {
    await this.testContext.takeQuizPage.goto();
    await this.testContext.takeQuizPage.verifyQuizLoaded(expectedQuestionCount);
    await this.testContext.takeQuizPage.completeQuiz(answers);
  }

  /**
   * Verify quiz results match expected values
   */
  async verifyQuizResults(expected: {
    score?: number;
    percentage?: number;
    correct?: number;
    total?: number;
  }) {
    await this.testContext.resultsPage.verifyResultsLoaded();
    await this.testContext.resultsPage.verifyScore(expected);
  }
}

/**
 * Navigation utilities
 */
export class NavigationUtils {
  constructor(private testContext: TestContext) {}

  /**
   * Navigate through all main pages and verify they load
   */
  async verifyAllPagesLoad() {
    // Welcome page
    await this.testContext.welcomePage.goto();
    await this.testContext.welcomePage.verifyNewUserWelcome();
    
    // Create user first for authenticated pages
    await this.testContext.welcomePage.createUser('Test User');
    
    // Generate Quiz page
    await this.testContext.generateQuizPage.goto();
    await this.testContext.generateQuizPage.verifyPageLoaded();
    
    // Take Quiz page (may show no questions available)
    await this.testContext.takeQuizPage.goto();
    // Either quiz loaded or no questions message should appear
    
    // Results page (may show no results available)
    await this.testContext.resultsPage.goto();
    // Either results loaded or no results message should appear
  }

  /**
   * Test navigation flow between pages
   */
  async testNavigationFlow() {
    // Start from welcome
    await this.testContext.welcomePage.goto();
    
    // Create user and start quiz
    await this.testContext.welcomePage.createUser('Test User');
    await this.testContext.welcomePage.startQuiz();
    
    // Should be on generate quiz page
    await this.testContext.generateQuizPage.verifyPageLoaded();
    
    // Go back to home
    await this.testContext.generateQuizPage.goBack();
    await this.testContext.welcomePage.verifyReturningUserWelcome('Test User');
  }
}

/**
 * Assertion utilities
 */
export class AssertionUtils {
  constructor(private page: Page) {}

  /**
   * Verify element has specific CSS property value
   */
  async verifyCSSProperty(locator: Locator, property: string, expectedValue: string) {
    await expect(locator).toHaveCSS(property, expectedValue);
  }

  /**
   * Verify element is responsive (changes on different viewports)
   */
  async verifyResponsiveElement(locator: Locator, mobileCheck: () => Promise<void>, desktopCheck: () => Promise<void>) {
    // Test mobile viewport
    await this.page.setViewportSize({ width: 375, height: 667 });
    await mobileCheck();
    
    // Test desktop viewport
    await this.page.setViewportSize({ width: 1280, height: 720 });
    await desktopCheck();
  }

  /**
   * Verify accessibility attributes
   */
  async verifyAccessibility(locator: Locator, attributes: Record<string, string>) {
    for (const [attr, value] of Object.entries(attributes)) {
      await expect(locator).toHaveAttribute(attr, value);
    }
  }

  /**
   * Verify loading states
   */
  async verifyLoadingSequence(
    loadingLocator: Locator,
    contentLocator: Locator,
    timeout: number = 10000
  ) {
    // Loading should appear first
    await expect(loadingLocator).toBeVisible({ timeout: 2000 });
    
    // Then disappear when content loads
    await expect(loadingLocator).toBeHidden({ timeout });
    await expect(contentLocator).toBeVisible({ timeout });
  }
}

/**
 * Viewport utilities
 */
export class ViewportUtils {
  constructor(private page: Page) {}

  /**
   * Set mobile viewport
   */
  async setMobile() {
    await this.page.setViewportSize({ width: 375, height: 667 });
  }

  /**
   * Set tablet viewport
   */
  async setTablet() {
    await this.page.setViewportSize({ width: 768, height: 1024 });
  }

  /**
   * Set desktop viewport
   */
  async setDesktop() {
    await this.page.setViewportSize({ width: 1280, height: 720 });
  }

  /**
   * Set large desktop viewport
   */
  async setLargeDesktop() {
    await this.page.setViewportSize({ width: 1920, height: 1080 });
  }

  /**
   * Test responsive behavior across viewports
   */
  async testResponsiveBehavior(testFn: () => Promise<void>) {
    const viewports = [
      { width: 375, height: 667, name: 'Mobile' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 1280, height: 720, name: 'Desktop' },
      { width: 1920, height: 1080, name: 'Large Desktop' }
    ];

    for (const viewport of viewports) {
      console.log(`Testing ${viewport.name} viewport (${viewport.width}x${viewport.height})`);
      await this.page.setViewportSize({ width: viewport.width, height: viewport.height });
      await this.page.waitForTimeout(500); // Allow layout to settle
      await testFn();
    }
  }
}

/**
 * Performance utilities
 */
export class PerformanceUtils {
  constructor(private page: Page) {}

  /**
   * Measure page load time
   */
  async measurePageLoad(url: string): Promise<number> {
    const startTime = Date.now();
    await this.page.goto(url);
    await this.page.waitForLoadState('networkidle');
    return Date.now() - startTime;
  }

  /**
   * Verify page load performance
   */
  async verifyPageLoadPerformance(url: string, maxLoadTime: number = 5000) {
    const loadTime = await this.measurePageLoad(url);
    expect(loadTime).toBeLessThan(maxLoadTime);
    console.log(`Page ${url} loaded in ${loadTime}ms`);
  }
}

/**
 * Error handling utilities
 */
export class ErrorUtils {
  constructor(private page: Page) {}

  /**
   * Capture screenshot on failure
   */
  async captureFailureScreenshot(testName: string) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await this.page.screenshot({
      path: `test-results/failure-screenshots/${testName}-${timestamp}.png`,
      fullPage: true
    });
  }

  /**
   * Handle unexpected errors
   */
  async handleUnexpectedError(error: Error, testName: string) {
    await this.captureFailureScreenshot(testName);
    console.error(`Unexpected error in ${testName}:`, error);
    
    // Log page URL and any console errors
    console.log(`Current URL: ${this.page.url()}`);
    
    // Get console messages
    const logs = await this.page.evaluate(() => {
      return (window as any).__testLogs || [];
    });
    
    if (logs.length > 0) {
      console.log('Console logs:', logs);
    }
  }

  /**
   * Verify error message display
   */
  async verifyErrorMessageDisplay(expectedMessage: string, errorLocator?: Locator) {
    const errorElement = errorLocator || this.page.locator('[data-testid="error-message"], .error-message, .text-red-500');
    await expect(errorElement).toBeVisible();
    await expect(errorElement).toContainText(expectedMessage);
  }
}

/**
 * Wait utilities
 */
export class WaitUtils {
  constructor(private page: Page) {}

  /**
   * Wait for element to be stable (not moving/changing)
   */
  async waitForStable(locator: Locator, timeout: number = 5000) {
    await locator.waitFor({ state: 'visible', timeout });
    
    // Wait for element to stop moving/changing
    let previousBoundingBox = await locator.boundingBox();
    
    for (let i = 0; i < 10; i++) {
      await this.page.waitForTimeout(100);
      const currentBoundingBox = await locator.boundingBox();
      
      if (
        previousBoundingBox &&
        currentBoundingBox &&
        previousBoundingBox.x === currentBoundingBox.x &&
        previousBoundingBox.y === currentBoundingBox.y &&
        previousBoundingBox.width === currentBoundingBox.width &&
        previousBoundingBox.height === currentBoundingBox.height
      ) {
        return; // Element is stable
      }
      
      previousBoundingBox = currentBoundingBox;
    }
  }

  /**
   * Wait for network requests to complete with specific pattern
   */
  async waitForNetworkRequest(urlPattern: string | RegExp, timeout: number = 10000) {
    return this.page.waitForResponse(
      response => {
        const url = response.url();
        if (typeof urlPattern === 'string') {
          return url.includes(urlPattern);
        }
        return urlPattern.test(url);
      },
      { timeout }
    );
  }
}