import { test, expect } from '@playwright/test'

test('should complete full blog creation flow', async ({ page }) => {
  // 1. Navigate to admin panel
  await page.goto('/admin')
  
  // 2. Should see login form
  await expect(page.locator('h3:has-text("Admin Login Required")')).toBeVisible()
  
  // 3. Login with admin credentials
  await page.fill('input[type="text"]', 'admin')
  await page.fill('input[type="password"]', 'admin123')
  await page.click('button:has-text("Login")')
  
  // 4. Should see admin dashboard
  await expect(page.locator('text=Admin Panel')).toBeVisible()
  await expect(page.locator('text=Welcome, admin')).toBeVisible()
  
  // 5. Click Manage Blog
  await page.click('text=Manage Blog')
  
  // 6. Should be in blog admin interface
  await expect(page.locator('text=PCafe 2025 - Blog Admin')).toBeVisible()
  
  // 7. Click Create button
  await page.click('[aria-label="Create"], button:has-text("Create"), [title="Create"]')
  
  // 8. Fill out blog creation form
  const testTitle = `Test Blog Post ${Date.now()}`
  const testContent = `# Test Content\n\nThis is a test blog post created at ${new Date().toISOString()}`
  
  await page.fill('input[name="title"]', testTitle)
  await page.fill('textarea[name="content"], .CodeMirror textarea', testContent)
  
  // Mark as published
  await page.check('input[name="is_published"]')
  
  // 9. Save the blog post
  await page.click('button:has-text("Save"), button[type="submit"]')
  
  // 10. Should see success message or redirect to list
  await expect(page.locator('text=created', { exact: false })).toBeVisible({ timeout: 10000 })
  
  // 11. Verify the blog post appears in the public blog page
  await page.goto('/blog')
  await expect(page.locator(`text=${testTitle}`)).toBeVisible()
  
  console.log('✅ Blog creation flow completed successfully!')
})