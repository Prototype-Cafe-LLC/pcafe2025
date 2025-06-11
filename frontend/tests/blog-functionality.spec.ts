import { test, expect } from '@playwright/test';

test.describe('Blog Functionality', () => {
  const BASE_URL = ''; // Playwright expects port 3000

  test.beforeEach(async ({ page }) => {
    // Start from the homepage
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should navigate to blog page from header link', async ({ page }) => {
    // Click the Blog link in the header
    await page.click('nav a[href="/blog"]');
    
    // Wait for navigation
    await page.waitForLoadState('networkidle');
    
    // Check that we're on the blog page
    await expect(page).toHaveURL(/.*\/blog$/);
    
    // Check that the page contains blog content
    await expect(page.locator('h1:has-text("Blog")')).toBeVisible();
    await expect(page.locator('text=Latest insights, developments, and innovations in IoT technology')).toBeVisible();
  });

  test('should display blog search and filter interface', async ({ page }) => {
    // Navigate to blog page
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');
    
    // Check search input exists
    await expect(page.locator('input[placeholder="Search posts..."]')).toBeVisible();
    
    // Check filter elements exist
    await expect(page.locator('select').first()).toBeVisible(); // Tag select
    await expect(page.locator('text=Featured Only')).toBeVisible();
    await expect(page.locator('text=found')).toBeVisible(); // Results count
  });

  test('should update URL when using search filters', async ({ page }) => {
    // Navigate to blog page
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');
    
    // Test search functionality
    const searchInput = page.locator('input[placeholder="Search posts..."]');
    await searchInput.fill('test search');
    
    // Wait a moment for URL to update
    await page.waitForTimeout(100);
    
    // Check URL contains search parameter
    await expect(page).toHaveURL(/.*search=test\+search/);
    
    // Test featured filter
    await page.check('input[type="checkbox"]'); // Featured only checkbox
    await page.waitForTimeout(100);
    
    // Check URL contains featured parameter
    await expect(page).toHaveURL(/.*featured=true/);
  });

  test('should handle empty blog state gracefully', async ({ page }) => {
    // Navigate to blog page
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');
    
    // Since we likely don't have blog posts in the test environment,
    // check for the empty state message
    const emptyStateTitle = page.locator('h2');
    const hasEmptyState = await emptyStateTitle.textContent();
    
    if (hasEmptyState?.includes('No Blog Posts Yet') || hasEmptyState?.includes('No Posts Match')) {
      await expect(emptyStateTitle).toBeVisible();
      await expect(page.locator('text=Check back soon').or(page.locator('text=Try adjusting'))).toBeVisible();
    }
  });

  test('should clear filters when clear button is clicked', async ({ page }) => {
    // Navigate to blog page
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');
    
    // Apply some filters
    const searchInput = page.locator('input[placeholder="Search posts..."]');
    await searchInput.fill('test');
    await page.check('input[type="checkbox"]'); // Featured only
    
    // Wait for clear button to appear
    await expect(page.locator('button:has-text("Clear Filters")')).toBeVisible();
    
    // Click clear filters
    await page.click('button:has-text("Clear Filters")');
    
    // Check that filters are cleared
    await expect(searchInput).toHaveValue('');
    await expect(page.locator('input[type="checkbox"]')).not.toBeChecked();
    await expect(page).toHaveURL(/^[^?]*$/); // No query parameters
  });

  test('should display proper page title and meta tags', async ({ page }) => {
    // Navigate to blog page
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');
    
    // Check page title
    await expect(page).toHaveTitle(/Blog.*PCafe 2025/);
    
    // Check meta description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', /IoT technology/);
  });

  test('should handle direct navigation to blog with query parameters', async ({ page }) => {
    // Navigate directly to blog with search parameter
    await page.goto('/blog?search=test&featured=true');
    await page.waitForLoadState('networkidle');
    
    // Check that filters are applied from URL
    const searchInput = page.locator('input[placeholder="Search posts..."]');
    await expect(searchInput).toHaveValue('test');
    await expect(page.locator('input[type="checkbox"]')).toBeChecked();
  });

  test('should validate blog post link structure', async ({ page }) => {
    // Navigate to blog page
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');
    
    // If there are any blog posts, check their link structure
    const postLinks = page.locator('a[href^="/blog/"]');
    const postCount = await postLinks.count();
    
    if (postCount > 0) {
      // Check that blog post links follow the correct pattern
      const firstPostLink = postLinks.first();
      const href = await firstPostLink.getAttribute('href');
      expect(href).toMatch(/^\/blog\/[^/]+$/); // Should be /blog/slug format
    }
  });

  test('should handle blog post detail page (if posts exist)', async ({ page }) => {
    // Navigate to blog page
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');
    
    // Check if any blog posts exist
    const postLinks = page.locator('a[href^="/blog/"]:not([href="/blog"])');
    const postCount = await postLinks.count();
    
    if (postCount > 0) {
      // Click on the first blog post
      await postLinks.first().click();
      await page.waitForLoadState('networkidle');
      
      // Check that we're on a blog post detail page
      await expect(page).toHaveURL(/.*\/blog\/[^/]+$/);
      
      // Check for blog post elements
      await expect(page.locator('nav').or(page.locator('text=Blog'))).toBeVisible(); // Breadcrumb
      await expect(page.locator('article').or(page.locator('h1'))).toBeVisible(); // Article content
    }
  });

  test('should validate API endpoints are working', async ({ page }) => {
    // Test that the blog API endpoints are accessible
    const response = await page.request.get('/api/blog');
    await expect(response).toBeOK();
    
    // Test tags endpoint
    const tagsResponse = await page.request.get('/api/blog/tags');
    await expect(tagsResponse).toBeOK();
  });
});

test.describe('Blog SEO and Social Features', () => {
  const BASE_URL = '';

  test('should have proper meta tags on blog listing page', async ({ page }) => {
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');
    
    // Check Open Graph meta tags
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /Blog/);
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'website');
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', /.*/);
  });

  test('should reset meta tags when navigating away from blog', async ({ page }) => {
    // Navigate to blog first
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');
    
    // Verify blog meta tags exist
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /Blog/);
    
    // Navigate away to home page
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check that blog-specific meta tags are reset
    const ogTitle = page.locator('meta[property="og:title"]');
    const content = await ogTitle.getAttribute('content');
    expect(content).not.toContain('Blog -');
  });
});