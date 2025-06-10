import { test, expect } from '@playwright/test'

test.describe('Backend API Endpoint Testing', () => {
  const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080'
  
  test('should verify backend is running', async ({ page }) => {
    console.log(`Testing backend at: ${BACKEND_URL}`)
    
    // Test basic connectivity
    const response = await page.evaluate(async (url) => {
      try {
        const result = await fetch(`${url}/api/iot/devices`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        })
        return {
          status: result.status,
          ok: result.ok,
          url: result.url,
          headers: Object.fromEntries(result.headers.entries())
        }
      } catch (error) {
        return { 
          error: error.message,
          type: error.name 
        }
      }
    }, BACKEND_URL)
    
    console.log('Backend connectivity test:', response)
    
    if (response.error) {
      console.log('❌ Backend appears to be down or unreachable')
      console.log('Error:', response.error)
    } else {
      console.log('✅ Backend is responding')
      console.log('Status:', response.status)
    }
  })

  test('should test sample data endpoints exist', async ({ page }) => {
    // Test if the populate endpoint exists (should return 401/403, not 404)
    const populateResponse = await page.evaluate(async (url) => {
      try {
        const result = await fetch(`${url}/api/iot/sample-data`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        })
        const text = await result.text()
        return {
          status: result.status,
          ok: result.ok,
          url: result.url,
          body: text,
          headers: Object.fromEntries(result.headers.entries())
        }
      } catch (error) {
        return { 
          error: error.message,
          type: error.name 
        }
      }
    }, BACKEND_URL)
    
    console.log('Populate endpoint test:', populateResponse)
    
    if (populateResponse.status === 404) {
      console.log('❌ 404 Error - Endpoint not found!')
      console.log('This means the backend route is not registered properly')
    } else if (populateResponse.status === 401 || populateResponse.status === 403) {
      console.log('✅ Endpoint exists but requires authentication (expected)')
    } else {
      console.log('ℹ️ Unexpected response:', populateResponse.status)
    }
    
    // Test if the clear endpoint exists
    const clearResponse = await page.evaluate(async (url) => {
      try {
        const result = await fetch(`${url}/api/iot/sample-data`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        })
        const text = await result.text()
        return {
          status: result.status,
          body: text
        }
      } catch (error) {
        return { error: error.message }
      }
    }, BACKEND_URL)
    
    console.log('Clear endpoint test:', clearResponse)
  })

  test('should list all available IoT endpoints', async ({ page }) => {
    const endpoints = [
      'GET /api/iot/data',
      'GET /api/iot/stats', 
      'GET /api/iot/latest',
      'GET /api/iot/devices',
      'GET /api/iot/chart-data',
      'POST /api/iot/data',
      'POST /api/iot/sample-data',
      'DELETE /api/iot/sample-data'
    ]
    
    console.log('Testing IoT endpoints:')
    
    for (const endpoint of endpoints) {
      const [method, path] = endpoint.split(' ')
      
      const response = await page.evaluate(async (url, method, path) => {
        try {
          const result = await fetch(`${url}${path}`, {
            method,
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
          })
          return {
            endpoint: `${method} ${path}`,
            status: result.status,
            exists: result.status !== 404
          }
        } catch (error) {
          return { 
            endpoint: `${method} ${path}`,
            error: error.message,
            exists: false
          }
        }
      }, BACKEND_URL, method, path)
      
      const statusIcon = response.exists ? '✅' : '❌'
      const statusText = response.error ? `ERROR: ${response.error}` : `Status: ${response.status}`
      console.log(`${statusIcon} ${response.endpoint} - ${statusText}`)
    }
  })

  test('should check registered routes in backend', async ({ page }) => {
    // Use the debug endpoint to see all registered routes
    const routesResponse = await page.evaluate(async (url) => {
      try {
        const result = await fetch(`${url}/debug/routes`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
        const data = await result.json()
        return {
          status: result.status,
          data: data
        }
      } catch (error) {
        return { error: error.message }
      }
    }, BACKEND_URL)
    
    console.log('Registered routes response:', routesResponse)
    
    if (routesResponse.data && routesResponse.data.routes) {
      console.log('\n=== REGISTERED ROUTES ===')
      const iotRoutes = routesResponse.data.routes.filter(route => 
        route.path.includes('/api/iot/sample-data')
      )
      
      if (iotRoutes.length > 0) {
        console.log('✅ Sample data routes found:')
        iotRoutes.forEach(route => {
          console.log(`  ${route.method} ${route.path}`)
        })
      } else {
        console.log('❌ No sample data routes found!')
        console.log('All IoT routes:')
        routesResponse.data.routes
          .filter(route => route.path.includes('/api/iot/'))
          .forEach(route => {
            console.log(`  ${route.method} ${route.path}`)
          })
      }
    }
  })

  test('should provide backend debugging information', async ({ page }) => {
    console.log('\n=== BACKEND DEBUGGING INFO ===')
    console.log('Expected backend URL:', BACKEND_URL)
    console.log('Expected sample data endpoints:')
    console.log('- POST /api/iot/sample-data (populate)')  
    console.log('- DELETE /api/iot/sample-data (clear)')
    console.log('\nTo start the backend:')
    console.log('1. cd backend/')
    console.log('2. go run main.go')
    console.log('3. Check logs for "Server starting on port 8080"')
    console.log('\nTo verify routes manually:')
    console.log('curl -X POST http://localhost:8080/api/iot/sample-data')
    console.log('(Should return 401/403, not 404)')
    
    // Check if we can reach any Go server
    const healthCheck = await page.evaluate(async (url) => {
      try {
        const result = await fetch(url, { method: 'GET' })
        return {
          reachable: true,
          status: result.status,
          headers: Object.fromEntries(result.headers.entries())
        }
      } catch (error) {
        return {
          reachable: false,
          error: error.message
        }
      }
    }, BACKEND_URL)
    
    if (healthCheck.reachable) {
      console.log('✅ Backend server is reachable')
      console.log('Response headers:', healthCheck.headers)
    } else {
      console.log('❌ Backend server is not reachable')
      console.log('Error:', healthCheck.error)
      console.log('Make sure to start the backend with: go run main.go')
    }
  })
})