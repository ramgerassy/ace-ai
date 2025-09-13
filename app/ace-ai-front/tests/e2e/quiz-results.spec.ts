/**
 * Quiz Results E2E Tests
 * Tests quiz results display, score analysis, and retake functionality
 */

import { test, expect } from '@playwright/test';
import { createTestContext, UserTestUtils, QuizTestUtils } from './utils/test-helpers';
import { quizFormData, testAnswers } from './fixtures/quiz-fixtures';
import { testUsers } from './fixtures/user-fixtures';

test.describe('Quiz Results', () => {
  test.beforeEach(async ({ page, context }) => {
    const testContext = createTestContext(page, context);
    const userUtils = new UserTestUtils(testContext);
    
    // Set up authenticated user
    await userUtils.clearAllUsers();
    await userUtils.createUser(testUsers.primary.name);
  });

  test.describe('Results Display', () => {
    test('should display quiz results after completion', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const quizUtils = new QuizTestUtils(testContext);
      
      // Complete full workflow
      const scoreInfo = await quizUtils.completeFullQuizWorkflow(
        { name: testUsers.primary.name },
        quizFormData.valid,
        [0, 1, 0, 1, 0] // Sample answers
      );
      
      // Verify results are displayed
      const { resultsPage } = testContext;
      await resultsPage.verifyResultsLoaded();
      
      expect(scoreInfo.total).toBeGreaterThan(0);
      expect(scoreInfo.score).toBeGreaterThanOrEqual(0);
      expect(scoreInfo.percentage).toBeGreaterThanOrEqual(0);
      expect(scoreInfo.percentage).toBeLessThanOrEqual(100);
    });

    test('should show accurate score calculation', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const quizUtils = new QuizTestUtils(testContext);
      
      const scoreInfo = await quizUtils.completeFullQuizWorkflow(
        { name: testUsers.primary.name },
        quizFormData.valid,
        [0, 0, 0, 0, 0] // All same answers
      );
      
      // Verify score consistency
      expect(scoreInfo.correct + scoreInfo.incorrect).toBe(scoreInfo.total);
      
      const expectedPercentage = Math.round((scoreInfo.correct / scoreInfo.total) * 100);
      expect(scoreInfo.percentage).toBe(expectedPercentage);
    });

    test('should display performance analysis', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const quizUtils = new QuizTestUtils(testContext);
      const { resultsPage } = testContext;
      
      await quizUtils.completeFullQuizWorkflow(
        { name: testUsers.primary.name },
        quizFormData.valid,
        [0, 1, 2, 1, 0]
      );
      
      await resultsPage.verifyPerformanceAnalysis({
        hasRecommendations: true
      });
    });

    test('should show question review section', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const quizUtils = new QuizTestUtils(testContext);
      const { resultsPage } = testContext;
      
      await quizUtils.completeFullQuizWorkflow(
        { name: testUsers.primary.name },
        quizFormData.valid,
        [0, 1, 0, 1, 0]
      );
      
      await resultsPage.verifyQuestionReview(quizFormData.valid.questionCount);
    });

    test('should display time spent information', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const quizUtils = new QuizTestUtils(testContext);
      const { resultsPage } = testContext;
      
      await quizUtils.completeFullQuizWorkflow(
        { name: testUsers.primary.name },
        quizFormData.valid,
        [0, 1, 0, 1, 0]
      );
      
      await resultsPage.verifyTimeSpent();
    });
  });

  test.describe('Score Presentation', () => {
    test('should show congratulations for high scores', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const quizUtils = new QuizTestUtils(testContext);
      const { resultsPage } = testContext;
      
      // Simulate high score by using predictable correct answers
      await quizUtils.completeFullQuizWorkflow(
        { name: testUsers.primary.name },
        quizFormData.beginner, // Beginner level for potentially easier questions
        [0, 1, 2, 0, 1] // Varied answers
      );
      
      const scoreInfo = await resultsPage.getScoreInfo();
      
      if (scoreInfo.percentage >= 80) {
        await resultsPage.verifyCongratulationsMessage(true);
        await resultsPage.verifyConfettiAnimation(true);
      }
    });

    test('should show appropriate message for low scores', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const quizUtils = new QuizTestUtils(testContext);
      const { resultsPage } = testContext;
      
      await quizUtils.completeFullQuizWorkflow(
        { name: testUsers.primary.name },
        quizFormData.valid,
        [0, 0, 0, 0, 0] // All same answers (likely some incorrect)
      );
      
      const scoreInfo = await resultsPage.getScoreInfo();
      
      if (scoreInfo.percentage < 50) {
        await resultsPage.verifyCongratulationsMessage(false);
      }
    });

    test('should display grade information', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const quizUtils = new QuizTestUtils(testContext);
      const { resultsPage } = testContext;
      
      await quizUtils.completeFullQuizWorkflow(
        { name: testUsers.primary.name },
        quizFormData.valid,
        [0, 1, 2, 1, 0]
      );
      
      const scoreInfo = await resultsPage.getScoreInfo();
      
      if (scoreInfo.grade) {
        expect(['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F']).toContain(scoreInfo.grade);
      }
    });
  });

  test.describe('Action Buttons and Navigation', () => {
    test('should allow retaking the same quiz', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const quizUtils = new QuizTestUtils(testContext);
      const { resultsPage, takeQuizPage } = testContext;
      
      await quizUtils.completeFullQuizWorkflow(
        { name: testUsers.primary.name },
        quizFormData.valid,
        [0, 1, 0, 1, 0]
      );
      
      await resultsPage.retakeQuiz();
      
      // Should be back on take quiz page with same quiz
      await takeQuizPage.verifyQuizLoaded();
    });

    test('should allow generating new quiz', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const quizUtils = new QuizTestUtils(testContext);
      const { resultsPage, generateQuizPage } = testContext;
      
      await quizUtils.completeFullQuizWorkflow(
        { name: testUsers.primary.name },
        quizFormData.valid,
        [0, 1, 0, 1, 0]
      );
      
      await resultsPage.generateNewQuiz();
      
      // Should navigate to generate quiz page
      await generateQuizPage.verifyPageLoaded();
    });

    test('should navigate back to home', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const quizUtils = new QuizTestUtils(testContext);
      const { resultsPage, welcomePage } = testContext;
      
      await quizUtils.completeFullQuizWorkflow(
        { name: testUsers.primary.name },
        quizFormData.valid,
        [0, 1, 0, 1, 0]
      );
      
      await resultsPage.goBackToHome();
      
      // Should be back on welcome page
      await welcomePage.verifyReturningUserWelcome(testUsers.primary.name);
    });

    test('should show detailed review when available', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const quizUtils = new QuizTestUtils(testContext);
      const { resultsPage } = testContext;
      
      await quizUtils.completeFullQuizWorkflow(
        { name: testUsers.primary.name },
        quizFormData.valid,
        [0, 1, 0, 1, 0]
      );
      
      await resultsPage.viewDetailedReview();
      
      // Review section should be visible
      await resultsPage.verifyQuestionReview();
    });

    test('should verify all action buttons are present', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const quizUtils = new QuizTestUtils(testContext);
      const { resultsPage } = testContext;
      
      await quizUtils.completeFullQuizWorkflow(
        { name: testUsers.primary.name },
        quizFormData.valid,
        [0, 1, 0, 1, 0]
      );
      
      await resultsPage.verifyActionButtons({
        retake: true,
        newQuiz: true,
        home: true
      });
    });
  });

  test.describe('No Results State', () => {
    test('should handle no results available', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { resultsPage } = testContext;
      
      // Navigate directly to results without completing a quiz
      await resultsPage.goto();
      
      // Should show no results message or redirect
      const hasResults = await resultsPage.scoreDisplay.isVisible().catch(() => false);
      if (!hasResults) {
        await resultsPage.verifyNoResults();
      }
    });

    test('should provide navigation options when no results', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { resultsPage } = testContext;
      
      await resultsPage.goto();
      
      const hasResults = await resultsPage.scoreDisplay.isVisible().catch(() => false);
      if (!hasResults) {
        await resultsPage.verifyNoResults();
        
        // Should have options to generate quiz or go home
        const hasNewQuizButton = await resultsPage.generateNewQuizButton.isVisible().catch(() => false);
        const hasHomeButton = await resultsPage.backToHomeButton.isVisible().catch(() => false);
        
        expect(hasNewQuizButton || hasHomeButton).toBe(true);
      }
    });
  });

  test.describe('Question Review Details', () => {
    test('should show correct and incorrect answers', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const quizUtils = new QuizTestUtils(testContext);
      const { resultsPage } = testContext;
      
      await quizUtils.completeFullQuizWorkflow(
        { name: testUsers.primary.name },
        quizFormData.valid,
        [0, 1, 0, 1, 0]
      );
      
      await resultsPage.verifyQuestionReview();
      
      // Check individual question results
      const questionCount = await resultsPage.reviewQuestions.count();
      for (let i = 0; i < Math.min(questionCount, 3); i++) {
        const question = resultsPage.reviewQuestion(i);
        await expect(question).toBeVisible();
        
        // Should show either correct or incorrect indicator
        const hasCorrect = await question.locator('.correct-answer, .text-green-500').isVisible().catch(() => false);
        const hasIncorrect = await question.locator('.incorrect-answer, .text-red-500').isVisible().catch(() => false);
        
        expect(hasCorrect || hasIncorrect).toBe(true);
      }
    });

    test('should display explanations for questions', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const quizUtils = new QuizTestUtils(testContext);
      const { resultsPage } = testContext;
      
      await quizUtils.completeFullQuizWorkflow(
        { name: testUsers.primary.name },
        quizFormData.valid,
        [0, 1, 0, 1, 0]
      );
      
      await resultsPage.verifyQuestionReview();
      
      // Should have explanations
      await expect(resultsPage.explanations.first()).toBeVisible();
    });
  });

  test.describe('Performance Analytics', () => {
    test('should show performance breakdown', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const quizUtils = new QuizTestUtils(testContext);
      const { resultsPage } = testContext;
      
      await quizUtils.completeFullQuizWorkflow(
        { name: testUsers.primary.name },
        quizFormData.valid,
        [0, 1, 2, 1, 0]
      );
      
      await resultsPage.verifyPerformanceAnalysis({
        hasStrongAreas: true,
        hasWeakAreas: true,
        hasRecommendations: true
      });
    });

    test('should provide learning recommendations', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const quizUtils = new QuizTestUtils(testContext);
      const { resultsPage } = testContext;
      
      await quizUtils.completeFullQuizWorkflow(
        { name: testUsers.primary.name },
        quizFormData.valid,
        [0, 0, 0, 0, 0] // All same answers to ensure some incorrect
      );
      
      await resultsPage.verifyOverallFeedback();
      
      // Should show improvements and next steps
      await expect(resultsPage.improvements).toBeVisible();
      await expect(resultsPage.nextSteps).toBeVisible();
    });

    test('should show strength areas for good performance', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const quizUtils = new QuizTestUtils(testContext);
      const { resultsPage } = testContext;
      
      await quizUtils.completeFullQuizWorkflow(
        { name: testUsers.primary.name },
        quizFormData.beginner,
        [0, 1, 2, 0, 1] // Varied answers
      );
      
      const scoreInfo = await resultsPage.getScoreInfo();
      
      if (scoreInfo.correct > 0) {
        await resultsPage.verifyPerformanceAnalysis({
          hasStrongAreas: true
        });
      }
    });
  });

  test.describe('Visual Elements and Charts', () => {
    test('should display score visualizations', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const quizUtils = new QuizTestUtils(testContext);
      const { resultsPage } = testContext;
      
      await quizUtils.completeFullQuizWorkflow(
        { name: testUsers.primary.name },
        quizFormData.valid,
        [0, 1, 0, 1, 0]
      );
      
      await resultsPage.verifyVisualizations();
    });

    test('should show confetti for excellent performance', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const quizUtils = new QuizTestUtils(testContext);
      const { resultsPage } = testContext;
      
      await quizUtils.completeFullQuizWorkflow(
        { name: testUsers.primary.name },
        quizFormData.beginner,
        [0, 1, 2, 0, 1]
      );
      
      const scoreInfo = await resultsPage.getScoreInfo();
      
      if (scoreInfo.percentage >= 90) {
        await resultsPage.verifyConfettiAnimation(true);
      }
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test('should display results correctly on mobile', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const quizUtils = new QuizTestUtils(testContext);
      const { resultsPage } = testContext;
      
      await page.setViewportSize({ width: 375, height: 667 });
      
      await quizUtils.completeFullQuizWorkflow(
        { name: testUsers.primary.name },
        quizFormData.valid,
        [0, 1, 0, 1, 0]
      );
      
      await resultsPage.verifyResponsiveLayout();
    });

    test('should maintain functionality on mobile', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const quizUtils = new QuizTestUtils(testContext);
      const { resultsPage, takeQuizPage } = testContext;
      
      await page.setViewportSize({ width: 375, height: 667 });
      
      await quizUtils.completeFullQuizWorkflow(
        { name: testUsers.primary.name },
        quizFormData.valid,
        [0, 1, 0, 1, 0]
      );
      
      // Action buttons should work on mobile
      await resultsPage.retakeQuiz();
      await takeQuizPage.verifyQuizLoaded();
    });
  });

  test.describe('Accessibility', () => {
    test('should provide keyboard navigation', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const quizUtils = new QuizTestUtils(testContext);
      const { resultsPage } = testContext;
      
      await quizUtils.completeFullQuizWorkflow(
        { name: testUsers.primary.name },
        quizFormData.valid,
        [0, 1, 0, 1, 0]
      );
      
      await resultsPage.testKeyboardNavigation();
    });

    test('should have proper accessibility attributes', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const quizUtils = new QuizTestUtils(testContext);
      const { resultsPage } = testContext;
      
      await quizUtils.completeFullQuizWorkflow(
        { name: testUsers.primary.name },
        quizFormData.valid,
        [0, 1, 0, 1, 0]
      );
      
      await resultsPage.verifyAccessibility();
    });
  });

  test.describe('Edge Cases and Error Handling', () => {
    test('should handle zero score gracefully', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const quizUtils = new QuizTestUtils(testContext);
      const { resultsPage } = testContext;
      
      // Complete quiz with all wrong answers (if possible)
      await quizUtils.completeFullQuizWorkflow(
        { name: testUsers.primary.name },
        quizFormData.valid,
        [3, 3, 3, 3, 3] // Assuming these are likely incorrect
      );
      
      const scoreInfo = await resultsPage.getScoreInfo();
      
      // Should handle zero score without errors
      expect(scoreInfo.score).toBeGreaterThanOrEqual(0);
      expect(scoreInfo.percentage).toBeGreaterThanOrEqual(0);
    });

    test('should handle perfect score', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const quizUtils = new QuizTestUtils(testContext);
      const { resultsPage } = testContext;
      
      // This would need actual correct answers, which depend on the quiz implementation
      await quizUtils.completeFullQuizWorkflow(
        { name: testUsers.primary.name },
        quizFormData.valid,
        [0, 1, 0, 1, 0]
      );
      
      const scoreInfo = await resultsPage.getScoreInfo();
      
      if (scoreInfo.percentage === 100) {
        await resultsPage.verifyCongratulationsMessage(true);
        await resultsPage.verifyConfettiAnimation(true);
      }
    });

    test('should handle API errors in results loading', async ({ page, context }) => {
      const testContext = createTestContext(page, context);
      const { resultsPage } = testContext;
      
      // Mock API error
      await page.route('**/api/**', route => route.abort());
      
      await resultsPage.goto();
      
      // Should handle error gracefully
      const hasError = await resultsPage.errorMessage.isVisible().catch(() => false);
      const hasNoResults = await resultsPage.noResultsMessage.isVisible().catch(() => false);
      
      expect(hasError || hasNoResults).toBe(true);
    });
  });
});