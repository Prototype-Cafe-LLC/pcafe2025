import { test, expect } from '@playwright/test'

test.describe('Swagger UI Basic Functionality (Issue #34)', () => {
  const BACKEND_URL = 'http://localhost:8080'
  
  test('should deny access to Swagger UI without authentication', async ({ page }) => {
    console.log('Testing unauthorized access to Swagger UI...')
    
    // Try to access Swagger UI without login
    const response = await page.goto(`${BACKEND_URL}/docs/index.html`)
    
    // Should receive 401 Unauthorized
    expect(response?.status()).toBe(401)
    console.log('✅ Swagger UI properly protected - got 401 status')
  })

  test('should provide Swagger JSON schema endpoint', async ({ page }) => {
    console.log('Testing Swagger JSON endpoint accessibility...')
    
    // First login via direct API call using page.request
    const loginResponse = await page.request.post(`${BACKEND_URL}/api/auth/login`, {
      data: {
        username: 'admin',
        password: 'admin123'
      }
    })
    
    expect(loginResponse.status()).toBe(200)
    console.log('✅ Admin login successful')
    
    // Now test Swagger JSON endpoint
    const swaggerResponse = await page.request.get(`${BACKEND_URL}/docs/doc.json`)
    expect(swaggerResponse.status()).toBe(200)
    
    const swaggerData = await swaggerResponse.json()
    
    // Validate basic structure
    expect(swaggerData.swagger).toBe('2.0')
    expect(swaggerData.info.title).toBe('PCafe 2025 API')
    expect(swaggerData.host).toBe('localhost:8080')
    expect(swaggerData.basePath).toBe('/api')
    
    console.log('✅ Swagger JSON endpoint accessible and valid')
    console.log(`📊 Total documented endpoints: ${Object.keys(swaggerData.paths).length}`)
  })

  test('should have all expected API endpoints documented', async ({ page }) => {
    console.log('Testing documented API endpoints...')
    
    // Login first
    await page.request.post(`${BACKEND_URL}/api/auth/login`, {
      data: {
        username: 'admin',
        password: 'admin123'
      }
    })
    
    // Get Swagger data
    const swaggerResponse = await page.request.get(`${BACKEND_URL}/docs/doc.json`)
    const swaggerData = await swaggerResponse.json()
    
    // Expected core endpoints (based on current implementation)
    const expectedEndpoints = [
      '/auth/login',
      '/auth/logout', 
      '/auth/me',
      '/auth/refresh',
      '/blog',
      '/blog/{id}'
    ]
    
    // Check each endpoint exists in documentation
    for (const endpoint of expectedEndpoints) {
      expect(swaggerData.paths[endpoint]).toBeDefined()
      console.log(`✅ Found documented endpoint: ${endpoint}`)
    }
    
    console.log('✅ All expected endpoints are documented')
  })

  test('should have proper security definitions', async ({ page }) => {
    console.log('Testing Swagger security configuration...')
    
    // Login
    await page.request.post(`${BACKEND_URL}/api/auth/login`, {
      data: {
        username: 'admin',
        password: 'admin123'
      }
    })
    
    // Get Swagger data
    const swaggerResponse = await page.request.get(`${BACKEND_URL}/docs/doc.json`)
    const swaggerData = await swaggerResponse.json()
    
    // Validate security definitions
    expect(swaggerData.securityDefinitions).toBeDefined()
    expect(swaggerData.securityDefinitions.SessionAuth).toBeDefined()
    expect(swaggerData.securityDefinitions.SessionAuth.type).toBe('apiKey')
    expect(swaggerData.securityDefinitions.SessionAuth.in).toBe('cookie')
    expect(swaggerData.securityDefinitions.SessionAuth.name).toBe('session')
    
    // Check that protected endpoints have security
    const blogPostEndpoint = swaggerData.paths['/blog'].post
    expect(blogPostEndpoint.security).toBeDefined()
    expect(blogPostEndpoint.security[0].SessionAuth).toEqual([])
    
    console.log('✅ Security definitions properly configured')
  })

  test('should access Swagger UI with admin authentication', async ({ page }) => {
    console.log('Testing Swagger UI access with authentication...')
    
    // Login via UI (more realistic test)
    await page.goto(`${BACKEND_URL}/api/auth/login`)
    
    // Use the browser's ability to make authenticated requests
    const loginResponse = await page.evaluate(async () => {
      return await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username: 'admin',
          password: 'admin123'
        })
      }).then(r => r.status)
    })
    
    if (loginResponse !== 200) {
      // Alternative: Direct request method
      await page.request.post(`${BACKEND_URL}/api/auth/login`, {
        data: {
          username: 'admin',
          password: 'admin123'
        }
      })
    }
    
    // Now try to access Swagger UI
    const response = await page.goto(`${BACKEND_URL}/docs/index.html`)
    expect(response?.status()).toBe(200)
    
    console.log('✅ Swagger UI accessible with admin authentication')
  })

  test('should verify Swagger UI content loads properly', async ({ page }) => {
    console.log('Testing Swagger UI content loading...')
    
    // Login
    await page.request.post(`${BACKEND_URL}/api/auth/login`, {
      data: {
        username: 'admin',
        password: 'admin123'
      }
    })
    
    // Access Swagger UI
    const response = await page.goto(`${BACKEND_URL}/docs/index.html`)
    expect(response?.status()).toBe(200)
    
    // Check for basic Swagger UI elements
    const content = await page.content()
    expect(content).toContain('swagger-ui')
    expect(content).toContain('Swagger UI')
    
    console.log('✅ Swagger UI HTML content loads properly')
  })
})