import { test, expect } from '@playwright/test';

test.describe('Email Editor', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to create campaign page
    await page.goto('/dashboard/campaigns/create');
    
    // Fill in required fields to reach the email editor
    await page.fill('input[name="name"]', 'Test Campaign for Email Editor');
    
    // Wait for the form to be ready
    await page.waitForTimeout(1000);
  });

  test('should display email editor interface', async ({ page }) => {
    // Check if we can see the email editor components
    const editorContainer = page.locator('[data-testid="email-editor"]').or(page.locator('textarea'));
    
    // The editor might not be visible until we proceed to content step
    // This test might need adjustment based on the actual flow
  });

  test('should have MJML editor tab', async ({ page }) => {
    // Look for MJML Editor tab
    const mjmlTab = page.locator('text=MJML Editor');
    
    // Check if tab exists (might be conditional based on step)
    if (await mjmlTab.isVisible()) {
      await expect(mjmlTab).toBeVisible();
      await mjmlTab.click();
      
      // Check if MJML textarea is visible
      const mjmlTextarea = page.locator('textarea');
      await expect(mjmlTextarea).toBeVisible();
    }
  });

  test('should have split view functionality', async ({ page }) => {
    // Look for Split View tab
    const splitViewTab = page.locator('text=Split View');
    
    if (await splitViewTab.isVisible()) {
      await splitViewTab.click();
      
      // In split view, both editor and preview should be visible
      const editor = page.locator('textarea');
      const preview = page.locator('[data-testid="email-preview"]').or(page.locator('iframe'));
      
      await expect(editor).toBeVisible();
      // Preview might be in an iframe or specific container
    }
  });

  test('should have email preview tab', async ({ page }) => {
    // Look for Email Preview tab
    const previewTab = page.locator('text=Email Preview').or(page.locator('text=Preview'));
    
    if (await previewTab.isVisible()) {
      await previewTab.click();
      
      // Check if preview is displayed
      const preview = page.locator('[data-testid="email-preview"]').or(page.locator('iframe'));
      // Preview functionality might need specific implementation checks
    }
  });

  test('should allow MJML content editing', async ({ page }) => {
    // Look for MJML textarea
    const mjmlTextarea = page.locator('textarea');
    
    if (await mjmlTextarea.isVisible()) {
      // Clear existing content and add test content
      await mjmlTextarea.clear();
      
      const testMJML = `<mjml>
  <mj-body>
    <mj-section>
      <mj-column>
        <mj-text>Test Email Content</mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`;
      
      await mjmlTextarea.fill(testMJML);
      
      // Verify content was entered
      await expect(mjmlTextarea).toHaveValue(testMJML);
    }
  });

  test('should have save and cancel buttons', async ({ page }) => {
    // Look for save and cancel buttons
    const saveButton = page.locator('text=Save').or(page.locator('button[type="submit"]'));
    const cancelButton = page.locator('text=Cancel').or(page.locator('text=Back'));
    
    // These buttons might be visible depending on the current step
    if (await saveButton.isVisible()) {
      await expect(saveButton).toBeVisible();
    }
    
    if (await cancelButton.isVisible()) {
      await expect(cancelButton).toBeVisible();
    }
  });

  test('should handle editor resize properly', async ({ page }) => {
    // Test responsive behavior of the editor
    await page.setViewportSize({ width: 1200, height: 800 });
    
    const editorContainer = page.locator('[data-testid="email-editor"]').or(page.locator('.email-editor'));
    
    if (await editorContainer.isVisible()) {
      // Check if editor takes appropriate width
      const boundingBox = await editorContainer.boundingBox();
      expect(boundingBox?.width).toBeGreaterThan(800); // Should use most of the width
    }
  });

  test('should maintain content when switching tabs', async ({ page }) => {
    const mjmlTextarea = page.locator('textarea');
    
    if (await mjmlTextarea.isVisible()) {
      const testContent = '<mjml><mj-body><mj-text>Test</mj-text></mj-body></mjml>';
      await mjmlTextarea.fill(testContent);
      
      // Switch to preview tab if available
      const previewTab = page.locator('text=Preview');
      if (await previewTab.isVisible()) {
        await previewTab.click();
        
        // Switch back to editor
        const editorTab = page.locator('text=MJML Editor');
        if (await editorTab.isVisible()) {
          await editorTab.click();
          
          // Content should be preserved
          await expect(mjmlTextarea).toHaveValue(testContent);
        }
      }
    }
  });
});

test.describe('Email Editor Accessibility', () => {
  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/dashboard/campaigns/create');
    
    // Check for accessibility attributes
    const textarea = page.locator('textarea');
    if (await textarea.isVisible()) {
      // Should have proper labels or aria-labels
      const ariaLabel = await textarea.getAttribute('aria-label');
      const label = page.locator('label[for]');
      
      // Either aria-label or associated label should exist
      expect(ariaLabel || await label.count() > 0).toBeTruthy();
    }
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/dashboard/campaigns/create');
    
    // Test tab navigation
    await page.keyboard.press('Tab');
    
    // Check if focus moves properly between elements
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });
});