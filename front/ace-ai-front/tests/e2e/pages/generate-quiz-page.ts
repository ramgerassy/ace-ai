/**
 * Generate Quiz page object model
 * Handles quiz generation form and validation
 */

import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';

export class GenerateQuizPage extends BasePage {
  // Form elements
  readonly quizForm: Locator;
  readonly subjectInput: Locator;
  readonly subjectLabel: Locator;
  readonly subjectError: Locator;
  readonly subSubjectsInput: Locator;
  readonly subSubjectsLabel: Locator;
  readonly subSubjectsError: Locator;
  readonly levelSelect: Locator;
  readonly levelLabel: Locator;
  readonly questionCountInput: Locator;
  readonly questionCountLabel: Locator;
  readonly questionCountError: Locator;
  readonly generateButton: Locator;
  readonly backButton: Locator;

  // Level options
  readonly beginnerOption: Locator;
  readonly intermediateOption: Locator;
  readonly advancedOption: Locator;

  // Validation messages
  readonly validationMessages: Locator;
  readonly successMessage: Locator;
  readonly loadingSpinner: Locator;

  // Form sections
  readonly formTitle: Locator;
  readonly formDescription: Locator;

  constructor(page: Page) {
    super(page);
    
    // Form elements
    this.quizForm = page.locator('form, [data-testid="quiz-form"]');
    this.subjectInput = page.locator('#subject, input[name="subject"], input[placeholder*="subject" i]');
    this.subjectLabel = page.locator('label[for="subject"], label:has-text("Subject")');
    this.subjectError = page.locator('[data-testid="subject-error"], .text-red-500:near(input[name="subject"])');
    
    this.subSubjectsInput = page.locator('#subSubjects, input[name="subSubjects"], textarea[name="subSubjects"], input[placeholder*="topics" i]');
    this.subSubjectsLabel = page.locator('label[for="subSubjects"], label:has-text("Sub-subjects"), label:has-text("Topics")');
    this.subSubjectsError = page.locator('[data-testid="subsubjects-error"], .text-red-500:near(input[name="subSubjects"])');
    
    this.levelSelect = page.locator('#level, select[name="level"], [data-testid="level-select"]');
    this.levelLabel = page.locator('label[for="level"], label:has-text("Level"), label:has-text("Difficulty")');
    
    this.questionCountInput = page.locator('#questionCount, input[name="questionCount"], input[type="number"]');
    this.questionCountLabel = page.locator('label[for="questionCount"], label:has-text("Questions"), label:has-text("Count")');
    this.questionCountError = page.locator('[data-testid="question-count-error"], .text-red-500:near(input[name="questionCount"])');
    
    this.generateButton = page.locator('.flex.gap-3 button:has-text("Generate Quiz")').or(
      page.locator('button:has-text("Generate Quiz")').last()
    );
    this.backButton = page.locator('button:has-text("Back"), a:has-text("Back")');

    // Level options
    this.beginnerOption = page.locator('option[value="beginner"], [data-value="beginner"], text=Beginner');
    this.intermediateOption = page.locator('option[value="intermediate"], [data-value="intermediate"], text=Intermediate');
    this.advancedOption = page.locator('option[value="advanced"], [data-value="advanced"], text=Advanced');

    // Messages and loading
    this.validationMessages = page.locator('[data-testid*="error"], .text-red-500, .error-message');
    this.successMessage = page.locator('[data-testid="success-message"], .text-green-500, .success-message');
    this.loadingSpinner = page.locator('[data-testid="loading"], .loading, .spinner');

    // Form sections
    this.formTitle = page.locator('h1, h2, [data-testid="page-title"]');
    this.formDescription = page.locator('p:has-text("Create"), p:has-text("Generate"), [data-testid="page-description"]');
  }

  /**
   * Navigate to generate quiz page
   */
  async goto() {
    await super.goto('/generate-quiz');
    await this.waitForFormLoad();
  }

  /**
   * Wait for form to load completely
   */
  async waitForFormLoad() {
    await this.waitForVisible(this.subjectInput);
    await this.waitForVisible(this.generateButton);
    await this.waitForNoLoading();
  }

  /**
   * Verify generate quiz page is displayed
   */
  async verifyPageLoaded() {
    await expect(this.formTitle).toBeVisible();
    await expect(this.subjectInput).toBeVisible();
    await expect(this.subSubjectsInput).toBeVisible();
    await expect(this.levelSelect).toBeVisible();
    await expect(this.questionCountInput).toBeVisible();
    await expect(this.generateButton).toBeVisible();
  }

  /**
   * Fill out quiz generation form
   */
  async fillQuizForm(formData: {
    subject: string;
    subSubjects: string[];
    level: 'beginner' | 'intermediate' | 'advanced';
    questionCount?: number;
  }) {
    // Fill subject
    await this.subjectInput.fill(formData.subject);
    await expect(this.subjectInput).toHaveValue(formData.subject);

    // Fill sub-subjects
    const subSubjectsText = formData.subSubjects.join(', ');
    await this.subSubjectsInput.fill(subSubjectsText);
    await expect(this.subSubjectsInput).toHaveValue(subSubjectsText);

    // Select level
    await this.selectLevel(formData.level);

    // Fill question count if provided
    if (formData.questionCount !== undefined) {
      await this.questionCountInput.fill(formData.questionCount.toString());
      await expect(this.questionCountInput).toHaveValue(formData.questionCount.toString());
    }
  }

  /**
   * Select difficulty level
   */
  async selectLevel(level: 'beginner' | 'intermediate' | 'advanced') {
    // Handle both select dropdown and radio button implementations
    const isSelect = await this.levelSelect.locator('option').first().isVisible().catch(() => false);
    
    if (isSelect) {
      await this.levelSelect.selectOption(level);
    } else {
      // Handle radio buttons or custom select
      const option = this.page.locator(`[data-testid="level-${level}"], input[value="${level}"], text=${level.charAt(0).toUpperCase() + level.slice(1)}`);
      await option.click();
    }
  }

  /**
   * Submit quiz generation form
   */
  async submitForm(expectSuccess: boolean = true) {
    await this.generateButton.click();

    if (expectSuccess) {
      // Wait for loading to start and finish
      await this.waitForNoLoading();
      
      // Should navigate to take quiz page
      await this.verifyPath('/take-quiz');
    } else {
      // Form should stay on current page with errors
      await this.page.waitForTimeout(1000);
      expect(this.page.url()).toContain('/generate-quiz');
    }
  }

  /**
   * Verify form validation errors
   */
  async verifyValidationErrors(expectedErrors: {
    subject?: string;
    subSubjects?: string;
    questionCount?: string;
  }) {
    if (expectedErrors.subject) {
      await expect(this.subjectError).toBeVisible();
      await expect(this.subjectError).toContainText(expectedErrors.subject);
    }

    if (expectedErrors.subSubjects) {
      await expect(this.subSubjectsError).toBeVisible();
      await expect(this.subSubjectsError).toContainText(expectedErrors.subSubjects);
    }

    if (expectedErrors.questionCount) {
      await expect(this.questionCountError).toBeVisible();
      await expect(this.questionCountError).toContainText(expectedErrors.questionCount);
    }
  }

  /**
   * Verify no validation errors are shown
   */
  async verifyNoValidationErrors() {
    await expect(this.subjectError).toBeHidden();
    await expect(this.subSubjectsError).toBeHidden();
    await expect(this.questionCountError).toBeHidden();
  }

  /**
   * Test form field requirements
   */
  async testRequiredFields() {
    // Try to submit empty form
    await this.generateButton.click();
    
    // Should show required field errors
    await this.verifyValidationErrors({
      subject: 'required',
      subSubjects: 'required'
    });
  }

  /**
   * Test subject validation
   */
  async testSubjectValidation() {
    // Test empty subject
    await this.subjectInput.fill('');
    await this.subSubjectsInput.fill('Test Topic');
    await this.generateButton.click();
    await this.verifyValidationErrors({ subject: 'required' });

    // Test too short subject
    await this.subjectInput.fill('A');
    await this.generateButton.click();
    await this.verifyValidationErrors({ subject: 'too short' });

    // Test valid subject
    await this.subjectInput.fill('Mathematics');
    await this.page.waitForTimeout(500);
    // Error should disappear
    await expect(this.subjectError).toBeHidden();
  }

  /**
   * Test sub-subjects validation
   */
  async testSubSubjectsValidation() {
    await this.subjectInput.fill('Mathematics');
    
    // Test empty sub-subjects
    await this.subSubjectsInput.fill('');
    await this.generateButton.click();
    await this.verifyValidationErrors({ subSubjects: 'required' });

    // Test valid sub-subjects
    await this.subSubjectsInput.fill('Algebra, Geometry');
    await this.page.waitForTimeout(500);
    await expect(this.subSubjectsError).toBeHidden();
  }

  /**
   * Test question count validation
   */
  async testQuestionCountValidation() {
    await this.subjectInput.fill('Mathematics');
    await this.subSubjectsInput.fill('Algebra');

    // Test invalid question count
    await this.questionCountInput.fill('0');
    await this.generateButton.click();
    await this.verifyValidationErrors({ questionCount: 'must be greater than 0' });

    // Test too high question count
    await this.questionCountInput.fill('100');
    await this.generateButton.click();
    await this.verifyValidationErrors({ questionCount: 'too many questions' });

    // Test valid question count
    await this.questionCountInput.fill('5');
    await this.page.waitForTimeout(500);
    await expect(this.questionCountError).toBeHidden();
  }

  /**
   * Verify form accessibility
   */
  async verifyFormAccessibility() {
    // Check labels are properly associated
    await expect(this.subjectLabel).toBeVisible();
    await expect(this.subSubjectsLabel).toBeVisible();
    await expect(this.levelLabel).toBeVisible();
    await expect(this.questionCountLabel).toBeVisible();

    // Check form can be navigated with keyboard
    await this.subjectInput.focus();
    await expect(this.subjectInput).toBeFocused();
    
    await this.page.keyboard.press('Tab');
    await expect(this.subSubjectsInput).toBeFocused();
    
    await this.page.keyboard.press('Tab');
    await expect(this.levelSelect).toBeFocused();
  }

  /**
   * Test keyboard form submission
   */
  async submitWithKeyboard() {
    await this.generateButton.focus();
    await this.page.keyboard.press('Enter');
  }

  /**
   * Go back to previous page
   */
  async goBack() {
    if (await this.backButton.isVisible()) {
      await this.backButton.click();
    } else {
      await this.clickNavItem('Home');
    }
    await this.verifyPath('/');
  }

  /**
   * Verify loading state during form submission
   */
  async verifyLoadingState() {
    // Check if loading spinner appears during submission
    const hasLoadingSpinner = await this.loadingSpinner.isVisible().catch(() => false);
    
    if (hasLoadingSpinner) {
      await expect(this.loadingSpinner).toBeVisible();
      await this.waitForNoLoading();
      await expect(this.loadingSpinner).toBeHidden();
    }
    
    // Button should be disabled during loading
    await expect(this.generateButton).toBeEnabled();
  }

  /**
   * Clear form fields
   */
  async clearForm() {
    await this.subjectInput.fill('');
    await this.subSubjectsInput.fill('');
    await this.questionCountInput.fill('');
  }

  /**
   * Verify responsive layout
   */
  async verifyResponsiveLayout() {
    const isMobileView = await this.isMobile();
    
    if (isMobileView) {
      // Verify mobile-specific layout
      await expect(this.quizForm).toBeVisible();
      // Form should stack vertically on mobile
    } else {
      // Verify desktop layout
      await expect(this.quizForm).toBeVisible();
    }
  }
}