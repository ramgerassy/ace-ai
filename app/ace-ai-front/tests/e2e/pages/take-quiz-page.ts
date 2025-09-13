/**
 * Take Quiz page object model
 * Handles quiz taking, question navigation, and answer selection
 */

import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';

export class TakeQuizPage extends BasePage {
  // Quiz header
  readonly quizTitle: Locator;
  readonly progressBar: Locator;
  readonly progressText: Locator;
  readonly timerElement: Locator;

  // Question elements
  readonly questionContainer: Locator;
  readonly questionText: Locator;
  readonly questionNumber: Locator;
  readonly answerOptions: Locator;
  readonly answerOption: (index: number) => Locator;

  // Navigation buttons
  readonly previousButton: Locator;
  readonly nextButton: Locator;
  readonly finishButton: Locator;
  readonly skipButton: Locator;

  // Question indicators
  readonly questionIndicators: Locator;
  readonly currentQuestionIndicator: Locator;
  readonly answeredQuestionIndicator: Locator;

  // Quiz info
  readonly quizMetadata: Locator;
  readonly questionCount: Locator;
  readonly difficultyLevel: Locator;
  readonly subject: Locator;

  // Error and loading states
  readonly errorMessage: Locator;
  readonly loadingSpinner: Locator;
  readonly noQuestionsMessage: Locator;

  // Mobile elements
  readonly mobileProgressIndicator: Locator;
  readonly mobileQuestionNumber: Locator;

  constructor(page: Page) {
    super(page);
    
    // Quiz header
    this.quizTitle = page.locator('h1, [data-testid="quiz-title"]');
    this.progressBar = page.locator('[data-testid="progress-bar"], .progress-bar, progress');
    this.progressText = page.locator('[data-testid="progress-text"], .progress-text');
    this.timerElement = page.locator('[data-testid="timer"], .timer');

    // Question elements
    this.questionContainer = page.locator('[data-testid="question-container"], .question-container');
    this.questionText = page.locator('[data-testid="question-text"], .question-text, h2, h3');
    this.questionNumber = page.locator('[data-testid="question-number"], .question-number');
    this.answerOptions = page.locator('[data-testid="answer-option"], .answer-option, input[type="radio"], input[type="checkbox"]');
    this.answerOption = (index: number) => this.answerOptions.nth(index);

    // Navigation
    this.previousButton = page.locator('button:has-text("Previous"), button:has-text("Back"), [data-testid="previous-button"]');
    this.nextButton = page.locator('button:has-text("Next"), [data-testid="next-button"]');
    this.finishButton = page.locator('button:has-text("Finish"), button:has-text("Submit"), [data-testid="finish-button"]');
    this.skipButton = page.locator('button:has-text("Skip"), [data-testid="skip-button"]');

    // Question indicators
    this.questionIndicators = page.locator('[data-testid="question-indicators"], .question-indicators');
    this.currentQuestionIndicator = page.locator('[data-testid="current-question"], .current-question, .active');
    this.answeredQuestionIndicator = page.locator('[data-testid="answered-question"], .answered-question, .completed');

    // Quiz info
    this.quizMetadata = page.locator('[data-testid="quiz-metadata"], .quiz-metadata');
    this.questionCount = page.locator('[data-testid="question-count"], .question-count');
    this.difficultyLevel = page.locator('[data-testid="difficulty-level"], .difficulty-level');
    this.subject = page.locator('[data-testid="subject"], .subject');

    // States
    this.errorMessage = page.locator('[data-testid="error-message"], .error-message, .text-red-500');
    this.loadingSpinner = page.locator('[data-testid="loading"], .loading, .spinner');
    this.noQuestionsMessage = page.locator('[data-testid="no-questions"], text="No questions available"');

    // Mobile
    this.mobileProgressIndicator = page.locator('[data-testid="mobile-progress"], .mobile-progress');
    this.mobileQuestionNumber = page.locator('[data-testid="mobile-question-number"], .mobile-question-number');
  }

  /**
   * Navigate to take quiz page
   */
  async goto() {
    await super.goto('/take-quiz');
    await this.waitForQuizLoad();
  }

  /**
   * Wait for quiz to load completely
   */
  async waitForQuizLoad() {
    // Wait for either question content or no questions message
    try {
      await Promise.race([
        this.waitForVisible(this.questionText),
        this.waitForVisible(this.noQuestionsMessage)
      ]);
      await this.waitForNoLoading();
    } catch {
      // If neither appears, might be an error state
      await this.waitForVisible(this.errorMessage);
    }
  }

  /**
   * Verify quiz page is loaded with questions
   */
  async verifyQuizLoaded(expectedQuestionCount?: number) {
    await expect(this.questionText).toBeVisible();
    await expect(this.answerOptions).toHaveCountGreaterThan(0);
    
    if (expectedQuestionCount) {
      // Verify question count if indicators are visible
      const hasIndicators = await this.questionIndicators.isVisible().catch(() => false);
      if (hasIndicators) {
        await expect(this.questionIndicators.locator('.question-dot, .indicator')).toHaveCount(expectedQuestionCount);
      }
    }
  }

  /**
   * Verify no questions available state
   */
  async verifyNoQuestions() {
    await expect(this.noQuestionsMessage).toBeVisible();
    await expect(this.questionText).toBeHidden();
  }

  /**
   * Get current question number
   */
  async getCurrentQuestionNumber(): Promise<number> {
    const questionNumberText = await this.questionNumber.textContent();
    const match = questionNumberText?.match(/\d+/);
    return match ? parseInt(match[0]) : 1;
  }

  /**
   * Get total question count
   */
  async getTotalQuestionCount(): Promise<number> {
    const progressText = await this.progressText.textContent();
    const match = progressText?.match(/of (\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  /**
   * Select an answer option
   */
  async selectAnswer(optionIndex: number) {
    const option = this.answerOption(optionIndex);
    await expect(option).toBeVisible();
    
    // Handle both radio buttons and clickable elements
    const inputElement = option.locator('input').first();
    const isInput = await inputElement.isVisible().catch(() => false);
    
    if (isInput) {
      await inputElement.click();
      await expect(inputElement).toBeChecked();
    } else {
      await option.click();
      // Verify selection state
      await expect(option).toHaveClass(/selected|checked|active/);
    }
  }

  /**
   * Select multiple answers (for multi-select questions)
   */
  async selectMultipleAnswers(optionIndices: number[]) {
    for (const index of optionIndices) {
      await this.selectAnswer(index);
    }
  }

  /**
   * Get selected answer indices
   */
  async getSelectedAnswers(): Promise<number[]> {
    const selectedIndices: number[] = [];
    const optionCount = await this.answerOptions.count();
    
    for (let i = 0; i < optionCount; i++) {
      const option = this.answerOption(i);
      const inputElement = option.locator('input').first();
      const isInput = await inputElement.isVisible().catch(() => false);
      
      let isSelected = false;
      if (isInput) {
        isSelected = await inputElement.isChecked();
      } else {
        const className = await option.getAttribute('class') || '';
        isSelected = /selected|checked|active/.test(className);
      }
      
      if (isSelected) {
        selectedIndices.push(i);
      }
    }
    
    return selectedIndices;
  }

  /**
   * Go to next question
   */
  async goToNextQuestion() {
    const currentQuestion = await this.getCurrentQuestionNumber();
    await this.nextButton.click();
    
    // Wait for question to change
    await this.page.waitForFunction(
      (expectedNext) => {
        const questionElement = document.querySelector('[data-testid="question-number"], .question-number');
        if (!questionElement) return false;
        const current = questionElement.textContent?.match(/\d+/);
        return current && parseInt(current[0]) === expectedNext;
      },
      currentQuestion + 1
    );
  }

  /**
   * Go to previous question
   */
  async goToPreviousQuestion() {
    const currentQuestion = await this.getCurrentQuestionNumber();
    await this.previousButton.click();
    
    // Wait for question to change
    await this.page.waitForFunction(
      (expectedPrev) => {
        const questionElement = document.querySelector('[data-testid="question-number"], .question-number');
        if (!questionElement) return false;
        const current = questionElement.textContent?.match(/\d+/);
        return current && parseInt(current[0]) === expectedPrev;
      },
      currentQuestion - 1
    );
  }

  /**
   * Skip current question
   */
  async skipQuestion() {
    if (await this.skipButton.isVisible()) {
      await this.skipButton.click();
    } else {
      // If no skip button, just go to next without answering
      await this.goToNextQuestion();
    }
  }

  /**
   * Finish the quiz
   */
  async finishQuiz() {
    await expect(this.finishButton).toBeVisible();
    await this.finishButton.click();
    
    // Should navigate to results page
    await this.verifyPath('/quiz-results');
  }

  /**
   * Answer a question and move to next
   */
  async answerAndProceed(optionIndex: number, isLastQuestion: boolean = false) {
    await this.selectAnswer(optionIndex);
    
    if (isLastQuestion) {
      await this.finishQuiz();
    } else {
      await this.goToNextQuestion();
    }
  }

  /**
   * Complete entire quiz with given answers
   */
  async completeQuiz(answers: number[]) {
    const totalQuestions = await this.getTotalQuestionCount();
    
    for (let i = 0; i < Math.min(answers.length, totalQuestions); i++) {
      const isLastQuestion = i === totalQuestions - 1;
      await this.answerAndProceed(answers[i], isLastQuestion);
    }
  }

  /**
   * Complete quiz with multiple-choice answers
   */
  async completeQuizWithMultipleAnswers(answers: number[][]) {
    const totalQuestions = await this.getTotalQuestionCount();
    
    for (let i = 0; i < Math.min(answers.length, totalQuestions); i++) {
      await this.selectMultipleAnswers(answers[i]);
      
      const isLastQuestion = i === totalQuestions - 1;
      if (isLastQuestion) {
        await this.finishQuiz();
      } else {
        await this.goToNextQuestion();
      }
    }
  }

  /**
   * Verify progress bar
   */
  async verifyProgress(expectedProgress: number) {
    const progressElement = this.progressBar;
    
    if (await progressElement.isVisible()) {
      // Check progress value (could be aria-valuenow, value, or style)
      const ariaValue = await progressElement.getAttribute('aria-valuenow');
      const value = await progressElement.getAttribute('value');
      
      if (ariaValue) {
        expect(parseInt(ariaValue)).toBe(expectedProgress);
      } else if (value) {
        expect(parseInt(value)).toBe(expectedProgress);
      }
    }
  }

  /**
   * Verify question content
   */
  async verifyQuestionContent(expectedContent: {
    questionText?: string;
    optionCount?: number;
    questionNumber?: number;
  }) {
    if (expectedContent.questionText) {
      await expect(this.questionText).toContainText(expectedContent.questionText);
    }
    
    if (expectedContent.optionCount) {
      await expect(this.answerOptions).toHaveCount(expectedContent.optionCount);
    }
    
    if (expectedContent.questionNumber) {
      const currentQ = await this.getCurrentQuestionNumber();
      expect(currentQ).toBe(expectedContent.questionNumber);
    }
  }

  /**
   * Verify navigation buttons state
   */
  async verifyNavigationButtons(expected: {
    previousEnabled?: boolean;
    nextEnabled?: boolean;
    finishVisible?: boolean;
  }) {
    if (expected.previousEnabled !== undefined) {
      if (expected.previousEnabled) {
        await expect(this.previousButton).toBeEnabled();
      } else {
        await expect(this.previousButton).toBeDisabled();
      }
    }
    
    if (expected.nextEnabled !== undefined) {
      if (expected.nextEnabled) {
        await expect(this.nextButton).toBeEnabled();
      } else {
        await expect(this.nextButton).toBeDisabled();
      }
    }
    
    if (expected.finishVisible !== undefined) {
      if (expected.finishVisible) {
        await expect(this.finishButton).toBeVisible();
      } else {
        await expect(this.finishButton).toBeHidden();
      }
    }
  }

  /**
   * Test keyboard navigation
   */
  async testKeyboardNavigation() {
    // Test arrow key navigation between options
    const firstOption = this.answerOption(0);
    await firstOption.focus();
    await expect(firstOption).toBeFocused();
    
    await this.page.keyboard.press('ArrowDown');
    await expect(this.answerOption(1)).toBeFocused();
    
    // Test spacebar selection
    await this.page.keyboard.press('Space');
    const selectedAnswers = await this.getSelectedAnswers();
    expect(selectedAnswers).toContain(1);
  }

  /**
   * Verify mobile responsive layout
   */
  async verifyMobileLayout() {
    const isMobileView = await this.isMobile();
    
    if (isMobileView) {
      // Mobile-specific elements should be visible
      if (await this.mobileProgressIndicator.isVisible().catch(() => false)) {
        await expect(this.mobileProgressIndicator).toBeVisible();
      }
      
      // Question layout should be mobile-optimized
      await expect(this.questionContainer).toBeVisible();
    }
  }

  /**
   * Verify quiz metadata
   */
  async verifyQuizMetadata(expected: {
    subject?: string;
    level?: string;
    questionCount?: number;
  }) {
    if (expected.subject) {
      await expect(this.subject).toContainText(expected.subject);
    }
    
    if (expected.level) {
      await expect(this.difficultyLevel).toContainText(expected.level);
    }
    
    if (expected.questionCount) {
      const total = await this.getTotalQuestionCount();
      expect(total).toBe(expected.questionCount);
    }
  }

  /**
   * Handle quiz timeout or errors
   */
  async handleQuizError() {
    if (await this.errorMessage.isVisible()) {
      const errorText = await this.errorMessage.textContent();
      console.log('Quiz error:', errorText);
      return false;
    }
    return true;
  }

  /**
   * Clear current selection
   */
  async clearSelection() {
    const selectedAnswers = await this.getSelectedAnswers();
    for (const index of selectedAnswers) {
      await this.answerOption(index).click();
    }
  }
}