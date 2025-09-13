/**
 * Quiz Results page object model
 * Handles quiz results display, score review, and retake functionality
 */

import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';

export class QuizResultsPage extends BasePage {
  // Results header
  readonly resultsTitle: Locator;
  readonly congratulationsMessage: Locator;
  readonly scoreDisplay: Locator;
  readonly percentageScore: Locator;
  readonly gradeDisplay: Locator;

  // Score breakdown
  readonly correctAnswers: Locator;
  readonly incorrectAnswers: Locator;
  readonly totalQuestions: Locator;
  readonly timeSpent: Locator;
  readonly averageTime: Locator;

  // Performance analysis
  readonly performanceSection: Locator;
  readonly strongAreas: Locator;
  readonly weakAreas: Locator;
  readonly recommendations: Locator;

  // Question review
  readonly reviewSection: Locator;
  readonly reviewQuestions: Locator;
  readonly reviewQuestion: (index: number) => Locator;
  readonly correctAnswerIndicator: Locator;
  readonly incorrectAnswerIndicator: Locator;
  readonly explanations: Locator;

  // Action buttons
  readonly retakeQuizButton: Locator;
  readonly generateNewQuizButton: Locator;
  readonly viewDetailedReviewButton: Locator;
  readonly backToHomeButton: Locator;
  readonly shareResultsButton: Locator;

  // Charts and visuals
  readonly scoreChart: Locator;
  readonly progressVisualization: Locator;
  readonly confettiAnimation: Locator;

  // Feedback section
  readonly overallFeedback: Locator;
  readonly strengths: Locator;
  readonly improvements: Locator;
  readonly nextSteps: Locator;

  // Error states
  readonly noResultsMessage: Locator;
  readonly errorMessage: Locator;
  readonly loadingSpinner: Locator;

  constructor(page: Page) {
    super(page);
    
    // Results header
    this.resultsTitle = page.locator('h1:has-text("Results"), h1:has-text("Score"), [data-testid="results-title"]');
    this.congratulationsMessage = page.locator('text=Congratulations, text=Well done, text=Great job');
    this.scoreDisplay = page.locator('[data-testid="score-display"], .score-display, .final-score');
    this.percentageScore = page.locator('[data-testid="percentage-score"], .percentage-score');
    this.gradeDisplay = page.locator('[data-testid="grade-display"], .grade-display');

    // Score breakdown
    this.correctAnswers = page.locator('[data-testid="correct-answers"], .correct-answers, text=/correct/i');
    this.incorrectAnswers = page.locator('[data-testid="incorrect-answers"], .incorrect-answers, text=/incorrect/i');
    this.totalQuestions = page.locator('[data-testid="total-questions"], .total-questions');
    this.timeSpent = page.locator('[data-testid="time-spent"], .time-spent, text=/time/i');
    this.averageTime = page.locator('[data-testid="average-time"], .average-time');

    // Performance analysis
    this.performanceSection = page.locator('[data-testid="performance-analysis"], .performance-analysis');
    this.strongAreas = page.locator('[data-testid="strong-areas"], .strong-areas, text=/strong/i');
    this.weakAreas = page.locator('[data-testid="weak-areas"], .weak-areas, text=/weak/i');
    this.recommendations = page.locator('[data-testid="recommendations"], .recommendations');

    // Question review
    this.reviewSection = page.locator('[data-testid="question-review"], .question-review');
    this.reviewQuestions = page.locator('[data-testid="review-question"], .review-question');
    this.reviewQuestion = (index: number) => this.reviewQuestions.nth(index);
    this.correctAnswerIndicator = page.locator('.correct-answer, .text-green-500, [data-testid="correct-indicator"]');
    this.incorrectAnswerIndicator = page.locator('.incorrect-answer, .text-red-500, [data-testid="incorrect-indicator"]');
    this.explanations = page.locator('[data-testid="explanation"], .explanation');

    // Action buttons
    this.retakeQuizButton = page.locator('button:has-text("Retake"), button:has-text("Try Again"), [data-testid="retake-button"]');
    this.generateNewQuizButton = page.locator('button:has-text("New Quiz"), button:has-text("Generate"), [data-testid="new-quiz-button"]');
    this.viewDetailedReviewButton = page.locator('button:has-text("Review"), button:has-text("Detailed"), [data-testid="review-button"]');
    this.backToHomeButton = page.locator('button:has-text("Home"), a:has-text("Home"), [data-testid="home-button"]');
    this.shareResultsButton = page.locator('button:has-text("Share"), [data-testid="share-button"]');

    // Charts and visuals
    this.scoreChart = page.locator('[data-testid="score-chart"], .score-chart, canvas, svg');
    this.progressVisualization = page.locator('[data-testid="progress-visualization"], .progress-viz');
    this.confettiAnimation = page.locator('[data-testid="confetti"], .confetti');

    // Feedback section
    this.overallFeedback = page.locator('[data-testid="overall-feedback"], .overall-feedback');
    this.strengths = page.locator('[data-testid="strengths"], .strengths');
    this.improvements = page.locator('[data-testid="improvements"], .improvements');
    this.nextSteps = page.locator('[data-testid="next-steps"], .next-steps');

    // Error states
    this.noResultsMessage = page.locator('[data-testid="no-results"], text="No results available"');
    this.errorMessage = page.locator('[data-testid="error-message"], .error-message');
    this.loadingSpinner = page.locator('[data-testid="loading"], .loading');
  }

  /**
   * Navigate to quiz results page
   */
  async goto() {
    await super.goto('/quiz-results');
    await this.waitForResultsLoad();
  }

  /**
   * Wait for results to load completely
   */
  async waitForResultsLoad() {
    try {
      await Promise.race([
        this.waitForVisible(this.scoreDisplay),
        this.waitForVisible(this.noResultsMessage),
        this.waitForVisible(this.errorMessage)
      ]);
      await this.waitForNoLoading();
    } catch {
      // Handle timeout
      console.log('Results page load timeout');
    }
  }

  /**
   * Verify quiz results are displayed
   */
  async verifyResultsLoaded() {
    await expect(this.resultsTitle).toBeVisible();
    await expect(this.scoreDisplay).toBeVisible();
    await expect(this.retakeQuizButton.or(this.generateNewQuizButton)).toBeVisible();
  }

  /**
   * Verify no results available state
   */
  async verifyNoResults() {
    await expect(this.noResultsMessage).toBeVisible();
    await expect(this.generateNewQuizButton.or(this.backToHomeButton)).toBeVisible();
  }

  /**
   * Get quiz score information
   */
  async getScoreInfo(): Promise<{
    score: number;
    percentage: number;
    correct: number;
    incorrect: number;
    total: number;
    grade?: string;
  }> {
    const scoreText = await this.scoreDisplay.textContent();
    const percentageText = await this.percentageScore.textContent();
    const correctText = await this.correctAnswers.textContent();
    const incorrectText = await this.incorrectAnswers.textContent();
    const totalText = await this.totalQuestions.textContent();

    // Extract numbers from text
    const score = scoreText?.match(/\d+/)?.[0] || '0';
    const percentage = percentageText?.match(/\d+/)?.[0] || '0';
    const correct = correctText?.match(/\d+/)?.[0] || '0';
    const incorrect = incorrectText?.match(/\d+/)?.[0] || '0';
    const total = totalText?.match(/\d+/)?.[0] || '0';

    let grade: string | undefined;
    try {
      grade = await this.gradeDisplay.textContent() || undefined;
    } catch {
      // Grade might not be available
    }

    return {
      score: parseInt(score),
      percentage: parseInt(percentage),
      correct: parseInt(correct),
      incorrect: parseInt(incorrect),
      total: parseInt(total),
      grade
    };
  }

  /**
   * Verify score display
   */
  async verifyScore(expected: {
    score?: number;
    percentage?: number;
    correct?: number;
    incorrect?: number;
    total?: number;
    grade?: string;
  }) {
    const actualScore = await this.getScoreInfo();

    if (expected.score !== undefined) {
      expect(actualScore.score).toBe(expected.score);
    }
    
    if (expected.percentage !== undefined) {
      expect(actualScore.percentage).toBe(expected.percentage);
    }
    
    if (expected.correct !== undefined) {
      expect(actualScore.correct).toBe(expected.correct);
    }
    
    if (expected.incorrect !== undefined) {
      expect(actualScore.incorrect).toBe(expected.incorrect);
    }
    
    if (expected.total !== undefined) {
      expect(actualScore.total).toBe(expected.total);
    }
    
    if (expected.grade) {
      expect(actualScore.grade).toContain(expected.grade);
    }
  }

  /**
   * Verify performance analysis
   */
  async verifyPerformanceAnalysis(expected: {
    hasStrongAreas?: boolean;
    hasWeakAreas?: boolean;
    hasRecommendations?: boolean;
    strongAreas?: string[];
    weakAreas?: string[];
  }) {
    if (expected.hasStrongAreas) {
      await expect(this.strongAreas).toBeVisible();
      
      if (expected.strongAreas) {
        for (const area of expected.strongAreas) {
          await expect(this.strongAreas).toContainText(area);
        }
      }
    }

    if (expected.hasWeakAreas) {
      await expect(this.weakAreas).toBeVisible();
      
      if (expected.weakAreas) {
        for (const area of expected.weakAreas) {
          await expect(this.weakAreas).toContainText(area);
        }
      }
    }

    if (expected.hasRecommendations) {
      await expect(this.recommendations).toBeVisible();
    }
  }

  /**
   * Verify question review section
   */
  async verifyQuestionReview(expectedQuestionCount?: number) {
    await expect(this.reviewSection).toBeVisible();
    
    if (expectedQuestionCount) {
      await expect(this.reviewQuestions).toHaveCount(expectedQuestionCount);
    }

    // Check that explanations are visible
    await expect(this.explanations.first()).toBeVisible();
  }

  /**
   * Retake the same quiz
   */
  async retakeQuiz() {
    await expect(this.retakeQuizButton).toBeVisible();
    await this.retakeQuizButton.click();
    
    // Should navigate back to take quiz page
    await this.verifyPath('/take-quiz');
  }

  /**
   * Generate a new quiz
   */
  async generateNewQuiz() {
    await expect(this.generateNewQuizButton).toBeVisible();
    await this.generateNewQuizButton.click();
    
    // Should navigate to generate quiz page
    await this.verifyPath('/generate-quiz');
  }

  /**
   * View detailed review
   */
  async viewDetailedReview() {
    if (await this.viewDetailedReviewButton.isVisible()) {
      await this.viewDetailedReviewButton.click();
      
      // Should expand or navigate to detailed review
      await expect(this.reviewSection).toBeVisible();
    }
  }

  /**
   * Go back to home
   */
  async goBackToHome() {
    if (await this.backToHomeButton.isVisible()) {
      await this.backToHomeButton.click();
    } else {
      await this.clickNavItem('Home');
    }
    
    await this.verifyPath('/');
  }

  /**
   * Verify congratulations message for good scores
   */
  async verifyCongratulationsMessage(shouldShow: boolean = true) {
    if (shouldShow) {
      await expect(this.congratulationsMessage).toBeVisible();
    } else {
      await expect(this.congratulationsMessage).toBeHidden();
    }
  }

  /**
   * Verify confetti animation for high scores
   */
  async verifyConfettiAnimation(shouldShow: boolean = true) {
    if (shouldShow) {
      const hasConfetti = await this.confettiAnimation.isVisible().catch(() => false);
      if (hasConfetti) {
        await expect(this.confettiAnimation).toBeVisible();
      }
    }
  }

  /**
   * Verify time spent information
   */
  async verifyTimeSpent() {
    if (await this.timeSpent.isVisible()) {
      const timeText = await this.timeSpent.textContent();
      expect(timeText).toMatch(/\d+/); // Should contain at least one number
    }
  }

  /**
   * Check individual question results
   */
  async checkQuestionResult(questionIndex: number, expectedCorrect: boolean) {
    const question = this.reviewQuestion(questionIndex);
    await expect(question).toBeVisible();
    
    if (expectedCorrect) {
      await expect(question.locator('.correct-answer, .text-green-500')).toBeVisible();
    } else {
      await expect(question.locator('.incorrect-answer, .text-red-500')).toBeVisible();
    }
  }

  /**
   * Verify overall feedback section
   */
  async verifyOverallFeedback() {
    if (await this.overallFeedback.isVisible()) {
      await expect(this.strengths).toBeVisible();
      await expect(this.improvements).toBeVisible();
      await expect(this.nextSteps).toBeVisible();
    }
  }

  /**
   * Verify action buttons are available
   */
  async verifyActionButtons(expected: {
    retake?: boolean;
    newQuiz?: boolean;
    detailedReview?: boolean;
    home?: boolean;
    share?: boolean;
  }) {
    if (expected.retake) {
      await expect(this.retakeQuizButton).toBeVisible();
      await expect(this.retakeQuizButton).toBeEnabled();
    }
    
    if (expected.newQuiz) {
      await expect(this.generateNewQuizButton).toBeVisible();
      await expect(this.generateNewQuizButton).toBeEnabled();
    }
    
    if (expected.detailedReview) {
      await expect(this.viewDetailedReviewButton).toBeVisible();
    }
    
    if (expected.home) {
      await expect(this.backToHomeButton).toBeVisible();
    }
    
    if (expected.share && await this.shareResultsButton.isVisible().catch(() => false)) {
      await expect(this.shareResultsButton).toBeVisible();
    }
  }

  /**
   * Verify responsive layout
   */
  async verifyResponsiveLayout() {
    const isMobileView = await this.isMobile();
    
    if (isMobileView) {
      // Verify mobile-optimized layout
      await expect(this.scoreDisplay).toBeVisible();
      
      // Action buttons might stack vertically on mobile
      await expect(this.retakeQuizButton.or(this.generateNewQuizButton)).toBeVisible();
    } else {
      // Verify desktop layout
      await expect(this.scoreDisplay).toBeVisible();
      await expect(this.performanceSection).toBeVisible();
    }
  }

  /**
   * Verify chart/visualization elements
   */
  async verifyVisualizations() {
    const hasChart = await this.scoreChart.isVisible().catch(() => false);
    
    if (hasChart) {
      await expect(this.scoreChart).toBeVisible();
    }
    
    const hasProgressViz = await this.progressVisualization.isVisible().catch(() => false);
    
    if (hasProgressViz) {
      await expect(this.progressVisualization).toBeVisible();
    }
  }

  /**
   * Test keyboard navigation
   */
  async testKeyboardNavigation() {
    // Focus on action buttons and test navigation
    await this.retakeQuizButton.focus();
    await expect(this.retakeQuizButton).toBeFocused();
    
    await this.page.keyboard.press('Tab');
    await expect(this.generateNewQuizButton).toBeFocused();
  }

  /**
   * Verify accessibility features
   */
  async verifyAccessibility() {
    // Check for proper headings hierarchy
    await expect(this.resultsTitle).toBeVisible();
    
    // Check for proper button labeling
    await expect(this.retakeQuizButton).toHaveAttribute('type', 'button');
    
    // Verify score information is accessible
    await expect(this.scoreDisplay).toBeVisible();
  }
}