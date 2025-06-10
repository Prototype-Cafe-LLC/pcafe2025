#!/bin/bash

echo "🧪 Testing PCafe 2025 Sample Data Endpoint"
echo "=========================================="

# Test if backend is running
echo "1. Testing if backend is running..."
if curl -s http://localhost:8080/health > /dev/null; then
    echo "✅ Backend is running"
else
    echo "❌ Backend is not running!"
    echo "Please start it with: cd backend && go run main.go"
    exit 1
fi

# Check registered routes
echo ""
echo "2. Checking registered routes..."
echo "Looking for sample-data routes:"
curl -s http://localhost:8080/debug/routes | jq -r '.routes[] | select(.path | contains("sample-data")) | "\(.method) \(.path)"'

# Test the actual endpoints
echo ""
echo "3. Testing sample data endpoints..."

echo "POST /api/iot/sample-data:"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST http://localhost:8080/api/iot/sample-data -H "Content-Type: application/json")
echo "$RESPONSE"
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)

if [ "$HTTP_STATUS" = "404" ]; then
    echo "❌ 404 - Endpoint NOT FOUND!"
    echo "The route is missing from the backend"
elif [ "$HTTP_STATUS" = "401" ]; then
    echo "✅ 401 - Endpoint exists, authentication required (expected)"
elif [ "$HTTP_STATUS" = "403" ]; then
    echo "✅ 403 - Endpoint exists, admin access required (expected)"
else
    echo "ℹ️ Status $HTTP_STATUS - Unexpected but endpoint exists"
fi

echo ""
echo "DELETE /api/iot/sample-data:"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X DELETE http://localhost:8080/api/iot/sample-data -H "Content-Type: application/json")
echo "$RESPONSE"
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)

if [ "$HTTP_STATUS" = "404" ]; then
    echo "❌ 404 - Endpoint NOT FOUND!"
elif [ "$HTTP_STATUS" = "401" ] || [ "$HTTP_STATUS" = "403" ]; then
    echo "✅ Endpoint exists, authentication required (expected)"
else
    echo "ℹ️ Status $HTTP_STATUS"
fi

echo ""
echo "4. Testing other IoT endpoints for comparison..."
echo "GET /api/iot/devices:"
curl -s -w "\nHTTP_STATUS:%{http_code}" http://localhost:8080/api/iot/devices | tail -1

echo ""
echo "GET /api/iot/chart-data:"  
curl -s -w "\nHTTP_STATUS:%{http_code}" http://localhost:8080/api/iot/chart-data | tail -1

echo ""
echo "=== CONCLUSION ==="
echo "If you see 404 for sample-data but 200 for other endpoints,"
echo "then the sample-data routes are not registered in the backend."
echo ""
echo "If all endpoints return 404, the backend might not be running"
echo "or there might be a routing issue."