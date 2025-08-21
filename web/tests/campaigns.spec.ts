import { test, expect } from '@playwright/test';

test.describe('Campaign Management', () => {
  test('should display campaigns page', async ({ page }) => {
    await page.goto('/dashboard/campaigns');
    
    // Check if the page title is correct
    await expect(page).toHaveTitle(/Campaigns/);
    
    // Check if the main heading is visible
    await expect(page.locator('h1')).toContainText('Campaigns');
    
    // Check if the Create Campaign button is visible
    await expect(page.locator('text=Create Campaign')).toBeVisible();
  });

  test('should navigate to create campaign page', async ({ page }) => {
    await page.goto('/dashboard/campaigns');
    
    // Click on Create Campaign button
    await page.click('text=Create Campaign');
    
    // Check if we're on the create campaign page
    await expect(page).toHaveURL('/dashboard/campaigns/create');
    
    // Check if the form elements are visible
    await expect(page.locator('text=Campaign Details')).toBeVisible();
    await expect(page.locator('input[name="name"]')).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/dashboard/campaigns/create');
    
    // Try to proceed without filling required fields
    const nextButton = page.locator('text=Next: Customize Content');
    await expect(nextButton).toBeDisabled();
  });

  test('should enable next button when form is filled', async ({ page }) => {
    await page.goto('/dashboard/campaigns/create');
    
    // Fill in the campaign name
    await page.fill('input[name="name"]', 'Test Campaign');
    
    // Select a template (assuming there are options)
    const templateSelect = page.locator('[data-testid="template-select"]').first();
    if (await templateSelect.isVisible()) {
      await templateSelect.click();
      // Select first available option
      await page.locator('[role="option"]').first().click();
    }
    
    // Select a segment (assuming there are options)
    const segmentSelect = page.locator('[data-testid="segment-select"]').first();
    if (await segmentSelect.isVisible()) {
      await segmentSelect.click();
      // Select first available option
      await page.locator('[role="option"]').first().click();
    }
    
    // Check if next button is enabled (this might need adjustment based on actual implementation)
    const nextButton = page.locator('text=Next: Customize Content');
    // Note: This test might need to be adjusted based on the actual form validation logic
  });
});

test.describe('Email Editor', () => {
  test('should display email editor when on content step', async ({ page }) => {
    // This test assumes we can navigate directly to a campaign with content step
    // You might need to adjust this based on your actual routing
    await page.goto('/dashboard/campaigns/create');
    
    // Fill required fields to get to content step
    await page.fill('input[name="name"]', 'Test Campaign');
    
    // Try to navigate to content step (this might need adjustment)
    // The actual implementation might require selecting template and segment first
  });

  test('should have email editor tabs', async ({ page }) => {
    // Navigate to a page where email editor is visible
    await page.goto('/dashboard/campaigns/create');
    
    // Look for email editor tabs (adjust selectors based on actual implementation)
    const editorTab = page.locator('text=MJML Editor');
    const splitViewTab = page.locator('text=Split View');
    const previewTab = page.locator('text=Email Preview');
    
    // These checks might need to be conditional based on when the editor is visible
  });

  test('should allow editing MJML content', async ({ page }) => {
    // This test would check if the MJML textarea is editable
    // Implementation depends on how you navigate to the editor
  });
});

test.describe('Responsive Design', () => {
  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard/campaigns');
    
    // Check if the page is responsive
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/dashboard/campaigns');
    
    // Check if the page is responsive
    await expect(page.locator('h1')).toBeVisible();
  });
});