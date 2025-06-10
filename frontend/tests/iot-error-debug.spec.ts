import { test, expect } from '@playwright/test'

test('Debug IoT page error', async ({ page }) => {
  // Collect all console errors
  const errors: string[] = []
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text())
    }
  })
  
  page.on('pageerror', error => {
    console.log('Page error:', error.message)
  })
  
  // Navigate to graphs page
  await page.goto('http://localhost:3000/graphs')
  
  // Wait a bit for errors to appear
  await page.waitForTimeout(2000)
  
  // Print all errors
  console.log('All console errors:')
  errors.forEach((error, index) => {
    console.log(`${index + 1}. ${error}`)
  })
  
  // Check network responses
  const chartDataResponse = await page.evaluate(async () => {
    try {
      const response = await fetch('http://localhost:8080/api/iot/chart-data?timeRange=24h')
      const data = await response.json()
      return { status: response.status, data }
    } catch (error) {
      return { error: error.message }
    }
  })
  
  console.log('Chart data API response:', JSON.stringify(chartDataResponse, null, 2))
})