// Quick debug script to test the populate endpoint
const testPopulateEndpoint = async () => {
  const baseUrl = 'http://localhost:8080'
  
  try {
    // Test if the endpoint exists
    const response = await fetch(`${baseUrl}/api/iot/sample-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for session auth
    })
    
    console.log('Response status:', response.status)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))
    
    if (response.status === 404) {
      console.log('❌ 404 Error - Endpoint not found')
      
      // Test if the base IoT endpoints work
      const testResponse = await fetch(`${baseUrl}/api/iot/devices`, {
        method: 'GET',
        credentials: 'include',
      })
      console.log('Test /api/iot/devices status:', testResponse.status)
      
    } else if (response.status === 401 || response.status === 403) {
      console.log('🔐 Authentication required - this is expected for admin endpoints')
    } else {
      const data = await response.json()
      console.log('Response data:', data)
    }
    
  } catch (error) {
    console.log('❌ Network error:', error.message)
  }
}

// Run the test
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testPopulateEndpoint }
} else {
  testPopulateEndpoint()
}