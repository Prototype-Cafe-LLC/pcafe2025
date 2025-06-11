import { test } from '@playwright/test'

test('Debug IoT page loading', async ({ page }) => {
  // Listen for console messages
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('Browser error:', msg.text())
    }
  })
  
  // Navigate to graphs page
  await page.goto('/graphs')
  
  // Wait for page to load
  await page.waitForLoadState('networkidle')
  
  // Take screenshot
  await page.screenshot({ path: 'iot-page-debug.png', fullPage: true })
  
  // Check page title
  console.log('Page title:', await page.title())
  
  // Check if React app is loaded
  const reactRoot = await page.locator('#root')
  const rootContent = await reactRoot.textContent()
  console.log('Root content:', rootContent)
  
  // Check for specific elements
  const h1Elements = await page.locator('h1').allTextContents()
  console.log('H1 elements:', h1Elements)
})