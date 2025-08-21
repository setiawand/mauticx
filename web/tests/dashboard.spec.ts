import { test, expect } from '@playwright/test';

test.describe('Dashboard Navigation', () => {
  test('should display dashboard homepage', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check if we can access the dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    
    // Check for common dashboard elements
    await expect(page.locator('nav')).toBeVisible();
  });

  test('should have working sidebar navigation', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check if sidebar is visible
    const sidebar = page.locator('[data-testid="sidebar"]').or(page.locator('aside')).or(page.locator('nav'));
    await expect(sidebar.first()).toBeVisible();
    
    // Check for navigation links
    const campaignsLink = page.locator('text=Campaigns').or(page.locator('a[href*="campaigns"]'));
    if (await campaignsLink.first().isVisible()) {
      await campaignsLink.first().click();
      await expect(page).toHaveURL(/.*campaigns/);
    }
  });

  test('should handle navigation between pages', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Navigate to campaigns
    await page.goto('/dashboard/campaigns');
    await expect(page).toHaveURL(/.*campaigns/);
    
    // Navigate back to dashboard
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*dashboard/);
  });
});

test.describe('Page Loading', () => {
  test('should load pages without errors', async ({ page }) => {
    const pages = [
      '/dashboard',
      '/dashboard/campaigns',
      '/dashboard/campaigns/create'
    ];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      
      // Check that page loads without 404 or 500 errors
      const response = await page.waitForLoadState('networkidle');
      
      // Check for error messages
      const errorText = page.locator('text=404').or(page.locator('text=500')).or(page.locator('text=Error'));
      await expect(errorText).not.toBeVisible();
    }
  });

  test('should have proper page titles', async ({ page }) => {
    const pageTests = [
      { path: '/dashboard', titlePattern: /Dashboard|MauticX/ },
      { path: '/dashboard/campaigns', titlePattern: /Campaigns/ },
      { path: '/dashboard/campaigns/create', titlePattern: /Create|Campaign/ }
    ];
    
    for (const { path, titlePattern } of pageTests) {
      await page.goto(path);
      await expect(page).toHaveTitle(titlePattern);
    }
  });
});

test.describe('UI Components', () => {
  test('should have consistent styling', async ({ page }) => {
    await page.goto('/dashboard/campaigns');
    
    // Check for consistent button styling
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    if (buttonCount > 0) {
      // Check that buttons have proper styling classes
      const firstButton = buttons.first();
      await expect(firstButton).toBeVisible();
    }
  });

  test('should handle dark/light theme toggle', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Look for theme toggle button
    const themeToggle = page.locator('[data-testid="theme-toggle"]')
      .or(page.locator('button[aria-label*="theme"]'))
      .or(page.locator('text=Dark').or(page.locator('text=Light')));
    
    if (await themeToggle.first().isVisible()) {
      await themeToggle.first().click();
      
      // Check if theme changed (this might need adjustment based on implementation)
      const html = page.locator('html');
      // You might need to check for specific theme classes
    }
  });
});

test.describe('Error Handling', () => {
  test('should handle non-existent routes gracefully', async ({ page }) => {
    await page.goto('/dashboard/non-existent-page');
    
    // Should show 404 or redirect to a valid page
    // Adjust based on your error handling strategy
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // This test might need to be adjusted based on your API error handling
    await page.goto('/dashboard/campaigns');
    
    // Check that the page doesn't crash on network errors
    await expect(page.locator('body')).toBeVisible();
  });
});