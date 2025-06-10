import { test, expect } from '@playwright/test'

test.describe('Swagger UI Functionality (Issue #34)', () => {
  const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080'
  
  test.beforeEach(async ({ page }) => {
    // Ensure we start each test with a clean state
    await page.context().clearCookies()
  })

  test('should deny access to Swagger UI without authentication', async ({ page }) => {
    console.log('Testing Swagger UI access without authentication...')
    
    // Try to access Swagger UI without login
    const response = await page.goto(`${BACKEND_URL}/docs/`)
    
    // Should be redirected or receive an error response
    expect(response?.status()).toBe(401)
    
    console.log('✅ Swagger UI properly protected from unauthorized access')
  })

  test('should allow access to Swagger UI with admin authentication', async ({ page }) => {
    console.log('Testing Swagger UI access with admin authentication...')
    
    // First, login as admin
    const loginResponse = await page.evaluate(async (url) => {
      const response = await fetch(`${url}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username: 'admin',
          password: 'admin123'
        })
      })
      
      return {
        status: response.status,
        data: await response.json()
      }
    }, BACKEND_URL)
    
    expect(loginResponse.status).toBe(200)
    expect(loginResponse.data.user.is_admin).toBe(true)
    console.log('✅ Admin login successful')
    
    // Now try to access Swagger UI
    const swaggerResponse = await page.goto(`${BACKEND_URL}/docs/index.html`)
    expect(swaggerResponse?.status()).toBe(200)
    
    // Wait for Swagger UI to load
    await page.waitForSelector('.swagger-ui', { timeout: 10000 })
    
    // Verify Swagger UI content
    const title = await page.textContent('h2.title')
    expect(title).toContain('PCafe 2025 API')
    
    console.log('✅ Swagger UI accessible with admin authentication')
  })

  test('should display all documented API endpoints in Swagger UI', async ({ page }) => {
    console.log('Testing documented API endpoints in Swagger UI...')
    
    // Login as admin first
    await page.evaluate(async (url) => {
      await fetch(`${url}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username: 'admin',
          password: 'admin123'
        })
      })
    }, BACKEND_URL)
    
    // Access Swagger UI
    await page.goto(`${BACKEND_URL}/docs/index.html`)
    await page.waitForSelector('.swagger-ui', { timeout: 10000 })
    
    // Expected endpoints based on our Swagger annotations
    const expectedEndpoints = [
      '/auth/login',
      '/auth/logout', 
      '/auth/me',
      '/auth/refresh',
      '/blog',
      '/blog/{id}',
      '/contact',
      '/events',
      '/events/{id}',
      '/iot/data',
      '/iot/stats'
    ]
    
    // Wait for operations to load
    await page.waitForSelector('.opblock', { timeout: 10000 })
    
    // Check each expected endpoint
    for (const endpoint of expectedEndpoints) {
      const endpointElement = await page.locator(`[data-path="${endpoint}"]`).first()
      await expect(endpointElement).toBeVisible()
      console.log(`✅ Found endpoint: ${endpoint}`)
    }
    
    console.log('✅ All expected endpoints documented in Swagger UI')
  })

  test('should display proper API tags and organization', async ({ page }) => {
    console.log('Testing API organization by tags...')
    
    // Login as admin
    await page.evaluate(async (url) => {
      await fetch(`${url}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username: 'admin',
          password: 'admin123'
        })
      })
    }, BACKEND_URL)
    
    // Access Swagger UI
    await page.goto(`${BACKEND_URL}/docs/index.html`)
    await page.waitForSelector('.swagger-ui', { timeout: 10000 })
    
    // Expected tags
    const expectedTags = ['Auth', 'Blog', 'Events', 'IoT', 'Contact']
    
    // Wait for tags to load
    await page.waitForSelector('.opblock-tag', { timeout: 10000 })
    
    // Check each expected tag
    for (const tag of expectedTags) {
      const tagElement = await page.locator('.opblock-tag').filter({ hasText: tag }).first()
      await expect(tagElement).toBeVisible()
      console.log(`✅ Found tag: ${tag}`)
    }
    
    console.log('✅ All expected tags found in Swagger UI')
  })

  test('should have proper security configuration for protected endpoints', async ({ page }) => {
    console.log('Testing security configuration in Swagger UI...')
    
    // Login as admin
    await page.evaluate(async (url) => {
      await fetch(`${url}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username: 'admin',
          password: 'admin123'
        })
      })
    }, BACKEND_URL)
    
    // Access Swagger UI
    await page.goto(`${BACKEND_URL}/docs/index.html`)
    await page.waitForSelector('.swagger-ui', { timeout: 10000 })
    
    // Check that protected endpoints show security requirements
    // For example, POST /blog should show authentication requirement
    const blogPostEndpoint = await page.locator('[data-path="/blog"]').filter({ hasText: 'POST' }).first()
    await expect(blogPostEndpoint).toBeVisible()
    
    // Click to expand the endpoint
    await blogPostEndpoint.click()
    
    // Look for security indication (lock icon or security section)
    const securitySection = await page.locator('.opblock-section-header').filter({ hasText: /security|auth/i }).first()
    
    // If no explicit security section, check for general security indicators
    if (!(await securitySection.isVisible())) {
      // Check if there's any mention of authentication in the endpoint description
      const endpointDescription = await page.locator('.opblock-description').first()
      const descText = await endpointDescription.textContent()
      expect(descText).toMatch(/(admin|auth|session)/i)
    }
    
    console.log('✅ Security configuration properly documented')
  })

  test('should validate Swagger JSON schema', async ({ page }) => {
    console.log('Testing Swagger JSON schema validity...')
    
    // Login as admin
    await page.evaluate(async (url) => {
      await fetch(`${url}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username: 'admin',
          password: 'admin123'
        })
      })
    }, BACKEND_URL)
    
    // Get the Swagger JSON directly
    const swaggerData = await page.evaluate(async (url) => {
      const response = await fetch(`${url}/docs/doc.json`, {
        credentials: 'include'
      })
      return await response.json()
    }, BACKEND_URL)
    
    // Validate basic Swagger structure
    expect(swaggerData.swagger).toBe('2.0')
    expect(swaggerData.info.title).toBe('PCafe 2025 API')
    expect(swaggerData.info.version).toBe('1.0')
    expect(swaggerData.host).toBe('localhost:8080')
    expect(swaggerData.basePath).toBe('/api')
    
    // Validate security definitions
    expect(swaggerData.securityDefinitions.SessionAuth).toBeDefined()
    expect(swaggerData.securityDefinitions.SessionAuth.type).toBe('apiKey')
    expect(swaggerData.securityDefinitions.SessionAuth.in).toBe('cookie')
    expect(swaggerData.securityDefinitions.SessionAuth.name).toBe('session')
    
    // Validate paths exist
    expect(Object.keys(swaggerData.paths).length).toBeGreaterThan(10)
    
    // Validate definitions exist for models
    expect(swaggerData.definitions['models.BlogPost']).toBeDefined()
    expect(swaggerData.definitions['models.Event']).toBeDefined()
    expect(swaggerData.definitions['models.ContactSubmissionInput']).toBeDefined()
    
    console.log('✅ Swagger JSON schema is valid')
    console.log(`📊 Total documented endpoints: ${Object.keys(swaggerData.paths).length}`)
  })

  test('should handle Swagger UI interactions', async ({ page }) => {
    console.log('Testing Swagger UI interactions...')
    
    // Login as admin
    await page.evaluate(async (url) => {
      await fetch(`${url}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username: 'admin',
          password: 'admin123'
        })
      })
    }, BACKEND_URL)
    
    // Access Swagger UI
    await page.goto(`${BACKEND_URL}/docs/index.html`)
    await page.waitForSelector('.swagger-ui', { timeout: 10000 })
    
    // Test expanding/collapsing endpoints
    const authLoginEndpoint = await page.locator('[data-path="/auth/login"]').first()
    await expect(authLoginEndpoint).toBeVisible()
    
    // Click to expand
    await authLoginEndpoint.click()
    
    // Should see more details like parameters, responses
    await page.waitForSelector('.opblock-section-header', { timeout: 5000 })
    
    // Look for parameter section or response section
    const hasParameters = await page.locator('.parameters').isVisible()
    const hasResponses = await page.locator('.responses').isVisible()
    
    expect(hasParameters || hasResponses).toBe(true)
    
    console.log('✅ Swagger UI interactions working properly')
  })
})