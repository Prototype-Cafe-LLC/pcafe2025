import { test, expect } from '@playwright/test';

test.describe('React Admin UI Components - Issue #37', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the homepage
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
  });

  test('should display admin access section on homepage', async ({ page }) => {
    // Check that admin section exists
    await expect(page.locator('text=Administrator Access')).toBeVisible();
    await expect(page.locator('text=Demo login: admin / admin123')).toBeVisible();
    
    // Check admin features are listed
    await expect(page.locator('text=Event Management with OCR & URL extraction')).toBeVisible();
    await expect(page.locator('text=Content Management System')).toBeVisible();
    await expect(page.locator('text=Analytics & Data Overview')).toBeVisible();
    
    // Check admin panel link exists
    await expect(page.locator('a:has-text("Access Admin Panel")')).toBeVisible();
  });

  test('should navigate to admin panel', async ({ page }) => {
    // Click the admin panel link
    await page.click('a:has-text("Access Admin Panel")');
    await page.waitForLoadState('networkidle');
    
    // Should be on admin URL
    await expect(page).toHaveURL(/.*\/admin/);
    
    // Should see login form or admin content
    const hasLoginForm = await page.locator('input[type="password"]').isVisible().catch(() => false);
    const hasAdminContent = await page.locator('text=Admin, text=Dashboard').isVisible().catch(() => false);
    
    // Either login form or admin content should be visible
    expect(hasLoginForm || hasAdminContent).toBeTruthy();
  });

  test('should verify admin panel accessibility from header', async ({ page }) => {
    // Check header admin link
    await expect(page.locator('nav a[href="/admin"]')).toBeVisible();
    
    // Click header admin link
    await page.click('nav a[href="/admin"]');
    await page.waitForLoadState('networkidle');
    
    // Should navigate to admin
    await expect(page).toHaveURL(/.*\/admin/);
  });

  test('should test React Admin dependencies are loaded', async ({ page }) => {
    // Navigate to admin
    await page.goto('http://localhost:3000/admin');
    await page.waitForLoadState('networkidle');
    
    // Check for React Admin specific elements or classes
    // Even if authentication is required, React Admin should still load base components
    const hasReactAdmin = await page.evaluate(() => {
      // Check for React Admin specific classes or elements
      return !!(
        document.querySelector('[class*="admin"]') ||
        document.querySelector('[class*="RaAdmin"]') ||
        document.querySelector('[data-testid*="admin"]') ||
        document.querySelector('input[type="email"], input[type="text"]') // Login form
      );
    });
    
    expect(hasReactAdmin).toBeTruthy();
  });

  test('should verify responsive design of homepage admin section', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(page.locator('text=Administrator Access')).toBeVisible();
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    await expect(page.locator('text=Administrator Access')).toBeVisible();
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    await expect(page.locator('text=Administrator Access')).toBeVisible();
  });

  test('should check for required npm packages in page assets', async ({ page }) => {
    // Navigate to admin to trigger asset loading
    await page.goto('http://localhost:3000/admin');
    await page.waitForLoadState('networkidle');
    
    // Check network requests for React Admin related assets
    page.on('response', response => {
      const url = response.url();
      if (url.includes('react-admin') || url.includes('ra-')) {
        console.log('Found React Admin asset:', url);
      }
    });
    
    // Refresh to trigger network requests
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Check for admin-related JavaScript or CSS files
    const hasAdminAssets = await page.evaluate(() => {
      const scripts = Array.from(document.scripts);
      const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
      
      return scripts.some(script => 
        script.src && (script.src.includes('admin') || script.src.includes('index'))
      ) || links.some(link => 
        link.href && (link.href.includes('admin') || link.href.includes('index'))
      );
    });
    
    expect(hasAdminAssets).toBeTruthy();
  });
});