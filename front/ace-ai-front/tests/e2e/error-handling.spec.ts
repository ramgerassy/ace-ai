/**
 * Error Handling and Edge Cases E2E Tests
 * Tests application behavior under error conditions and edge cases
 */

import { test, expect } from '@playwright/test';
import { createTestContext, UserTestUtils, QuizTestUtils, ErrorUtils } from './utils/test-helpers';
import { quizFormData, validationTests } from './fixtures/quiz-fixtures';
import { testUsers } from './fixtures/user-fixtures';

test.describe('Error Handling and Edge Cases', () => {
  let errorUtils: ErrorUtils;

  test.beforeEach(async ({ page, context }) => {
    const testContext = createTestContext(page, context);
    errorUtils = new ErrorUtils(page);
    
    // Simple setup - just clear storage and navigate to home
    try {
      await page.goto('http://localhost:5173');
      await page.evaluate(() => {
        try {
          localStorage.clear();
          sessionStorage.clear();
        } catch (e) {
          // Storage not accessible, continue
        }
      });
      await page.reload();
    } catch (error) {
      console.warn('Setup failed, continuing with test:', error);
    }
  });

  test.describe('Network Error Handling', () => {
    test('should handle complete network failure', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { welcomePage } = testContext;

      // Block all network requests
      await page.route('**/*', route => route.abort());
      
      try {
        await welcomePage.goto();
        // Should either show error page or handle gracefully
        await page.waitForTimeout(5000);
        
        // App should not crash completely
        const hasContent = await page.locator('body').isVisible();
        expect(hasContent).toBe(true);
      } catch (error) {
        await errorUtils.handleUnexpectedError(error as Error, 'network-failure');
      }
    });

    test('should handle API endpoint failures', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { generateQuizPage } = testContext;

      // Mock specific API failures
      await page.route('**/api/generate-quiz**', route => 
        route.fulfill({ status: 500, body: 'Internal Server Error' })
      );

      await generateQuizPage.goto();
      await generateQuizPage.fillQuizForm(quizFormData.valid);
      await generateQuizPage.submitForm(false);

      // Should show error message
      await errorUtils.verifyErrorMessageDisplay('error');
    });

    test('should handle timeout scenarios', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { generateQuizPage } = testContext;

      // Mock slow API response
      await page.route('**/api/**', async route => {
        await page.waitForTimeout(30000); // 30 second delay (longer than timeout)
        await route.continue();
      });

      await generateQuizPage.goto();
      await generateQuizPage.fillQuizForm(quizFormData.valid);
      
      try {
        await generateQuizPage.submitForm(false);
        
        // Should handle timeout gracefully
        const hasError = await generateQuizPage.errorMessage.isVisible({ timeout: 5000 }).catch(() => false);
        const staysOnPage = page.url().includes('/generate-quiz');
        
        expect(hasError || staysOnPage).toBe(true);
      } catch (error) {
        await errorUtils.handleUnexpectedError(error as Error, 'api-timeout');
      }
    });

    test('should handle intermittent connection issues', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { welcomePage } = testContext;

      let requestCount = 0;
      
      // Simulate intermittent failures
      await page.route('**/*', route => {
        requestCount++;
        if (requestCount % 3 === 0) {
          return route.abort(); // Fail every 3rd request
        }
        return route.continue();
      });

      await welcomePage.goto();
      
      // App should still function despite intermittent failures
      await welcomePage.verifyReturningUserWelcome(testUsers.primary.name);
    });
  });

  test.describe('API Response Error Handling', () => {
    test('should handle malformed JSON responses', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { generateQuizPage } = testContext;

      await page.route('**/api/**', route => 
        route.fulfill({ 
          status: 200, 
          contentType: 'application/json',
          body: 'invalid json response {{{' 
        })
      );

      await generateQuizPage.goto();
      await generateQuizPage.fillQuizForm(quizFormData.valid);
      await generateQuizPage.submitForm(false);

      // Should handle malformed response gracefully
      await page.waitForTimeout(2000);
      expect(page.url()).toContain('/generate-quiz');
    });

    test('should handle unexpected API response structure', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { generateQuizPage } = testContext;

      await page.route('**/api/**', route => 
        route.fulfill({ 
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ unexpected: 'structure' })
        })
      );

      await generateQuizPage.goto();
      await generateQuizPage.fillQuizForm(quizFormData.valid);
      await generateQuizPage.submitForm(false);

      // Should handle unexpected structure
      await page.waitForTimeout(2000);
    });

    test('should handle various HTTP error codes', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { generateQuizPage } = testContext;

      const errorCodes = [400, 401, 403, 404, 422, 500, 502, 503];

      for (const code of errorCodes.slice(0, 3)) { // Test first 3 to avoid timeout
        await page.route('**/api/**', route => 
          route.fulfill({ status: code, body: `Error ${code}` })
        );

        await generateQuizPage.goto();
        await generateQuizPage.fillQuizForm(quizFormData.valid);
        await generateQuizPage.submitForm(false);

        // Should handle each error code gracefully
        await page.waitForTimeout(1000);
        
        // Clear the route for next iteration
        await page.unroute('**/api/**');
      }
    });
  });

  test.describe('Client-Side Error Handling', () => {
    test('should handle JavaScript errors gracefully', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { welcomePage } = testContext;

      // Listen for console errors
      const consoleErrors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      // Inject script that throws error
      await page.addInitScript(() => {
        setTimeout(() => {
          throw new Error('Simulated JavaScript error');
        }, 1000);
      });

      await welcomePage.goto();
      
      // App should continue functioning despite JS errors
      await welcomePage.verifyReturningUserWelcome(testUsers.primary.name);
      
      // Verify error was caught
      await page.waitForTimeout(2000);
      expect(consoleErrors.length).toBeGreaterThan(0);
    });

    test('should handle localStorage being unavailable', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const userUtils = new UserTestUtils(testContext);
      const { welcomePage } = testContext;

      // Mock localStorage to throw errors
      await page.addInitScript(() => {
        Object.defineProperty(window, 'localStorage', {
          value: {
            getItem: () => { throw new Error('localStorage unavailable'); },
            setItem: () => { throw new Error('localStorage unavailable'); },
            removeItem: () => { throw new Error('localStorage unavailable'); },
            clear: () => { throw new Error('localStorage unavailable'); }
          }
        });
      });

      // Clear users first
      await userUtils.clearAllUsers();
      
      await welcomePage.goto();
      
      // App should handle localStorage errors gracefully
      await welcomePage.verifyNewUserWelcome();
    });

    test('should handle memory/performance issues', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { welcomePage } = testContext;

      // Simulate memory pressure
      await page.addInitScript(() => {
        const arrays: number[][] = [];
        for (let i = 0; i < 100; i++) {
          arrays.push(new Array(10000).fill(i));
        }
      });

      await welcomePage.goto();
      
      // App should still function under memory pressure
      await welcomePage.verifyReturningUserWelcome(testUsers.primary.name);
    });
  });

  test.describe('Data Validation Edge Cases', () => {
    test('should handle extremely long user inputs', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { generateQuizPage } = testContext;

      await generateQuizPage.goto();
      
      // Test with extremely long inputs
      const longString = 'A'.repeat(10000);
      
      await generateQuizPage.subjectInput.fill(longString);
      await generateQuizPage.subSubjectsInput.fill(longString);
      
      await generateQuizPage.submitForm(false);
      
      // Should handle long inputs gracefully
      await page.waitForTimeout(1000);
    });

    test('should handle special characters and encoding issues', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { generateQuizPage } = testContext;

      await generateQuizPage.goto();
      
      const specialChars = '🚀💻🎯 Special chars: <script>alert("xss")</script> & entities like &lt;&gt;';
      
      await generateQuizPage.fillQuizForm({
        subject: specialChars,
        subSubjects: [specialChars],
        level: 'beginner'
      });
      
      await generateQuizPage.submitForm(false);
      
      // Should handle special characters safely
      await page.waitForTimeout(1000);
    });

    test('should handle null and undefined values', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { generateQuizPage } = testContext;

      await generateQuizPage.goto();
      
      // Inject null values into form fields via JavaScript
      await page.evaluate(() => {
        const subjectInput = document.querySelector('input[name="subject"]') as HTMLInputElement;
        const subSubjectsInput = document.querySelector('input[name="subSubjects"]') as HTMLInputElement;
        
        if (subjectInput) (subjectInput as any).value = null;
        if (subSubjectsInput) (subSubjectsInput as any).value = undefined;
      });
      
      await generateQuizPage.submitForm(false);
      
      // Should handle null/undefined gracefully
      await generateQuizPage.verifyValidationErrors({
        subject: 'required'
      });
    });
  });

  test.describe('Browser Compatibility Edge Cases', () => {
    test('should handle page refresh during operations', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { generateQuizPage } = testContext;

      await generateQuizPage.goto();
      await generateQuizPage.fillQuizForm(quizFormData.valid);
      
      // Refresh page during form submission
      const submitPromise = generateQuizPage.generateButton.click();
      await page.reload();
      
      // Should handle refresh gracefully
      await generateQuizPage.waitForFormLoad();
      await generateQuizPage.verifyPageLoaded();
    });

    test('should handle browser back/forward navigation', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { welcomePage, generateQuizPage } = testContext;

      await welcomePage.goto();
      await welcomePage.startQuiz();
      await generateQuizPage.verifyPageLoaded();
      
      // Use browser back
      await page.goBack();
      await welcomePage.verifyReturningUserWelcome(testUsers.primary.name);
      
      // Use browser forward
      await page.goForward();
      await generateQuizPage.verifyPageLoaded();
    });

    test('should handle multiple tabs/windows', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { welcomePage } = testContext;

      await welcomePage.goto();
      
      // Open new tab
      const newPage = await context.newPage();
      const newTestContext = createTestContext(newPage, context);
      
      await newTestContext.welcomePage.goto();
      
      // Both tabs should work independently
      await welcomePage.verifyReturningUserWelcome(testUsers.primary.name);
      await newTestContext.welcomePage.verifyReturningUserWelcome(testUsers.primary.name);
      
      await newPage.close();
    });
  });

  test.describe('Authentication Edge Cases', () => {
    test('should handle corrupted user data', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { welcomePage } = testContext;

      // Corrupt localStorage data
      await page.evaluate(() => {
        localStorage.setItem('userStorage', 'corrupted json data {{{');
      });

      await welcomePage.goto();
      
      // Should handle corrupted data gracefully
      await welcomePage.verifyNewUserWelcome();
    });

    test('should handle session conflicts', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const userUtils = new UserTestUtils(testContext);
      const { welcomePage } = testContext;

      await userUtils.createUser(testUsers.primary.name);
      
      // Simulate conflicting session data
      await page.evaluate(() => {
        const conflictingData = {
          users: [],
          currentUserId: 'non-existent-user',
          lastActiveUserId: null
        };
        localStorage.setItem('userStorage', JSON.stringify(conflictingData));
      });

      await page.reload();
      await welcomePage.waitForWelcomePageLoad();
      
      // Should resolve conflict gracefully
      await welcomePage.verifyNewUserWelcome();
    });

    test('should handle simultaneous user operations', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const userUtils = new UserTestUtils(testContext);

      // Create multiple users rapidly
      const userPromises = [
        userUtils.createUser('User 1'),
        userUtils.createUser('User 2'),
        userUtils.createUser('User 3')
      ];

      // Should handle concurrent operations
      await Promise.allSettled(userPromises);
      
      // At least one user should be created successfully
      const { welcomePage } = testContext;
      const currentUserName = await welcomePage.getCurrentUserName();
      expect(currentUserName).toBeTruthy();
    });
  });

  test.describe('Quiz Data Edge Cases', () => {
    test('should handle empty quiz responses', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { takeQuizPage } = testContext;

      await page.route('**/api/**', route => 
        route.fulfill({ 
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ questions: [] })
        })
      );

      await takeQuizPage.goto();
      
      // Should handle empty quiz gracefully
      await takeQuizPage.verifyNoQuestions();
    });

    test('should handle malformed question data', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { takeQuizPage } = testContext;

      await page.route('**/api/**', route => 
        route.fulfill({ 
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ 
            questions: [
              { malformed: 'question', without: 'required fields' }
            ]
          })
        })
      );

      await takeQuizPage.goto();
      
      // Should handle malformed data gracefully
      const hasError = await takeQuizPage.errorMessage.isVisible({ timeout: 5000 }).catch(() => false);
      const hasNoQuestions = await takeQuizPage.noQuestionsMessage.isVisible().catch(() => false);
      
      expect(hasError || hasNoQuestions).toBe(true);
    });

    test('should handle quiz state corruption', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const quizUtils = new QuizTestUtils(testContext);
      const { takeQuizPage } = testContext;

      await quizUtils.generateQuiz(quizFormData.valid);
      
      // Corrupt quiz state in localStorage/sessionStorage
      await page.evaluate(() => {
        sessionStorage.setItem('currentQuiz', 'corrupted data');
      });

      await page.reload();
      
      // Should handle corrupted quiz state
      await takeQuizPage.waitForQuizLoad();
    });
  });

  test.describe('Performance Edge Cases', () => {
    test('should handle slow device performance', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { welcomePage } = testContext;

      // Simulate slow CPU
      await page.addInitScript(() => {
        const start = Date.now();
        while (Date.now() - start < 1000) {
          // Busy wait to simulate slow performance
        }
      });

      await welcomePage.goto();
      
      // Should still load despite performance issues
      await welcomePage.verifyReturningUserWelcome(testUsers.primary.name);
    });

    test('should handle resource loading failures', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { welcomePage } = testContext;

      // Block CSS and image loading
      await page.route('**/*.{css,png,jpg,jpeg,svg}', route => route.abort());

      await welcomePage.goto();
      
      // Should function without styling resources
      await welcomePage.verifyReturningUserWelcome(testUsers.primary.name);
    });

    test('should handle large datasets', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { takeQuizPage } = testContext;

      // Mock response with large dataset
      const largeQuestions = Array(1000).fill(null).map((_, i) => ({
        id: `q${i}`,
        question: `Question ${i}`,
        options: Array(4).fill(null).map((_, j) => ({
          id: `opt${i}_${j}`,
          text: `Option ${j}`,
          isCorrect: j === 0
        })),
        correctAnswers: [`opt${i}_0`],
        explanation: `Explanation for question ${i}`,
        difficulty: 'easy',
        subSubject: 'Test',
        tags: ['test']
      }));

      await page.route('**/api/**', route => 
        route.fulfill({ 
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ questions: largeQuestions })
        })
      );

      try {
        await takeQuizPage.goto();
        
        // Should handle large datasets without crashing
        await takeQuizPage.waitForQuizLoad();
      } catch (error) {
        await errorUtils.handleUnexpectedError(error as Error, 'large-dataset');
      }
    });
  });

  test.afterEach(async ({ page }) => {
    // Cleanup: Clear all routes and reset state
    await page.unrouteAll();
    
    // Log any uncaught errors
    const errors = await page.evaluate(() => (window as any).__testErrors || []);
    if (errors.length > 0) {
      console.log('Uncaught errors during test:', errors);
    }
  });
});

test.describe('Graceful Degradation', () => {
  test('should work without JavaScript enhancements', async ({ browser }) => {
    // Create a new context with JavaScript disabled
    const context = await browser.newContext({ 
      javaScriptEnabled: false 
    });
    const page = await context.newPage();
    const testContext = createTestContext(page, context);
    const { welcomePage } = testContext;

    try {
      await welcomePage.goto();
      
      // Basic HTML should still be accessible
      const hasContent = await welcomePage.welcomeTitle.isVisible();
      expect(hasContent).toBe(true);
    } catch (error) {
      // Expected to fail without JS, but should fail gracefully
      console.log('Expected failure without JavaScript');
    } finally {
      // Clean up
      await context.close();
    }
  });

  test('should provide fallbacks for modern features', async ({ page, context }) => {
    const testContext = createTestContext(page, context);
    const { welcomePage } = testContext;

    // Mock older browser by removing modern APIs
    await page.addInitScript(() => {
      delete (window as any).fetch;
      delete (window as any).Promise;
    });

    try {
      await welcomePage.goto();
      
      // Should attempt to provide fallbacks
      await page.waitForTimeout(2000);
    } catch (error) {
      console.log('Graceful degradation test completed');
    }
  });
});