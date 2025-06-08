import { test, expect } from '@playwright/test';

test.describe('Admin Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the homepage
    await page.goto('http://localhost:3000');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('should navigate to admin panel from header link', async ({ page }) => {
    // Click the Admin link in the header
    await page.click('nav a[href="/admin"]');
    
    // Wait for navigation
    await page.waitForLoadState('networkidle');
    
    // Check that we're on the admin page
    await expect(page).toHaveURL(/.*\/admin/);
    
    // Check that the page contains admin content
    await expect(page.locator('h1')).toContainText('Admin');
  });

  test('should navigate to admin panel from homepage button', async ({ page }) => {
    // Scroll to the admin section and find the admin panel button
    await page.locator('a:has-text("Access Admin Panel")').scrollIntoViewIfNeeded();
    
    // Click the admin button on homepage
    await page.click('a:has-text("Access Admin Panel")');
    
    // Wait for navigation
    await page.waitForLoadState('networkidle');
    
    // Check that we're on the admin page
    await expect(page).toHaveURL(/.*\/admin/);
    
    // Check that the page contains admin content
    await expect(page.locator('h1')).toContainText('Admin');
  });

  test('should display correct admin features on homepage', async ({ page }) => {
    // Check that admin section exists by looking for the admin title
    await expect(page.locator('h2:has-text("Administrator Access")')).toBeVisible();
    
    // Check admin title is specific
    await expect(page.locator('h2:has-text("Administrator Access")')).toContainText('Administrator Access');
    
    // Check admin features are listed by looking for the feature texts
    await expect(page.locator('text=Event Management with OCR & URL extraction')).toBeVisible();
    await expect(page.locator('text=Content Management System')).toBeVisible();
    await expect(page.locator('text=Analytics & Data Overview')).toBeVisible();
    
    // Check credentials are shown
    await expect(page.locator('text=Demo login: admin / admin123')).toBeVisible();
  });

  test('should verify all navigation links work correctly', async ({ page }) => {
    // Test Home link
    await page.click('nav a[href="/"]');
    await expect(page).toHaveURL('http://localhost:3000/');
    
    // Test Events link
    await page.click('nav a[href="/events"]');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/.*\/events/);
    
    // Go back to home
    await page.goto('http://localhost:3000');
    
    // Test Blog link
    await page.click('nav a[href="/blog"]');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/.*\/blog/);
    
    // Go back to home
    await page.goto('http://localhost:3000');
    
    // Test IoT Data link
    await page.click('nav a[href="/graphs"]');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/.*\/graphs/);
    
    // Go back to home
    await page.goto('http://localhost:3000');
    
    // Test Contact link
    await page.click('nav a[href="/contact"]');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/.*\/contact/);
    
    // Go back to home and test Admin link
    await page.goto('http://localhost:3000');
    await page.click('nav a[href="/admin"]');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/.*\/admin/);
  });

  test('should debug admin link behavior', async ({ page }) => {
    // Enable console logging
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    
    // Log all navigation events
    page.on('framenavigated', frame => {
      console.log('NAVIGATED TO:', frame.url());
    });
    
    // Check if admin link exists and get its attributes
    const adminHeaderLink = page.locator('nav a[href="/admin"]');
    await expect(adminHeaderLink).toBeVisible();
    
    const href = await adminHeaderLink.getAttribute('href');
    console.log('Admin header link href:', href);
    
    const adminHomepageButton = page.locator('a:has-text("Access Admin Panel")');
    await adminHomepageButton.scrollIntoViewIfNeeded();
    await expect(adminHomepageButton).toBeVisible();
    
    const buttonHref = await adminHomepageButton.getAttribute('href');
    console.log('Admin homepage button href:', buttonHref);
    
    // Click and see what happens
    console.log('Clicking admin header link...');
    await adminHeaderLink.click();
    
    await page.waitForTimeout(2000);
    console.log('Current URL after header click:', page.url());
    
    // Go back and try homepage button
    await page.goto('http://localhost:3000');
    await adminHomepageButton.scrollIntoViewIfNeeded();
    
    console.log('Clicking admin homepage button...');
    await adminHomepageButton.click();
    
    await page.waitForTimeout(2000);
    console.log('Current URL after homepage button click:', page.url());
  });
});