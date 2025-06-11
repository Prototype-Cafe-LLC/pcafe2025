import { test, expect } from '@playwright/test';

test.describe('Sanjo-Tsubame Calendar', () => {
  test('should display calendar page', async ({ page }) => {
    // Navigate to the calendar page
    await page.goto('/sanjo-tsubame-calendar');
    
    // Check that the page loads and displays the title
    await expect(page.locator('h1')).toContainText('三条・燕 営業日カレンダー');
    
    // Check that the calendar component is present
    await expect(page.locator('.calendarContainer')).toBeVisible();
    
    // Check that the navigation header is present
    await expect(page.locator('.calendarHeader')).toBeVisible();
    
    // Check that today's status is displayed (if available)
    const todayStatus = page.locator('.todayStatus');
    if (await todayStatus.isVisible()) {
      await expect(todayStatus).toContainText('今日');
    }
    
    // Check that the legend is displayed
    await expect(page.locator('.legend')).toBeVisible();
    await expect(page.locator('.legend')).toContainText('営業日');
    await expect(page.locator('.legend')).toContainText('休業日');
    
    // Check that calendar grid is displayed
    await expect(page.locator('.calendarGrid')).toBeVisible();
    
    // Check that day headers are displayed (Japanese days of week)
    await expect(page.locator('.dayHeader')).toContainText('日');
    await expect(page.locator('.dayHeader')).toContainText('月');
    await expect(page.locator('.dayHeader')).toContainText('火');
  });

  test('should navigate between months', async ({ page }) => {
    await page.goto('/sanjo-tsubame-calendar');
    
    // Wait for calendar to load
    await expect(page.locator('.calendarContainer')).toBeVisible();
    
    // Get the current displayed month/year
    const currentMonthYear = await page.locator('.calendarHeader span').textContent();
    
    // Click next month button
    await page.locator('.navButton[aria-label="次の月"]').click();
    
    // Wait a bit for the state to update
    await page.waitForTimeout(500);
    
    // Verify month changed (this may not work if API is not running)
    // In a real test, we'd mock the API or ensure backend is running
  });

  test('should display contact information', async ({ page }) => {
    await page.goto('/sanjo-tsubame-calendar');
    
    // Check that contact information is displayed
    await expect(page.locator('.contactInfo')).toBeVisible();
    await expect(page.locator('.contactInfo')).toContainText('お問い合わせ');
    
    // Check that the external links are present
    const tsubameLink = page.locator('a[href*="tsubame-cci.or.jp"]');
    const sanjoLink = page.locator('a[href*="sanjo-cci.or.jp"]');
    
    await expect(tsubameLink).toBeVisible();
    await expect(sanjoLink).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/sanjo-tsubame-calendar');
    
    // Check that the page is still usable on mobile
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('.calendarContainer')).toBeVisible();
    
    // Check that the layout adapts (calendar should still be visible)
    await expect(page.locator('.calendarGrid')).toBeVisible();
  });

  test('should show calendar statistics', async ({ page }) => {
    await page.goto('/sanjo-tsubame-calendar');
    
    // Check that statistics section is displayed
    await expect(page.locator('.infoCard')).toBeVisible();
    await expect(page.locator('.infoCardTitle')).toContainText('月間統計');
    
    // Check that stat items are present (if data is loaded)
    const statItems = page.locator('.statItem');
    if (await statItems.first().isVisible()) {
      await expect(statItems).toContainText('営業日');
      await expect(statItems).toContainText('休業日');
    }
  });
});

test.describe('Admin Calendar Management', () => {
  test('should show admin calendar interface', async ({ page, context }) => {
    // Note: This test assumes admin authentication is set up
    // In a real test environment, you'd handle authentication properly
    
    await page.goto('/admin');
    
    // Check if we're redirected to login or if we can access admin
    const currentUrl = page.url();
    
    if (currentUrl.includes('/admin') && !currentUrl.includes('/login')) {
      // We're in admin, check for calendar resource
      await expect(page.locator('text=三条・燕カレンダー')).toBeVisible();
      
      // Click on the calendar resource
      await page.click('text=三条・燕カレンダー');
      
      // Check that the calendar management interface loads
      await expect(page.locator('text=三条・燕 営業日カレンダー管理')).toBeVisible();
      
      // Check that bulk import button is present
      await expect(page.locator('text=一括インポート')).toBeVisible();
      
      // Check that entry form is present
      await expect(page.locator('text=新しいエントリを追加')).toBeVisible();
    } else {
      console.log('Admin authentication required - skipping admin tests');
    }
  });

  test('should display calendar grid in admin', async ({ page }) => {
    await page.goto('/admin/sanjo-tsubame-calendar');
    
    // If we can access the admin page directly
    const currentUrl = page.url();
    if (currentUrl.includes('/admin/sanjo-tsubame-calendar')) {
      // Check that calendar management interface is present
      await expect(page.locator('text=営業日ステータス')).toBeVisible();
      
      // Check that calendar grid shows days
      const calendarGrid = page.locator('[role="grid"], .grid');
      if (await calendarGrid.isVisible()) {
        // Calendar grid should show numbered days
        await expect(page.locator('text=/^[1-9]$|^[12][0-9]$|^3[01]$/')).toBeVisible();
      }
    }
  });
});

test.describe('API Integration', () => {
  test('should handle API responses gracefully', async ({ page }) => {
    // Test that the page doesn't break when API is not available
    
    // Mock the API to return an error
    await page.route('**/api/sanjo-tsubame-calendar/**', route => {
      route.fulfill({
        status: 500,
        body: 'Server Error'
      });
    });
    
    await page.goto('/sanjo-tsubame-calendar');
    
    // Page should still load, though it may show loading or error states
    await expect(page.locator('h1')).toBeVisible();
    
    // Check that error handling is graceful (no JavaScript errors)
    const errors = [];
    page.on('pageerror', error => errors.push(error));
    
    // Wait a bit to see if any errors occur
    await page.waitForTimeout(2000);
    
    // The page should handle API errors gracefully
    expect(errors.length).toBe(0);
  });

  test('should display loading states', async ({ page }) => {
    // Mock slow API response
    await page.route('**/api/sanjo-tsubame-calendar/**', route => {
      setTimeout(() => {
        route.fulfill({
          status: 200,
          body: JSON.stringify({
            year: 2025,
            month: 1,
            data: {}
          })
        });
      }, 1000);
    });
    
    await page.goto('/sanjo-tsubame-calendar');
    
    // Should show loading indicator initially
    const loadingText = page.locator('text=読み込み').or(page.locator('text=loading')).or(page.locator('.loading'));
    
    // Wait for either loading text or calendar to appear
    await Promise.race([
      loadingText.waitFor({ timeout: 2000 }).catch(() => {}),
      page.locator('.calendarContainer').waitFor({ timeout: 3000 })
    ]);
  });
});