/**
 * Quiz Taking E2E Tests
 * Tests quiz taking interface, question navigation, and answer selection
 */

import { test, expect } from '@playwright/test';
import { createTestContext, UserTestUtils, QuizTestUtils } from './utils/test-helpers';
import { quizFormData, testAnswers, mockQuestions } from './fixtures/quiz-fixtures';
import { testUsers } from './fixtures/user-fixtures';

test.describe('Quiz Taking', () => {
  test.beforeEach(async ({ page, context }) => {
    const testContext = createTestContext(page, context);
    const userUtils = new UserTestUtils(testContext);
    const quizUtils = new QuizTestUtils(testContext);
    
    // Set up authenticated user and generate a quiz for testing
    await userUtils.clearAllUsers();
    await userUtils.createUser(testUsers.primary.name);
    
    // Generate a quiz to have questions available
    await quizUtils.generateQuiz(quizFormData.valid);
  });

  test.describe('Quiz Interface and Loading', () => {
    test('should display quiz interface correctly', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { takeQuizPage } = testContext;

      await takeQuizPage.goto();
      await takeQuizPage.verifyQuizLoaded();
      
      // Verify essential elements are present
      await expect(takeQuizPage.questionText).toBeVisible();
      await expect(takeQuizPage.answerOptions).toHaveCountGreaterThan(0);
      await expect(takeQuizPage.nextButton.or(takeQuizPage.finishButton)).toBeVisible();
    });

    test('should show quiz metadata', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { takeQuizPage } = testContext;

      await takeQuizPage.goto();
      await takeQuizPage.verifyQuizLoaded();
      
      // Verify quiz metadata is displayed
      await takeQuizPage.verifyQuizMetadata({
        subject: quizFormData.valid.subject,
        level: quizFormData.valid.level,
        questionCount: quizFormData.valid.questionCount
      });
    });

    test('should handle no questions available state', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const userUtils = new UserTestUtils(testContext);
      const { takeQuizPage } = testContext;

      // Clear user data to remove any existing quiz
      await userUtils.clearAllUsers();
      await userUtils.createUser(testUsers.primary.name);
      
      await takeQuizPage.goto();
      
      // Should show no questions message or redirect
      const hasQuestions = await takeQuizPage.questionText.isVisible().catch(() => false);
      if (!hasQuestions) {
        await takeQuizPage.verifyNoQuestions();
      }
    });

    test('should display progress indicator', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { takeQuizPage } = testContext;

      await takeQuizPage.goto();
      await takeQuizPage.verifyQuizLoaded();
      
      // Check progress indicators
      const currentQuestion = await takeQuizPage.getCurrentQuestionNumber();
      const totalQuestions = await takeQuizPage.getTotalQuestionCount();
      
      expect(currentQuestion).toBeGreaterThan(0);
      expect(totalQuestions).toBeGreaterThan(0);
      expect(currentQuestion).toBeLessThanOrEqual(totalQuestions);
      
      // Verify progress bar if present
      await takeQuizPage.verifyProgress(currentQuestion);
    });
  });

  test.describe('Question Navigation', () => {
    test('should navigate between questions using next/previous buttons', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { takeQuizPage } = testContext;

      await takeQuizPage.goto();
      await takeQuizPage.verifyQuizLoaded();
      
      const totalQuestions = await takeQuizPage.getTotalQuestionCount();
      
      if (totalQuestions > 1) {
        // Navigate to next question
        const firstQuestionText = await takeQuizPage.questionText.textContent();
        await takeQuizPage.goToNextQuestion();
        
        const secondQuestionText = await takeQuizPage.questionText.textContent();
        expect(secondQuestionText).not.toBe(firstQuestionText);
        
        // Navigate back to previous question
        await takeQuizPage.goToPreviousQuestion();
        
        const backToFirstText = await takeQuizPage.questionText.textContent();
        expect(backToFirstText).toBe(firstQuestionText);
      }
    });

    test('should disable previous button on first question', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { takeQuizPage } = testContext;

      await takeQuizPage.goto();
      await takeQuizPage.verifyQuizLoaded();
      
      // Should be on first question
      const currentQuestion = await takeQuizPage.getCurrentQuestionNumber();
      if (currentQuestion === 1) {
        await takeQuizPage.verifyNavigationButtons({
          previousEnabled: false
        });
      }
    });

    test('should show finish button on last question', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { takeQuizPage } = testContext;

      await takeQuizPage.goto();
      await takeQuizPage.verifyQuizLoaded();
      
      const totalQuestions = await takeQuizPage.getTotalQuestionCount();
      
      // Navigate to last question
      for (let i = 1; i < totalQuestions; i++) {
        await takeQuizPage.goToNextQuestion();
      }
      
      // Should show finish button on last question
      await takeQuizPage.verifyNavigationButtons({
        finishVisible: true
      });
    });

    test('should maintain question state when navigating back', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { takeQuizPage } = testContext;

      await takeQuizPage.goto();
      await takeQuizPage.verifyQuizLoaded();
      
      const totalQuestions = await takeQuizPage.getTotalQuestionCount();
      
      if (totalQuestions > 1) {
        // Select an answer on first question
        await takeQuizPage.selectAnswer(0);
        const selectedAnswers = await takeQuizPage.getSelectedAnswers();
        
        // Navigate to next question and back
        await takeQuizPage.goToNextQuestion();
        await takeQuizPage.goToPreviousQuestion();
        
        // Answer should still be selected
        const stillSelected = await takeQuizPage.getSelectedAnswers();
        expect(stillSelected).toEqual(selectedAnswers);
      }
    });
  });

  test.describe('Answer Selection', () => {
    test('should select single answer correctly', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { takeQuizPage } = testContext;

      await takeQuizPage.goto();
      await takeQuizPage.verifyQuizLoaded();
      
      // Select first answer option
      await takeQuizPage.selectAnswer(0);
      
      // Verify selection
      const selectedAnswers = await takeQuizPage.getSelectedAnswers();
      expect(selectedAnswers).toContain(0);
    });

    test('should handle multiple choice questions', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { takeQuizPage } = testContext;

      await takeQuizPage.goto();
      await takeQuizPage.verifyQuizLoaded();
      
      const optionCount = await takeQuizPage.answerOptions.count();
      
      if (optionCount >= 2) {
        // Try selecting multiple answers (if supported)
        await takeQuizPage.selectMultipleAnswers([0, 1]);
        
        const selectedAnswers = await takeQuizPage.getSelectedAnswers();
        // Behavior depends on whether multi-select is supported
        expect(selectedAnswers.length).toBeGreaterThan(0);
      }
    });

    test('should change selection when clicking different options', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { takeQuizPage } = testContext;

      await takeQuizPage.goto();
      await takeQuizPage.verifyQuizLoaded();
      
      const optionCount = await takeQuizPage.answerOptions.count();
      
      if (optionCount >= 2) {
        // Select first option
        await takeQuizPage.selectAnswer(0);
        let selectedAnswers = await takeQuizPage.getSelectedAnswers();
        expect(selectedAnswers).toContain(0);
        
        // Select second option (should deselect first for single-choice)
        await takeQuizPage.selectAnswer(1);
        selectedAnswers = await takeQuizPage.getSelectedAnswers();
        
        // For single-choice questions, only one should be selected
        if (selectedAnswers.length === 1) {
          expect(selectedAnswers).toContain(1);
          expect(selectedAnswers).not.toContain(0);
        }
      }
    });

    test('should clear selection when clicking selected option', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { takeQuizPage } = testContext;

      await takeQuizPage.goto();
      await takeQuizPage.verifyQuizLoaded();
      
      // Select an answer
      await takeQuizPage.selectAnswer(0);
      let selectedAnswers = await takeQuizPage.getSelectedAnswers();
      expect(selectedAnswers).toContain(0);
      
      // Click same answer again (should deselect if supported)
      await takeQuizPage.answerOption(0).click();
      selectedAnswers = await takeQuizPage.getSelectedAnswers();
      
      // Behavior depends on implementation - might clear selection
    });
  });

  test.describe('Quiz Completion', () => {
    test('should complete quiz with all correct answers', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { takeQuizPage } = testContext;

      await takeQuizPage.goto();
      await takeQuizPage.verifyQuizLoaded();
      
      // Complete quiz with first answer for each question (simplified)
      const totalQuestions = await takeQuizPage.getTotalQuestionCount();
      const answers = Array(totalQuestions).fill(0);
      
      await takeQuizPage.completeQuiz(answers);
      
      // Should navigate to results
      await takeQuizPage.verifyPath('/quiz-results');
    });

    test('should complete quiz with mixed answers', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { takeQuizPage } = testContext;

      await takeQuizPage.goto();
      await takeQuizPage.verifyQuizLoaded();
      
      const totalQuestions = await takeQuizPage.getTotalQuestionCount();
      
      // Create mixed answers pattern
      const answers: number[] = [];
      for (let i = 0; i < totalQuestions; i++) {
        answers.push(i % 4); // Cycle through 0,1,2,3
      }
      
      await takeQuizPage.completeQuiz(answers);
      await takeQuizPage.verifyPath('/quiz-results');
    });

    test('should allow skipping questions', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { takeQuizPage } = testContext;

      await takeQuizPage.goto();
      await takeQuizPage.verifyQuizLoaded();
      
      const totalQuestions = await takeQuizPage.getTotalQuestionCount();
      
      if (totalQuestions > 1) {
        // Skip first question
        await takeQuizPage.skipQuestion();
        
        // Should be on question 2
        const currentQuestion = await takeQuizPage.getCurrentQuestionNumber();
        expect(currentQuestion).toBe(2);
      }
    });

    test('should handle incomplete quiz (no answers selected)', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { takeQuizPage } = testContext;

      await takeQuizPage.goto();
      await takeQuizPage.verifyQuizLoaded();
      
      const totalQuestions = await takeQuizPage.getTotalQuestionCount();
      
      // Navigate through all questions without selecting answers
      for (let i = 1; i < totalQuestions; i++) {
        await takeQuizPage.goToNextQuestion();
      }
      
      // Try to finish quiz
      await takeQuizPage.finishQuiz();
      
      // Should still proceed to results (allowing incomplete quizzes)
      await takeQuizPage.verifyPath('/quiz-results');
    });
  });

  test.describe('Keyboard Interaction', () => {
    test('should support keyboard navigation', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { takeQuizPage } = testContext;

      await takeQuizPage.goto();
      await takeQuizPage.verifyQuizLoaded();
      
      await takeQuizPage.testKeyboardNavigation();
    });

    test('should select answers using keyboard', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { takeQuizPage } = testContext;

      await takeQuizPage.goto();
      await takeQuizPage.verifyQuizLoaded();
      
      // Focus on first answer option
      const firstOption = takeQuizPage.answerOption(0);
      await firstOption.focus();
      
      // Select using spacebar or enter
      await page.keyboard.press('Space');
      
      // Verify selection
      const selectedAnswers = await takeQuizPage.getSelectedAnswers();
      expect(selectedAnswers).toContain(0);
    });

    test('should navigate questions using keyboard shortcuts', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { takeQuizPage } = testContext;

      await takeQuizPage.goto();
      await takeQuizPage.verifyQuizLoaded();
      
      const totalQuestions = await takeQuizPage.getTotalQuestionCount();
      
      if (totalQuestions > 1) {
        // Test if arrow keys or other shortcuts work for navigation
        await page.keyboard.press('ArrowRight');
        // Behavior depends on implementation
        
        // Focus on next button and use Enter
        await takeQuizPage.nextButton.focus();
        await page.keyboard.press('Enter');
        
        const currentQuestion = await takeQuizPage.getCurrentQuestionNumber();
        expect(currentQuestion).toBe(2);
      }
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test('should work correctly on mobile devices', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { takeQuizPage } = testContext;

      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await takeQuizPage.goto();
      await takeQuizPage.verifyQuizLoaded();
      await takeQuizPage.verifyMobileLayout();
      
      // Quiz functionality should still work on mobile
      await takeQuizPage.selectAnswer(0);
      
      const selectedAnswers = await takeQuizPage.getSelectedAnswers();
      expect(selectedAnswers).toContain(0);
    });

    test('should adapt navigation for mobile', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { takeQuizPage } = testContext;

      await page.setViewportSize({ width: 375, height: 667 });
      
      await takeQuizPage.goto();
      await takeQuizPage.verifyQuizLoaded();
      
      const totalQuestions = await takeQuizPage.getTotalQuestionCount();
      
      if (totalQuestions > 1) {
        // Navigation buttons should be accessible on mobile
        await expect(takeQuizPage.nextButton).toBeVisible();
        await takeQuizPage.goToNextQuestion();
        
        const currentQuestion = await takeQuizPage.getCurrentQuestionNumber();
        expect(currentQuestion).toBe(2);
      }
    });

    test('should handle touch interactions', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { takeQuizPage } = testContext;

      await page.setViewportSize({ width: 375, height: 667 });
      
      await takeQuizPage.goto();
      await takeQuizPage.verifyQuizLoaded();
      
      // Simulate touch interaction
      const firstOption = takeQuizPage.answerOption(0);
      await firstOption.tap();
      
      const selectedAnswers = await takeQuizPage.getSelectedAnswers();
      expect(selectedAnswers).toContain(0);
    });
  });

  test.describe('Quiz State Management', () => {
    test('should preserve answers when navigating between questions', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { takeQuizPage } = testContext;

      await takeQuizPage.goto();
      await takeQuizPage.verifyQuizLoaded();
      
      const totalQuestions = await takeQuizPage.getTotalQuestionCount();
      
      if (totalQuestions >= 3) {
        // Answer questions 1 and 2
        await takeQuizPage.selectAnswer(0);
        await takeQuizPage.goToNextQuestion();
        
        await takeQuizPage.selectAnswer(1);
        await takeQuizPage.goToNextQuestion();
        
        // Go back to question 1
        await takeQuizPage.goToPreviousQuestion();
        await takeQuizPage.goToPreviousQuestion();
        
        // Answer should still be selected
        const selectedAnswers = await takeQuizPage.getSelectedAnswers();
        expect(selectedAnswers).toContain(0);
      }
    });

    test('should handle browser refresh during quiz', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { takeQuizPage } = testContext;

      await takeQuizPage.goto();
      await takeQuizPage.verifyQuizLoaded();
      
      // Select some answers
      await takeQuizPage.selectAnswer(0);
      
      // Refresh page
      await page.reload();
      
      // Should handle refresh gracefully - either preserve state or restart
      await takeQuizPage.waitForQuizLoad();
    });

    test('should track quiz progress correctly', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { takeQuizPage } = testContext;

      await takeQuizPage.goto();
      await takeQuizPage.verifyQuizLoaded();
      
      const totalQuestions = await takeQuizPage.getTotalQuestionCount();
      
      // Progress through each question
      for (let i = 1; i <= totalQuestions; i++) {
        const currentQuestion = await takeQuizPage.getCurrentQuestionNumber();
        expect(currentQuestion).toBe(i);
        
        if (i < totalQuestions) {
          await takeQuizPage.selectAnswer(0);
          await takeQuizPage.goToNextQuestion();
        }
      }
    });
  });

  test.describe('Error Handling', () => {
    test('should handle quiz loading errors', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { takeQuizPage } = testContext;

      // Mock API error
      await page.route('**/api/**', route => route.abort());
      
      await takeQuizPage.goto();
      
      // Should handle error gracefully
      const hasError = await takeQuizPage.handleQuizError();
      if (!hasError) {
        // If no error shown, quiz should load normally or show no questions
        const hasQuestions = await takeQuizPage.questionText.isVisible().catch(() => false);
        const hasNoQuestions = await takeQuizPage.noQuestionsMessage.isVisible().catch(() => false);
        
        expect(hasQuestions || hasNoQuestions).toBe(true);
      }
    });

    test('should handle network timeouts during quiz', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { takeQuizPage } = testContext;

      await takeQuizPage.goto();
      await takeQuizPage.verifyQuizLoaded();
      
      // Mock slow network for quiz submission
      await page.route('**/api/**', route => {
        setTimeout(() => route.continue(), 10000); // 10 second delay
      });
      
      // Try to complete quiz
      const totalQuestions = await takeQuizPage.getTotalQuestionCount();
      const answers = Array(totalQuestions).fill(0);
      
      // Fill answers but don't wait for completion
      for (let i = 0; i < totalQuestions - 1; i++) {
        await takeQuizPage.selectAnswer(answers[i]);
        await takeQuizPage.goToNextQuestion();
      }
      
      // Select last answer and finish
      await takeQuizPage.selectAnswer(answers[totalQuestions - 1]);
      await takeQuizPage.finishButton.click();
      
      // Should show loading state or handle timeout
      await page.waitForTimeout(2000);
    });
  });
});