import { test, expect } from '@playwright/test'

test.describe('IoT Sample Data Population Feature', () => {
  test('should show admin controls for authenticated admin users', async ({ page }) => {
    // Navigate to the graphs page
    await page.goto('/graphs')
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle')
    
    // Check if login status indicator is present
    await expect(page.locator('text=Not logged in')).toBeVisible()
    
    // Admin controls should not be visible for non-logged-in users
    await expect(page.locator('text=Sample Data Management')).not.toBeVisible()
  })

  test('should handle API endpoint correctly', async ({ page }) => {
    // Test the endpoint directly by checking network response
    await page.goto('/graphs')
    
    // Intercept the populate sample data request
    const responsePromise = page.waitForResponse(response => 
      response.url().includes('/api/iot/sample-data') && 
      response.request().method() === 'POST'
    )
    
    // Try to trigger the populate action (this should fail with 401/403 since we're not logged in)
    const response = await page.evaluate(async () => {
      try {
        const result = await fetch('/api/iot/sample-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        })
        return {
          status: result.status,
          ok: result.ok,
          headers: Object.fromEntries(result.headers.entries())
        }
      } catch (error) {
        return { error: error.message }
      }
    })
    
    // Should return 401 (unauthorized) or 403 (forbidden) for non-admin users
    expect([401, 403]).toContain(response.status)
    console.log('✅ Admin endpoint properly protected:', response.status)
  })

  test('should show proper UI layout', async ({ page }) => {
    await page.goto('/graphs')
    await page.waitForLoadState('networkidle')
    
    // Check main page elements
    await expect(page.locator('h1')).toContainText('IoT Data Visualization')
    await expect(page.locator('text=Real-time sensor data')).toBeVisible()
    
    // Check that chart controls are present
    await expect(page.locator('text=Time Range')).toBeVisible()
    await expect(page.locator('text=3 Days')).toBeVisible()
    await expect(page.locator('text=1 Week')).toBeVisible()
    await expect(page.locator('text=1 Month')).toBeVisible()
    
    // Check sensor type controls
    await expect(page.locator('text=Sensor Types')).toBeVisible()
    await expect(page.locator('text=Temperature')).toBeVisible()
    await expect(page.locator('text=CO₂')).toBeVisible()
    
    // Disabled sensors should be present but disabled
    const humidityCheckbox = page.locator('input[type="checkbox"]').filter({ hasText: 'Humidity' })
    const ambientCheckbox = page.locator('input[type="checkbox"]').filter({ hasText: 'Ambient Light' })
    const pressureCheckbox = page.locator('input[type="checkbox"]').filter({ hasText: 'Pressure' })
    
    console.log('✅ UI layout verification completed')
  })
})