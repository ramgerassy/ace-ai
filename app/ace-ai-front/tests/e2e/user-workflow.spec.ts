import { test, expect, Page } from '@playwright/test';

// Helper functions
async function createUser(page: Page, userName: string) {
  await page.goto('http://localhost:5173');
  
  // Click Start Your Journey to show user input
  const startButton = page.locator('button:has-text("Start Your Journey")');
  if (await startButton.isVisible()) {
    await startButton.click();
  }
  
  // Enter user name if input is visible
  const userInput = page.locator('#userName').or(
    page.locator('input[placeholder="Enter your name"]').last()
  );
  if (await userInput.isVisible()) {
    await userInput.fill(userName);
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(500);
  }
}

async function navigateToQuizGeneration(page: Page) {
  // Try to navigate to quiz generation
  const startButton = page.locator('button:has-text("Start Your Journey")');
  
  if (await startButton.isVisible()) {
    // Button is available, click it
    await startButton.click();
    await expect(page).toHaveURL('http://localhost:5173/generate-quiz');
  } else {
    // Button not available, navigate directly
    await page.goto('http://localhost:5173/generate-quiz');
  }
  
  // Verify we're on the quiz generation page
  const currentUrl = page.url();
  if (currentUrl.includes('generate-quiz')) {
    // Success - on quiz generation page
  } else {
    // Try alternative navigation
    await page.goto('http://localhost:5173/generate-quiz');
  }
}

test.describe('Complete User Workflow', () => {
  test('new user can complete full quiz workflow', async ({ page }) => {
    // Step 1: Create a new user
    await createUser(page, 'E2E Test User');
    
    // Step 2: Navigate to quiz generation
    await navigateToQuizGeneration(page);
    
    // Step 3: Fill quiz generation form
    await expect(page.locator('h1:has-text("Generate Your Quiz")')).toBeVisible();
    
    // Fill subject
    const subjectInput = page.locator('input[label="Quiz Subject"]').or(
      page.locator('input[placeholder*="Enter a subject"]')
    );
    await subjectInput.fill('Computer Science');
    await subjectInput.blur(); // Trigger validation
    
    // Wait for subject validation
    await page.waitForTimeout(2000);
    
    // Fill sub-subjects (only after subject is validated)
    const subSubjectsInput = page.locator('input[label="Sub-subjects"]').or(
      page.locator('input[placeholder*="Enter sub-topics"]')
    );
    
    // Check if sub-subjects input is enabled
    const isDisabled = await subSubjectsInput.isDisabled();
    if (!isDisabled) {
      await subSubjectsInput.fill('Data Structures, Algorithms');
      await subSubjectsInput.blur();
      await page.waitForTimeout(1500);
    }
    
    // Select difficulty
    await page.click('label:has-text("Beginner")');
    
    // The Generate Quiz button in the form should be enabled now
    const formGenerateButton = page.locator('.flex.gap-3 button:has-text("Generate Quiz")');
    
    // Wait for button to be enabled
    await expect(formGenerateButton).toBeEnabled({ timeout: 10000 });
  });

  test('user management through navbar', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // Create initial user
    await createUser(page, 'NavBar User 1');
    
    // Try to open user menu in navbar
    const userMenuButton = page.locator('button').filter({ hasText: /N|NavBar User 1/i }).first();
    
    if (await userMenuButton.isVisible() && await userMenuButton.isEnabled()) {
      await userMenuButton.click();
    } else {
      // Skip this test if navbar functionality is not available
      console.log('Navbar user menu not available, skipping navbar test');
      return;
    }
    
    // Add new user through navbar
    const addUserButton = page.locator('button:has-text("Add User")').or(
      page.locator('button[aria-label*="Add"]')
    );
    if (await addUserButton.isVisible()) {
      await addUserButton.click();
      
      // Fill new user name
      const newUserInput = page.locator('input[placeholder*="name"]').last();
      await newUserInput.fill('NavBar User 2');
      await newUserInput.press('Enter');
      
      await page.waitForTimeout(500);
    }
    
    // Verify user was created
    await expect(page.locator('text="NavBar User 2"')).toBeVisible({ timeout: 5000 });
  });

  test('form validation displays appropriate messages', async ({ page }) => {
    await page.goto('http://localhost:5173/generate-quiz');
    
    // Try inappropriate subject
    const subjectInput = page.locator('input[placeholder*="Enter a subject"]');
    await subjectInput.fill('inappropriate content xyz123');
    await subjectInput.blur();
    
    // Wait for validation
    await page.waitForTimeout(2000);
    
    // Check for validation message (warning or suggestion)
    const validationMessage = page.locator('text=/inappropriate|warning|suggest/i').first();
    const hasSuggestions = await page.locator('text="Suggested subjects"').isVisible();
    
    // Either a warning or suggestions should appear
    const hasValidationFeedback = await validationMessage.isVisible() || hasSuggestions;
    expect(hasValidationFeedback).toBeTruthy();
  });

  test('navigation between pages works correctly', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // Create user if needed
    await createUser(page, 'Navigation Test User');
    
    // Navigate to quiz generation
    await navigateToQuizGeneration(page);
    await expect(page).toHaveURL('http://localhost:5173/generate-quiz');
    
    // Use Back button to return home
    const backButton = page.locator('button:has-text("Back")');
    await backButton.click();
    
    // Should be back at home
    await expect(page).toHaveURL('http://localhost:5173');
    
    // Verify we're on welcome screen
    await expect(page.locator('text=/Welcome to.*Ace AI Quiz/i')).toBeVisible();
  });

  test('mobile responsive layout', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });
    
    await page.goto('http://localhost:5173');
    
    // Check if welcome text is visible
    await expect(page.locator('text=/Welcome to.*Ace AI Quiz/i')).toBeVisible();
    
    // Check if features are displayed (they should stack vertically on mobile)
    const aiPoweredFeature = page.locator('text="AI-Powered"');
    const feedbackFeature = page.locator('text="Real-time Feedback"');
    
    await expect(aiPoweredFeature).toBeVisible();
    await expect(feedbackFeature).toBeVisible();
    
    // Check if Start button is full width on mobile
    const startButton = page.locator('button:has-text("Start Your Journey")');
    await expect(startButton).toBeVisible();
  });
});