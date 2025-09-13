/**
 * Quiz Generation E2E Tests
 * Tests quiz generation form, validation, and API integration
 */

import { test, expect } from '@playwright/test';
import { createTestContext, UserTestUtils, QuizTestUtils } from './utils/test-helpers';
import { quizFormData, validationTests } from './fixtures/quiz-fixtures';
import { testUsers } from './fixtures/user-fixtures';

test.describe('Quiz Generation', () => {
  test.beforeEach(async ({ page, context }) => {
    const testContext = createTestContext(page, context);
    const userUtils = new UserTestUtils(testContext);
    
    // Create authenticated user for each test
    await userUtils.clearAllUsers();
    await userUtils.createUser(testUsers.primary.name);
  });

  test.describe('Form Display and Navigation', () => {
    test('should display quiz generation form correctly', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { generateQuizPage } = testContext;

      await generateQuizPage.goto();
      await generateQuizPage.verifyPageLoaded();
      
      // Verify all form elements are present
      await expect(generateQuizPage.subjectInput).toBeVisible();
      await expect(generateQuizPage.subSubjectsInput).toBeVisible();
      await expect(generateQuizPage.levelSelect).toBeVisible();
      await expect(generateQuizPage.questionCountInput).toBeVisible();
      await expect(generateQuizPage.generateButton).toBeVisible();
    });

    test('should navigate from welcome page to generate quiz', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { welcomePage, generateQuizPage } = testContext;

      await welcomePage.goto();
      await welcomePage.startQuiz();
      
      await generateQuizPage.verifyPageLoaded();
      await generateQuizPage.verifyPath('/generate-quiz');
    });

    test('should allow navigation back to home', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { generateQuizPage, welcomePage } = testContext;

      await generateQuizPage.goto();
      await generateQuizPage.goBack();
      
      await welcomePage.verifyPath('/');
      await welcomePage.verifyReturningUserWelcome(testUsers.primary.name);
    });
  });

  test.describe('Form Validation', () => {
    test('should show validation errors for empty form', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { generateQuizPage } = testContext;

      await generateQuizPage.goto();
      await generateQuizPage.testRequiredFields();
    });

    test('should validate subject field', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { generateQuizPage } = testContext;

      await generateQuizPage.goto();
      await generateQuizPage.testSubjectValidation();
    });

    test('should validate sub-subjects field', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { generateQuizPage } = testContext;

      await generateQuizPage.goto();
      await generateQuizPage.testSubSubjectsValidation();
    });

    test('should validate question count field', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { generateQuizPage } = testContext;

      await generateQuizPage.goto();
      await generateQuizPage.testQuestionCountValidation();
    });

    test('should clear validation errors when valid input is provided', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { generateQuizPage } = testContext;

      await generateQuizPage.goto();
      
      // Trigger validation errors first
      await generateQuizPage.generateButton.click();
      await generateQuizPage.verifyValidationErrors({
        subject: 'required',
        subSubjects: 'required'
      });
      
      // Fill valid data
      await generateQuizPage.fillQuizForm(quizFormData.valid);
      
      // Errors should disappear
      await generateQuizPage.verifyNoValidationErrors();
    });

    test('should validate complex input scenarios', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { generateQuizPage } = testContext;

      await generateQuizPage.goto();
      
      // Test edge cases from validation fixtures
      
      // Too short subject
      await generateQuizPage.subjectInput.fill(validationTests.subjects.tooShort);
      await generateQuizPage.subSubjectsInput.fill('Valid Topic');
      await generateQuizPage.generateButton.click();
      await generateQuizPage.verifyValidationErrors({ subject: 'too short' });
      
      // Clear and test valid case
      await generateQuizPage.subjectInput.fill('Mathematics');
      await page.waitForTimeout(500);
      await generateQuizPage.verifyNoValidationErrors();
    });
  });

  test.describe('Form Interaction', () => {
    test('should handle different difficulty levels', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { generateQuizPage } = testContext;

      await generateQuizPage.goto();
      
      const levels: Array<'beginner' | 'intermediate' | 'advanced'> = ['beginner', 'intermediate', 'advanced'];
      
      for (const level of levels) {
        await generateQuizPage.fillQuizForm({
          subject: 'Test Subject',
          subSubjects: ['Topic 1'],
          level,
          questionCount: 5
        });
        
        // Verify level is selected (implementation may vary)
        // This would depend on whether it's a select dropdown or radio buttons
      }
    });

    test('should handle various question counts', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { generateQuizPage } = testContext;

      await generateQuizPage.goto();
      
      const validCounts = validationTests.questionCounts.valid;
      
      for (const count of validCounts) {
        await generateQuizPage.questionCountInput.fill(count.toString());
        await expect(generateQuizPage.questionCountInput).toHaveValue(count.toString());
      }
    });

    test('should handle multiple sub-subjects', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { generateQuizPage } = testContext;

      await generateQuizPage.goto();
      
      const multipleTopics = ['Algebra', 'Geometry', 'Trigonometry', 'Calculus'];
      
      await generateQuizPage.fillQuizForm({
        subject: 'Mathematics',
        subSubjects: multipleTopics,
        level: 'intermediate'
      });
      
      // Verify all topics are in the input
      const subSubjectsValue = await generateQuizPage.subSubjectsInput.inputValue();
      for (const topic of multipleTopics) {
        expect(subSubjectsValue).toContain(topic);
      }
    });

    test('should support keyboard form submission', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { generateQuizPage } = testContext;

      await generateQuizPage.goto();
      
      await generateQuizPage.fillQuizForm(quizFormData.valid);
      await generateQuizPage.submitWithKeyboard();
      
      // Should proceed to take quiz (or show loading)
      await page.waitForTimeout(1000);
    });
  });

  test.describe('Form Submission and API Integration', () => {
    test('should submit valid quiz generation request', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const quizUtils = new QuizTestUtils(testContext);

      // This test assumes the API/mock is properly set up
      await quizUtils.generateQuiz(quizFormData.valid, true);
    });

    test('should handle different difficulty levels in submission', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const quizUtils = new QuizTestUtils(testContext);

      const testCases = [
        quizFormData.beginner,
        quizFormData.valid, // intermediate
        quizFormData.advanced
      ];

      for (const quizData of testCases) {
        await quizUtils.generateQuiz(quizData, true);
        
        // Navigate back to generate new quiz
        const { generateQuizPage } = testContext;
        await generateQuizPage.goto();
      }
    });

    test('should show loading state during submission', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { generateQuizPage } = testContext;

      await generateQuizPage.goto();
      await generateQuizPage.fillQuizForm(quizFormData.valid);
      
      // Click submit and immediately check for loading state
      const submitPromise = generateQuizPage.submitForm();
      
      // Verify loading state appears
      await generateQuizPage.verifyLoadingState();
      
      await submitPromise;
    });

    test('should handle API validation errors', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { generateQuizPage } = testContext;

      await generateQuizPage.goto();
      
      // Fill form with potentially problematic data
      await generateQuizPage.fillQuizForm({
        subject: 'Invalid Subject That Should Fail',
        subSubjects: ['Nonexistent Topic'],
        level: 'beginner'
      });
      
      await generateQuizPage.submitForm(false);
      
      // Should stay on form page and show errors
      await generateQuizPage.verifyPath('/generate-quiz');
    });

    test('should handle network errors gracefully', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { generateQuizPage } = testContext;

      // Mock network failure
      await page.route('**/api/**', route => route.abort());

      await generateQuizPage.goto();
      await generateQuizPage.fillQuizForm(quizFormData.valid);
      await generateQuizPage.submitForm(false);
      
      // Should show error message
      const errorMessage = page.locator('[data-testid="error-message"], .error-message');
      await expect(errorMessage).toBeVisible();
    });
  });

  test.describe('Accessibility and Usability', () => {
    test('should provide proper form accessibility', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { generateQuizPage } = testContext;

      await generateQuizPage.goto();
      await generateQuizPage.verifyFormAccessibility();
    });

    test('should support keyboard navigation', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { generateQuizPage } = testContext;

      await generateQuizPage.goto();
      
      // Test tab navigation through form
      await generateQuizPage.subjectInput.focus();
      await expect(generateQuizPage.subjectInput).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(generateQuizPage.subSubjectsInput).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(generateQuizPage.levelSelect).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(generateQuizPage.questionCountInput).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(generateQuizPage.generateButton).toBeFocused();
    });

    test('should provide helpful placeholder text', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { generateQuizPage } = testContext;

      await generateQuizPage.goto();
      
      // Check for helpful placeholder text
      const subjectPlaceholder = await generateQuizPage.subjectInput.getAttribute('placeholder');
      const subSubjectsPlaceholder = await generateQuizPage.subSubjectsInput.getAttribute('placeholder');
      
      expect(subjectPlaceholder).toBeTruthy();
      expect(subSubjectsPlaceholder).toBeTruthy();
    });
  });

  test.describe('Responsive Design', () => {
    test('should work correctly on mobile devices', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { generateQuizPage } = testContext;

      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await generateQuizPage.goto();
      await generateQuizPage.verifyResponsiveLayout();
      
      // Form should still be functional on mobile
      await generateQuizPage.fillQuizForm(quizFormData.valid);
      await generateQuizPage.submitForm();
    });

    test('should adapt to different screen sizes', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { generateQuizPage } = testContext;

      const viewports = [
        { width: 375, height: 667 }, // Mobile
        { width: 768, height: 1024 }, // Tablet
        { width: 1280, height: 720 }, // Desktop
        { width: 1920, height: 1080 } // Large Desktop
      ];

      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await generateQuizPage.goto();
        await generateQuizPage.verifyResponsiveLayout();
        
        // Verify form is still usable
        await generateQuizPage.fillQuizForm({
          subject: 'Test',
          subSubjects: ['Topic'],
          level: 'beginner'
        });
      }
    });
  });

  test.describe('Form Persistence and State', () => {
    test('should maintain form state during validation errors', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { generateQuizPage } = testContext;

      await generateQuizPage.goto();
      
      // Fill partial form
      await generateQuizPage.subjectInput.fill('Mathematics');
      await generateQuizPage.levelSelect.selectOption('intermediate');
      
      // Submit incomplete form
      await generateQuizPage.generateButton.click();
      
      // Form values should be preserved
      await expect(generateQuizPage.subjectInput).toHaveValue('Mathematics');
      // Level should still be selected (implementation dependent)
    });

    test('should clear form after successful submission', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { generateQuizPage } = testContext;

      await generateQuizPage.goto();
      await generateQuizPage.fillQuizForm(quizFormData.valid);
      await generateQuizPage.submitForm();
      
      // After successful submission, should navigate away
      await generateQuizPage.verifyPath('/take-quiz');
    });

    test('should handle browser refresh gracefully', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { generateQuizPage } = testContext;

      await generateQuizPage.goto();
      await generateQuizPage.fillQuizForm(quizFormData.valid);
      
      // Refresh page
      await page.reload();
      await generateQuizPage.waitForFormLoad();
      
      // Form should be reset
      await expect(generateQuizPage.subjectInput).toHaveValue('');
      await expect(generateQuizPage.subSubjectsInput).toHaveValue('');
    });
  });
});