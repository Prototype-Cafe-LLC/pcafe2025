import { test, expect } from '@playwright/test';

test.describe('Issue 56: Console Errors Fix', () => {
  let consoleErrors: string[] = [];

  test.beforeEach(async ({ page }) => {
    // Capture console errors
    consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
  });

  test('should not have React Admin console errors on admin page', async ({ page }) => {
    // Navigate to admin login page
    await page.goto('http://localhost:4000/admin');
    
    // Login as admin (assuming test credentials)
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin');
    await page.click('button[type="submit"]');
    
    // Wait for admin dashboard to load
    await page.waitForURL('**/admin');
    
    // Navigate to contact resource to trigger the getList operation
    await page.click('text=Contact');
    
    // Wait for the contact list to load
    await page.waitForSelector('[data-testid="contact-list"]', { timeout: 10000 }).catch(() => {
      // If data-testid doesn't exist, wait for any table or list
      return page.waitForSelector('table, .ra-list', { timeout: 10000 });
    });
    
    // Check for specific console errors that were reported
    const contentRangeError = consoleErrors.find(error => 
      error.includes('Content-Range header is missing')
    );
    
    const dataProviderError = consoleErrors.find(error => 
      error.includes('ra.notification.data_provider_error')
    );
    
    const idKeyError = consoleErrors.find(error => 
      error.includes('id key') && error.includes('dataProvider is probably wrong')
    );
    
    // Assert that these specific errors are not present
    expect(contentRangeError, 'Content-Range header error should not be present').toBeUndefined();
    expect(dataProviderError, 'Data provider error should not be present').toBeUndefined();
    expect(idKeyError, 'ID key error should not be present').toBeUndefined();
    
    // Print all console errors for debugging if test fails
    if (consoleErrors.length > 0) {
      console.log('Console errors found:', consoleErrors);
    }
  });

  test('should verify all React Admin resources load without console errors', async ({ page }) => {
    // Navigate to admin login page
    await page.goto('http://localhost:4000/admin');
    
    // Login as admin
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin');
    await page.click('button[type="submit"]');
    
    // Wait for admin dashboard to load
    await page.waitForURL('**/admin');
    
    // Test each resource that might have similar issues
    const resources = ['Events', 'Blog', 'Iot', 'Contact'];
    
    for (const resource of resources) {
      // Clear previous errors
      consoleErrors = [];
      
      // Navigate to resource
      await page.click(`text=${resource}`);
      
      // Wait for resource to load
      await page.waitForTimeout(2000);
      
      // Check for Content-Range related errors
      const hasContentRangeError = consoleErrors.some(error => 
        error.includes('Content-Range header is missing')
      );
      
      expect(hasContentRangeError, `${resource} should not have Content-Range errors`).toBeFalsy();
    }
  });
});