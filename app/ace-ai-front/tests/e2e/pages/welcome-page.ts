/**
 * Welcome/Home page object model
 * Handles user authentication and initial app entry
 */

import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';

export class WelcomePage extends BasePage {
  // Main elements
  readonly welcomeTitle: Locator;
  readonly welcomeDescription: Locator;
  readonly startJourneyButton: Locator;
  readonly continueButton: Locator;

  // User input elements
  readonly userNameInput: Locator;
  readonly userNameLabel: Locator;
  readonly userError: Locator;

  // Feature cards
  readonly featureCards: Locator;
  readonly aiPoweredFeature: Locator;
  readonly realtimeFeedbackFeature: Locator;
  readonly personalizedFeature: Locator;

  // App branding
  readonly appIcon: Locator;
  readonly footer: Locator;

  constructor(page: Page) {
    super(page);
    
    // Main elements
    this.welcomeTitle = page.locator('h1');
    this.welcomeDescription = page.locator('text=Master any subject with personalized AI-powered quizzes');
    this.startJourneyButton = page.locator('button:has-text("Start Your Journey")');
    this.continueButton = page.locator('button:has-text("Continue")');

    // User input
    this.userNameInput = page.locator('#userName').or(page.locator('input[placeholder="Enter your name"]'));
    this.userNameLabel = page.locator('label[for="userName"]');
    this.userError = page.locator('text=/error|Error/').or(page.locator('.text-red-500'));

    // Feature cards
    this.featureCards = page.locator('[role="button"]:has-text("AI-Powered"), [role="button"]:has-text("Real-time Feedback"), [role="button"]:has-text("Personalized")');
    this.aiPoweredFeature = page.locator('[role="button"]:has-text("AI-Powered")');
    this.realtimeFeedbackFeature = page.locator('[role="button"]:has-text("Real-time Feedback")');
    this.personalizedFeature = page.locator('[role="button"]:has-text("Personalized")');

    // App branding
    this.appIcon = page.locator('text=🎓');
    this.footer = page.locator('footer');
  }

  /**
   * Navigate to welcome page
   */
  async goto() {
    await super.goto('/');
    await this.waitForWelcomePageLoad();
  }

  /**
   * Wait for welcome page specific elements to load
   */
  async waitForWelcomePageLoad() {
    await this.waitForVisible(this.welcomeTitle);
    await this.waitForVisible(this.appIcon);
    // Wait for animations to complete
    await this.page.waitForTimeout(1000);
  }

  /**
   * Verify welcome page is displayed correctly for new user
   */
  async verifyNewUserWelcome() {
    await expect(this.welcomeTitle).toContainText('Welcome to');
    await expect(this.welcomeTitle).toContainText('Ace AI Quiz');
    await expect(this.welcomeDescription).toBeVisible();
    await expect(this.startJourneyButton).toBeVisible();
  }

  /**
   * Verify welcome page is displayed correctly for returning user
   */
  async verifyReturningUserWelcome(userName: string) {
    await expect(this.welcomeTitle).toContainText('Welcome back');
    await expect(this.welcomeTitle).toContainText(userName);
    await expect(this.startJourneyButton).toBeVisible();
  }

  /**
   * Verify feature cards are displayed
   */
  async verifyFeatureCards() {
    await expect(this.featureCards).toHaveCount(3);
    await expect(this.aiPoweredFeature).toBeVisible();
    await expect(this.realtimeFeedbackFeature).toBeVisible();
    await expect(this.personalizedFeature).toBeVisible();
    
    // Verify feature card content
    await expect(this.aiPoweredFeature).toContainText('Intelligent questions adapted to your level');
    await expect(this.realtimeFeedbackFeature).toContainText('Get instant insights on your performance');
    await expect(this.personalizedFeature).toContainText('Tailored content for your learning goals');
  }

  /**
   * Create a new user
   */
  async createUser(userName: string, expectSuccess: boolean = true) {
    // Check if user input is already visible
    const isInputVisible = await this.userNameInput.isVisible();
    
    if (!isInputVisible) {
      // Click start journey to trigger user input form
      await this.startJourneyButton.click();
      await this.waitForVisible(this.userNameInput);
    }

    // Fill in user name
    await this.userNameInput.fill(userName);
    await expect(this.userNameInput).toHaveValue(userName);
    
    // Submit form
    await this.continueButton.click();

    if (expectSuccess) {
      // Wait for success - input form should disappear
      await this.waitForHidden(this.userNameInput);
      await this.verifyReturningUserWelcome(userName);
    } else {
      // Error should be displayed
      await this.waitForVisible(this.userError);
    }
  }

  /**
   * Create user using Enter key
   */
  async createUserWithEnter(userName: string) {
    const isInputVisible = await this.userNameInput.isVisible();
    
    if (!isInputVisible) {
      await this.startJourneyButton.click();
      await this.waitForVisible(this.userNameInput);
    }

    await this.userNameInput.fill(userName);
    await this.userNameInput.press('Enter');
    
    // Wait for success
    await this.waitForHidden(this.userNameInput);
    await this.verifyReturningUserWelcome(userName);
  }

  /**
   * Verify user input form is displayed
   */
  async verifyUserInputForm() {
    await expect(this.userNameInput).toBeVisible();
    await expect(this.userNameLabel).toContainText("What's your name?");
    await expect(this.continueButton).toBeVisible();
    await expect(this.userNameInput).toHaveAttribute('placeholder', 'Enter your name');
  }

  /**
   * Verify error message for user creation
   */
  async verifyUserCreationError(expectedError: string) {
    await expect(this.userError).toBeVisible();
    await expect(this.userError).toContainText(expectedError);
  }

  /**
   * Start quiz journey (for authenticated user)
   */
  async startQuiz() {
    await this.startJourneyButton.click();
    // Should navigate to generate quiz page
    await this.verifyPath('/generate-quiz');
  }

  /**
   * Try to start quiz without authentication
   */
  async tryStartQuizUnauthenticated() {
    await this.startJourneyButton.click();
    // Should show user input form instead of navigating
    await this.verifyUserInputForm();
  }

  /**
   * Verify responsive layout
   */
  async verifyResponsiveLayout() {
    const isMobileView = await this.isMobile();
    
    if (isMobileView) {
      // Verify mobile-specific layout elements
      await expect(this.welcomeTitle).toHaveCSS('text-align', 'center');
      await expect(this.featureCards).toBeVisible();
    } else {
      // Verify desktop layout
      await expect(this.welcomeTitle).toBeVisible();
      await expect(this.featureCards).toBeVisible();
    }
  }

  /**
   * Verify footer content
   */
  async verifyFooter() {
    await expect(this.footer).toBeVisible();
    await expect(this.footer).toContainText('Ready to challenge yourself?');
  }

  /**
   * Verify app icon and animations
   */
  async verifyAppBranding() {
    await expect(this.appIcon).toBeVisible();
    
    // Check that animations have completed by waiting for stable state
    await this.page.waitForTimeout(1500); // Allow time for animations
    
    // Verify icon is clickable/interactive
    const iconContainer = this.appIcon.locator('..');
    await expect(iconContainer).toBeVisible();
  }

  /**
   * Test keyboard navigation
   */
  async testKeyboardNavigation() {
    // Focus on the start button and activate with keyboard
    await this.startJourneyButton.focus();
    await expect(this.startJourneyButton).toBeFocused();
    
    // Navigate to feature cards with tab
    await this.page.keyboard.press('Tab');
    await this.page.keyboard.press('Tab');
    
    // Should be on first feature card
    await expect(this.aiPoweredFeature).toBeFocused();
  }

  /**
   * Clear any existing user data
   */
  async clearUserData() {
    await this.clearStorage();
    await this.page.reload();
    await this.waitForWelcomePageLoad();
  }

  /**
   * Verify accessibility features
   */
  async verifyAccessibility() {
    // Check for proper ARIA labels and roles
    await expect(this.userNameInput).toHaveAttribute('type', 'text');
    
    if (await this.userNameLabel.isVisible()) {
      await expect(this.userNameLabel).toHaveAttribute('for', 'userName');
    }
    
    // Verify feature cards have proper accessibility attributes
    const featureCardCount = await this.featureCards.count();
    for (let i = 0; i < featureCardCount; i++) {
      const card = this.featureCards.nth(i);
      await expect(card).toHaveAttribute('role', 'button');
      await expect(card).toHaveAttribute('tabIndex', '0');
    }
  }
}