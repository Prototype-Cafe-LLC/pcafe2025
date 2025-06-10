import { test, expect } from '@playwright/test';

test.describe('Admin Resources Debug - Check for Errors', () => {
  test.beforeEach(async ({ page }) => {
    // Capture console errors
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
        console.log('Console Error:', msg.text());
      }
    });
    
    // Store console errors on page for later access
    await page.addInitScript(() => {
      (window as any).consoleErrors = [];
      const originalConsoleError = console.error;
      console.error = (...args) => {
        (window as any).consoleErrors.push(args.join(' '));
        originalConsoleError.apply(console, args);
      };
    });
    
    // Navigate to homepage
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
  });

  test('should navigate to admin and check for authentication', async ({ page }) => {
    // Navigate to admin
    await page.click('a[href="/admin"]');
    await page.waitForLoadState('networkidle');
    
    // Check if we're on admin page
    await expect(page).toHaveURL(/.*\/admin/);
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'admin-main-page.png', fullPage: true });
    
    // Check if login form is present or if admin content is shown
    const hasLoginForm = await page.locator('input[type="email"], input[type="text"]').isVisible().catch(() => false);
    const hasPasswordField = await page.locator('input[type="password"]').isVisible().catch(() => false);
    const hasAdminContent = await page.locator('text=Admin Dashboard, text=Dashboard').isVisible().catch(() => false);
    const hasErrorMessage = await page.locator('text=something went wrong, text=error, text=Error').isVisible().catch(() => false);
    
    console.log('Has login form:', hasLoginForm);
    console.log('Has password field:', hasPasswordField);
    console.log('Has admin content:', hasAdminContent);
    console.log('Has error message:', hasErrorMessage);
    
    // If login form is present, try to login
    if (hasLoginForm && hasPasswordField) {
      console.log('Attempting to login...');
      await page.fill('input[type="email"], input[type="text"]', 'admin');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"], button:has-text("Login")');
      await page.waitForLoadState('networkidle');
      
      // Take screenshot after login
      await page.screenshot({ path: 'admin-after-login.png', fullPage: true });
    }
    
    // Check for console errors
    const errors = await page.evaluate(() => (window as any).consoleErrors || []);
    console.log('Console errors found:', errors);
    
    // The page should not have critical errors
    expect(hasErrorMessage).toBeFalsy();
  });

  test('should test blog resource directly', async ({ page }) => {
    // Navigate directly to blog admin
    await page.goto('http://localhost:3000/admin#/blog');
    await page.waitForLoadState('networkidle');
    
    // Wait a bit for React Admin to load
    await page.waitForTimeout(2000);
    
    // Take screenshot
    await page.screenshot({ path: 'admin-blog-page.png', fullPage: true });
    
    // Check for error indicators
    const hasError = await page.locator('text=something went wrong, text=Error, text=error').isVisible().catch(() => false);
    const hasContent = await page.locator('text=Blog, text=Create, table, [role="grid"]').isVisible().catch(() => false);
    const hasLoginPrompt = await page.locator('input[type="password"]').isVisible().catch(() => false);
    
    console.log('Blog page - Has error:', hasError);
    console.log('Blog page - Has content:', hasContent);
    console.log('Blog page - Has login prompt:', hasLoginPrompt);
    
    // Get page content for debugging
    const pageContent = await page.content();
    console.log('Page contains "blog":', pageContent.toLowerCase().includes('blog'));
    console.log('Page contains "react-admin":', pageContent.toLowerCase().includes('react-admin'));
    
    // Check console errors
    const errors = await page.evaluate(() => (window as any).consoleErrors || []);
    console.log('Blog page console errors:', errors);
    
    if (hasError) {
      // Get error details
      const errorText = await page.locator('text=something went wrong, text=Error').textContent().catch(() => 'Unknown error');
      console.log('Error text:', errorText);
    }
  });

  test('should test IoT resource directly', async ({ page }) => {
    // Navigate directly to IoT admin
    await page.goto('http://localhost:3000/admin#/iot');
    await page.waitForLoadState('networkidle');
    
    // Wait for React Admin to load
    await page.waitForTimeout(2000);
    
    // Take screenshot
    await page.screenshot({ path: 'admin-iot-page.png', fullPage: true });
    
    // Check for error indicators
    const hasError = await page.locator('text=something went wrong, text=Error, text=error').isVisible().catch(() => false);
    const hasContent = await page.locator('text=IoT, text=Data, table, [role="grid"]').isVisible().catch(() => false);
    const hasLoginPrompt = await page.locator('input[type="password"]').isVisible().catch(() => false);
    
    console.log('IoT page - Has error:', hasError);
    console.log('IoT page - Has content:', hasContent);
    console.log('IoT page - Has login prompt:', hasLoginPrompt);
    
    // Check console errors
    const errors = await page.evaluate(() => (window as any).consoleErrors || []);
    console.log('IoT page console errors:', errors);
  });

  test('should test contact resource directly', async ({ page }) => {
    // Navigate directly to contact admin
    await page.goto('http://localhost:3000/admin#/contact');
    await page.waitForLoadState('networkidle');
    
    // Wait for React Admin to load
    await page.waitForTimeout(2000);
    
    // Take screenshot
    await page.screenshot({ path: 'admin-contact-page.png', fullPage: true });
    
    // Check for error indicators
    const hasError = await page.locator('text=something went wrong, text=Error, text=error').isVisible().catch(() => false);
    const hasContent = await page.locator('text=Contact, table, [role="grid"]').isVisible().catch(() => false);
    const hasLoginPrompt = await page.locator('input[type="password"]').isVisible().catch(() => false);
    
    console.log('Contact page - Has error:', hasError);
    console.log('Contact page - Has content:', hasContent);
    console.log('Contact page - Has login prompt:', hasLoginPrompt);
    
    // Check console errors
    const errors = await page.evaluate(() => (window as any).consoleErrors || []);
    console.log('Contact page console errors:', errors);
  });

  test('should check React Admin configuration', async ({ page }) => {
    // Navigate to admin and check the React Admin setup
    await page.goto('http://localhost:3000/admin');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Check if React Admin is properly loaded
    const hasReactAdmin = await page.evaluate(() => {
      // Check for React Admin in the DOM
      return !!(
        document.querySelector('[class*="RaAdmin"]') ||
        document.querySelector('[data-testid*="admin"]') ||
        document.querySelector('input[type="email"]') ||
        document.querySelector('input[type="password"]') ||
        document.body.innerHTML.includes('react-admin') ||
        window.location.hash.includes('admin')
      );
    });
    
    console.log('React Admin detected:', hasReactAdmin);
    
    // Check for specific resources in the admin interface
    const pageHTML = await page.content();
    console.log('Page includes "events":', pageHTML.toLowerCase().includes('events'));
    console.log('Page includes "blog":', pageHTML.toLowerCase().includes('blog'));
    console.log('Page includes "contact":', pageHTML.toLowerCase().includes('contact'));
    console.log('Page includes "iot":', pageHTML.toLowerCase().includes('iot'));
    
    // Take screenshot of the main admin interface
    await page.screenshot({ path: 'admin-main-interface.png', fullPage: true });
    
    expect(hasReactAdmin).toBeTruthy();
  });
});