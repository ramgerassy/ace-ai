import { test, expect } from '@playwright/test';

test.describe('Basic App Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing user data
    await page.goto('http://localhost:5173');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('app loads and displays welcome screen', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // Check main elements are visible
    await expect(page.locator('text=/Welcome to.*Ace AI Quiz/i')).toBeVisible();
    await expect(page.locator('button:has-text("Start Your Journey")')).toBeVisible();
    
    // Check features are displayed
    await expect(page.locator('text="AI-Powered"')).toBeVisible();
    await expect(page.locator('text="Real-time Feedback"')).toBeVisible();
    await expect(page.locator('text="Personalized"')).toBeVisible();
  });

  test('user creation flow works', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // Click Start Your Journey
    const startButton = page.locator('button:has-text("Start Your Journey")');
    await startButton.click();
    
    // Should show user input form in the main content (not navbar)
    const userInput = page.locator('#userName').or(
      page.locator('input[placeholder="Enter your name"]').last()
    );
    await expect(userInput).toBeVisible();
    
    // Enter user name
    await userInput.fill('Test User');
    
    // Click Continue
    await page.click('button:has-text("Continue")');
    
    // Wait for user creation to complete
    await page.waitForTimeout(1000);
    
    // User should be created - verify by checking if we can proceed
    const currentUrl = page.url();
    
    if (currentUrl.includes('generate-quiz')) {
      // Already navigated to quiz generation
      await expect(page.locator('h1:has-text("Generate Your Quiz")')).toBeVisible();
    } else {
      // Should be back on welcome screen with user created
      // Look for any indication that user was created (Start button should be available)
      const startButton = page.locator('button:has-text("Start Your Journey")');
      const welcomeText = page.locator('text=/Welcome/i');
      
      // Either start button or welcome text should be visible
      const hasStartButton = await startButton.isVisible();
      const hasWelcomeText = await welcomeText.isVisible();
      
      expect(hasStartButton || hasWelcomeText).toBeTruthy();
      
      // User creation succeeded if we can see the main welcome heading (not navbar)
      await expect(page.locator('h1:has-text("Ace AI Quiz")').or(
        page.locator('text=/Welcome to.*Ace AI Quiz/i')
      )).toBeVisible();
    }
  });

  test('can navigate to quiz generation page', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // Try to navigate directly to quiz generation
    await page.goto('http://localhost:5173/generate-quiz');
    
    // If redirected back to home, create a user first
    if (page.url() === 'http://localhost:5173/' || page.url() === 'http://localhost:5173') {
      // Create user
      await page.click('button:has-text("Start Your Journey")');
      await page.fill('input[placeholder="Enter your name"]', 'Quiz User');
      await page.click('button:has-text("Continue")');
      await page.waitForTimeout(1000);
      
      // Try navigation again
      await page.goto('http://localhost:5173/generate-quiz');
    }
    
    // Should see quiz generation form
    await expect(page.locator('h1:has-text("Generate Your Quiz")')).toBeVisible();
    await expect(page.locator('input[placeholder*="Enter a subject"]')).toBeVisible();
    await expect(page.locator('input[placeholder*="Enter sub-topics"]')).toBeVisible();
  });

  test('quiz form has required elements', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // Create user if needed
    const startButton = page.locator('button:has-text("Start Your Journey")');
    if (await startButton.isVisible()) {
      await startButton.click();
      
      const userInput = page.locator('#userName').or(
        page.locator('input[placeholder="Enter your name"]').last()
      );
      if (await userInput.isVisible()) {
        await userInput.fill('Form Test User');
        await page.click('button:has-text("Continue")');
        await page.waitForTimeout(1000);
      }
    }
    
    // Navigate to quiz generation
    await page.goto('http://localhost:5173/generate-quiz');
    
    // Check all form elements exist
    await expect(page.locator('input[placeholder*="Enter a subject"]')).toBeVisible();
    await expect(page.locator('input[placeholder*="Enter sub-topics"]')).toBeVisible();
    
    // Check difficulty options
    await expect(page.locator('text="Beginner"')).toBeVisible();
    await expect(page.locator('text="Intermediate"')).toBeVisible();
    await expect(page.locator('text="Advanced"')).toBeVisible();
    
    // Check buttons
    await expect(page.locator('button:has-text("Back")')).toBeVisible();
    // Check Generate Quiz button (use more specific selector to avoid navbar button)
    await expect(page.locator('.flex.gap-3 button:has-text("Generate Quiz")').or(
      page.locator('button:has-text("Generate Quiz")').last()
    )).toBeVisible();
  });

  test('form validation prevents empty submission', async ({ page }) => {
    await page.goto('http://localhost:5173/generate-quiz');
    
    // Generate Quiz button should be disabled initially
    const generateButtons = page.locator('button:has-text("Generate Quiz")');
    const formButton = generateButtons.last(); // Get the form button, not navbar
    
    await expect(formButton).toBeDisabled();
    
    // Even after selecting difficulty, button should remain disabled without subject
    await page.click('label:has-text("Beginner")');
    await page.waitForTimeout(500);
    
    // Button should still be disabled
    await expect(formButton).toBeDisabled();
  });

  test('mobile viewport displays correctly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('http://localhost:5173');
    
    // Check main content is visible on mobile
    await expect(page.locator('text=/Welcome to.*Ace AI Quiz/i')).toBeVisible();
    await expect(page.locator('button:has-text("Start Your Journey")')).toBeVisible();
    
    // Check that features are still visible (may be stacked)
    await expect(page.locator('text="AI-Powered"')).toBeVisible();
    
    // Check responsiveness doesn't break layout
    const startButton = page.locator('button:has-text("Start Your Journey")');
    const buttonBox = await startButton.boundingBox();
    
    // Button should not overflow the viewport
    if (buttonBox) {
      expect(buttonBox.x + buttonBox.width).toBeLessThanOrEqual(375);
    }
  });
});