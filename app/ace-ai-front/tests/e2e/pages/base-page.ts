/**
 * Base page class with common functionality for all pages
 */

import { Page, Locator, expect } from '@playwright/test';

export class BasePage {
  readonly page: Page;
  readonly navbar: Locator;
  readonly logo: Locator;
  readonly userDropdown: Locator;
  readonly mobileMenuButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.navbar = page.locator('nav');
    this.logo = page.locator('[alt="Ace AI Logo"]');
    this.userDropdown = page.locator('[data-testid="user-dropdown"]').or(
      page.locator('button:has-text("Active User")')
    );
    this.mobileMenuButton = page.locator('[aria-label="Toggle mobile menu"]');
  }

  /**
   * Navigate to a specific path
   */
  async goto(path: string = '/') {
    await this.page.goto(path);
    await this.waitForPageLoad();
  }

  /**
   * Wait for page to be fully loaded
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
    try {
      await expect(this.navbar).toBeVisible({ timeout: 3000 });
    } catch {
      // Navbar might not be available in error conditions, continue
      console.warn('Navbar not visible, continuing with test');
    }
  }

  /**
   * Wait for element to be visible with custom timeout
   */
  async waitForVisible(locator: Locator, timeout: number = 10000) {
    await expect(locator).toBeVisible({ timeout });
  }

  /**
   * Wait for element to be hidden
   */
  async waitForHidden(locator: Locator, timeout: number = 10000) {
    await expect(locator).toBeHidden({ timeout });
  }

  /**
   * Check if we're on mobile viewport
   */
  async isMobile(): Promise<boolean> {
    const viewport = this.page.viewportSize();
    return viewport !== null && viewport.width < 768;
  }

  /**
   * Click navigation item (handles mobile menu)
   */
  async clickNavItem(text: string) {
    if (await this.isMobile()) {
      if (!(await this.mobileMenuButton.isHidden())) {
        await this.mobileMenuButton.click();
      }
      await this.page.locator(`text="${text}"`).first().click();
    } else {
      await this.page.locator(`nav a:has-text("${text}"), nav button:has-text("${text}")`).click();
    }
  }

  /**
   * Verify current URL path
   */
  async verifyPath(expectedPath: string) {
    await this.page.waitForURL(new RegExp(expectedPath));
    expect(this.page.url()).toMatch(new RegExp(expectedPath));
  }

  /**
   * Take screenshot for debugging
   */
  async screenshot(name: string) {
    await this.page.screenshot({ 
      path: `test-results/screenshots/${name}-${Date.now()}.png`,
      fullPage: true 
    });
  }

  /**
   * Scroll element into view
   */
  async scrollIntoView(locator: Locator) {
    await locator.scrollIntoViewIfNeeded();
  }

  /**
   * Wait for and handle any loading states
   */
  async waitForNoLoading() {
    // Wait for any loading spinners or states to disappear
    await this.page.waitForFunction(() => {
      const loadingElements = document.querySelectorAll('[data-testid*="loading"], .loading, .spinner');
      return loadingElements.length === 0 || Array.from(loadingElements).every(el => 
        (el as HTMLElement).style.display === 'none' || !el.getAttribute('aria-busy')
      );
    }, { timeout: 15000 });
  }

  /**
   * Verify page title
   */
  async verifyTitle(expectedTitle: string) {
    await expect(this.page).toHaveTitle(expectedTitle);
  }

  /**
   * Get current user name from navbar (if authenticated)
   */
  async getCurrentUserName(): Promise<string | null> {
    try {
      const userElement = this.page.locator('[data-testid="current-user-name"]').or(
        this.page.locator('text=/Welcome back,|Active User/').locator('..').locator('text=/[A-Za-z]+/')
      );
      return await userElement.first().textContent();
    } catch {
      return null;
    }
  }

  /**
   * Verify user is authenticated
   */
  async verifyAuthenticated(userName?: string) {
    const currentUser = await this.getCurrentUserName();
    expect(currentUser).toBeTruthy();
    if (userName) {
      expect(currentUser).toContain(userName);
    }
  }

  /**
   * Verify user is not authenticated
   */
  async verifyNotAuthenticated() {
    const currentUser = await this.getCurrentUserName();
    expect(currentUser).toBeFalsy();
  }

  /**
   * Handle confirmation dialogs
   */
  async handleConfirmDialog(action: 'accept' | 'dismiss' = 'accept') {
    this.page.on('dialog', async dialog => {
      if (action === 'accept') {
        await dialog.accept();
      } else {
        await dialog.dismiss();
      }
    });
  }

  /**
   * Wait for network requests to complete
   */
  async waitForNetworkIdle() {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Verify error message is displayed
   */
  async verifyErrorMessage(expectedMessage: string) {
    const errorElement = this.page.locator('[data-testid="error-message"]').or(
      this.page.locator('text=/error|Error/').locator('..')
    );
    await expect(errorElement).toBeVisible();
    await expect(errorElement).toContainText(expectedMessage);
  }

  /**
   * Clear local storage
   */
  async clearStorage() {
    try {
      await this.page.evaluate(() => {
        try {
          localStorage.clear();
        } catch (e) {
          console.warn('localStorage.clear() failed:', e);
        }
        try {
          sessionStorage.clear();
        } catch (e) {
          console.warn('sessionStorage.clear() failed:', e);
        }
      });
    } catch (error) {
      console.warn('Storage clearing failed, continuing with test:', error);
    }
  }
}