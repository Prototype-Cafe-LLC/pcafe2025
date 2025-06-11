import { test, expect } from '@playwright/test';

test.describe('Issue #56: Admin console errors verification', () => {
  const ADMIN_URL = 'http://localhost:4000/admin';
  const consoleLogs: string[] = [];
  const consoleErrors: string[] = [];

  test.beforeEach(async ({ page }) => {
    consoleLogs.length = 0;
    consoleErrors.length = 0;

    // Capture console logs
    page.on('console', (msg) => {
      const text = msg.text();
      if (msg.type() === 'error') {
        consoleErrors.push(text);
        console.log('❌ Console Error:', text);
      } else {
        consoleLogs.push(text);
      }
    });
  });

  test('should navigate to admin contact page without Content-Range errors', async ({ page }) => {
    // Navigate to admin contact page
    await page.goto(`${ADMIN_URL}#/contact`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Give React Admin time to load

    // Check for the specific Content-Range error
    const contentRangeErrors = consoleErrors.filter(error => 
      error.includes('Content-Range header is missing') ||
      error.includes('Content-Range') ||
      error.includes('Access-Control-Expose-Headers')
    );

    // Take screenshot for debugging
    await page.screenshot({ path: 'admin-contact-fixed.png', fullPage: true });

    console.log('Total console errors:', consoleErrors.length);
    console.log('Content-Range related errors:', contentRangeErrors.length);
    
    if (consoleErrors.length > 0) {
      console.log('All console errors:');
      consoleErrors.forEach(error => console.log('  -', error));
    }

    // Assert no Content-Range errors
    expect(contentRangeErrors).toHaveLength(0);
  });

  test('should navigate to admin blog page without data provider errors', async ({ page }) => {
    // Navigate to admin blog page
    await page.goto(`${ADMIN_URL}#/blog`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Check for data provider errors
    const dataProviderErrors = consoleErrors.filter(error => 
      error.includes('data_provider_error') ||
      error.includes('do not have an \'id\' key') ||
      error.includes('The dataProvider is probably wrong')
    );

    // Take screenshot
    await page.screenshot({ path: 'admin-blog-fixed.png', fullPage: true });

    console.log('Data provider errors:', dataProviderErrors.length);
    
    if (dataProviderErrors.length > 0) {
      console.log('Data provider errors:');
      dataProviderErrors.forEach(error => console.log('  -', error));
    }

    // Assert no data provider errors
    expect(dataProviderErrors).toHaveLength(0);
  });

  test('should navigate to admin events page without errors', async ({ page }) => {
    // Navigate to admin events page
    await page.goto(`${ADMIN_URL}#/events`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Check for React Admin specific errors
    const reactAdminErrors = consoleErrors.filter(error => 
      error.includes('Content-Range') ||
      error.includes('data_provider_error') ||
      error.includes('id\' key')
    );

    // Take screenshot
    await page.screenshot({ path: 'admin-events-fixed.png', fullPage: true });

    console.log('React Admin errors:', reactAdminErrors.length);
    
    if (reactAdminErrors.length > 0) {
      console.log('React Admin errors:');
      reactAdminErrors.forEach(error => console.log('  -', error));
    }

    // Assert no React Admin errors
    expect(reactAdminErrors).toHaveLength(0);
  });

  test('should navigate to admin IoT page without errors', async ({ page }) => {
    // Navigate to admin IoT page
    await page.goto(`${ADMIN_URL}#/iot`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Check for React Admin specific errors
    const reactAdminErrors = consoleErrors.filter(error => 
      error.includes('Content-Range') ||
      error.includes('data_provider_error') ||
      error.includes('id\' key')
    );

    // Take screenshot
    await page.screenshot({ path: 'admin-iot-fixed.png', fullPage: true });

    console.log('IoT page React Admin errors:', reactAdminErrors.length);
    
    if (reactAdminErrors.length > 0) {
      console.log('IoT React Admin errors:');
      reactAdminErrors.forEach(error => console.log('  -', error));
    }

    // Assert no React Admin errors
    expect(reactAdminErrors).toHaveLength(0);
  });

  test('should verify all admin resource pages load successfully', async ({ page }) => {
    const resources = ['events', 'blog', 'iot', 'contact', 'testing', 'sanjo-tsubame-calendar'];
    
    for (const resource of resources) {
      console.log(`Testing resource: ${resource}`);
      
      // Clear previous errors
      const previousErrorCount = consoleErrors.length;
      
      await page.goto(`${ADMIN_URL}#/${resource}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Check if page loaded successfully (not showing error page)
      const hasErrorPage = await page.locator('text=Something went wrong, text=Error, text=error').isVisible().catch(() => false);
      const hasContent = await page.locator('table, [role="grid"], .datagrid, .create-button').isVisible().catch(() => false);

      console.log(`  ${resource}: hasError=${hasErrorPage}, hasContent=${hasContent}`);

      // Take screenshot for each resource
      await page.screenshot({ path: `admin-${resource}-verification.png`, fullPage: true });

      // Count new errors since visiting this resource
      const newErrorCount = consoleErrors.length - previousErrorCount;
      console.log(`  ${resource}: ${newErrorCount} new console errors`);

      // Assert page loaded without critical errors
      expect(hasErrorPage).toBeFalsy();
    }

    // Final summary
    console.log('\n=== FINAL SUMMARY ===');
    console.log(`Total console errors across all resources: ${consoleErrors.length}`);
    
    if (consoleErrors.length > 0) {
      console.log('\nAll console errors:');
      consoleErrors.forEach((error, index) => console.log(`  ${index + 1}. ${error}`));
    }

    // The key React Admin errors should be fixed
    const criticalErrors = consoleErrors.filter(error => 
      error.includes('Content-Range header is missing') ||
      error.includes('do not have an \'id\' key') ||
      error.includes('ra.notification.data_provider_error')
    );

    expect(criticalErrors).toHaveLength(0);
  });
});