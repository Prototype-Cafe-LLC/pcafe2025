import { test, expect } from '@playwright/test';

test.describe('All Pages Test', () => {
  test.beforeEach(async ({ page }) => {
    // Set a longer timeout for navigation
    page.setDefaultTimeout(30000);
  });

  test('Homepage loads successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/PCafe 2025/);
    await expect(page.locator('h1')).toContainText(/Welcome to PCafe 2025/);
  });

  test('Events page loads and displays events', async ({ page }) => {
    await page.goto('/events');
    await expect(page.locator('h1')).toContainText(/Events/);
    
    // Wait for events to load
    await page.waitForSelector('.event-item, [class*="event"]', { timeout: 10000 }).catch(() => {
      // If no events, check for empty state
      return page.waitForSelector('text=/No events/', { timeout: 5000 });
    });
  });

  test('Blog page loads and displays posts', async ({ page }) => {
    await page.goto('/blog');
    await expect(page.locator('h1')).toContainText(/Blog/);
    
    // Wait for blog posts to load
    await page.waitForSelector('.blog-post, [class*="blog"]', { timeout: 10000 }).catch(() => {
      // If no posts, check for empty state
      return page.waitForSelector('text=/No posts/', { timeout: 5000 });
    });
  });

  test('Graphs page loads successfully', async ({ page }) => {
    await page.goto('/graphs');
    await expect(page.locator('h1')).toContainText(/IoT Data/);
  });

  test('Contact page loads successfully', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('h1')).toContainText(/Contact/);
    
    // Check for form elements
    await expect(page.locator('input[name="name"], input[placeholder*="name" i]')).toBeVisible();
    await expect(page.locator('input[name="email"], input[placeholder*="email" i]')).toBeVisible();
    await expect(page.locator('textarea')).toBeVisible();
  });

  test('Admin page redirects to login', async ({ page }) => {
    await page.goto('/admin');
    
    // Should either show login form or redirect to login
    await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible();
  });
});