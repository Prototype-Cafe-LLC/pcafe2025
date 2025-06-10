import { test, expect } from '@playwright/test';

test.describe('Admin Fixes Test', () => {
  test('should test admin login and resources after fixes', async ({ page }) => {
    // Navigate to admin
    await page.goto('http://localhost:3000/admin');
    await page.waitForLoadState('networkidle');
    
    // Should see login form
    await expect(page.locator('input[type="email"], input[type="text"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    
    // Try to login
    await page.fill('input[type="email"], input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"], button:has-text("Login")');
    
    // Wait for login to complete
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Should see admin dashboard
    await expect(page.locator('text=Admin Dashboard')).toBeVisible();
    
    // Should see user info in app bar
    const userInfo = page.locator('text=Welcome, Admin');
    const hasUserInfo = await userInfo.isVisible().catch(() => false);
    console.log('User info visible:', hasUserInfo);
    
    // Should see Back to Main Site button
    await expect(page.locator('text=Back to Main Site')).toBeVisible();
    
    // Test blog resource (should not show "something went wrong")
    await page.click('a[href="#/blog"], button:has-text("Manage Blog")');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const hasError = await page.locator('text=something went wrong').isVisible().catch(() => false);
    console.log('Blog page has error:', hasError);
    
    // Take screenshot for verification
    await page.screenshot({ path: 'admin-blog-fixed.png', fullPage: true });
    
    expect(hasError).toBeFalsy();
    
    // Test IoT resource
    await page.click('a[href="#/iot"], button:has-text("View IoT Data")');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const iotHasError = await page.locator('text=something went wrong').isVisible().catch(() => false);
    console.log('IoT page has error:', iotHasError);
    
    // Take screenshot
    await page.screenshot({ path: 'admin-iot-fixed.png', fullPage: true });
    
    expect(iotHasError).toBeFalsy();
    
    // Test contact resource
    await page.click('a[href="#/contact"], button:has-text("Manage Contacts")');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const contactHasError = await page.locator('text=something went wrong').isVisible().catch(() => false);
    console.log('Contact page has error:', contactHasError);
    
    // Take screenshot
    await page.screenshot({ path: 'admin-contact-fixed.png', fullPage: true });
    
    expect(contactHasError).toBeFalsy();
  });
});