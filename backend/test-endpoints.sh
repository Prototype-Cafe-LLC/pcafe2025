#!/bin/bash

echo "🔍 Testing PCafe 2025 Backend Endpoints"
echo "======================================="

BACKEND_URL="http://localhost:8080"

echo "1. Testing health check..."
curl -s "$BACKEND_URL/health" | jq . || echo "❌ Health check failed"
echo ""

echo "2. Testing debug routes..."
curl -s "$BACKEND_URL/debug/routes" | jq .total_routes || echo "❌ Debug routes failed"
echo ""

echo "3. Testing IoT endpoints..."
echo "GET /api/iot/devices:"
curl -s "$BACKEND_URL/api/iot/devices" | head -c 100
echo ""

echo "GET /api/iot/chart-data:"
curl -s "$BACKEND_URL/api/iot/chart-data" | head -c 100
echo ""

echo "4. Testing sample data endpoints (should return 401/403, not 404)..."
echo "POST /api/iot/sample-data:"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BACKEND_URL/api/iot/sample-data")
echo "Status: $HTTP_STATUS"

if [ "$HTTP_STATUS" = "404" ]; then
    echo "❌ 404 Error - Endpoint not found!"
    echo "The route is not registered properly."
elif [ "$HTTP_STATUS" = "401" ] || [ "$HTTP_STATUS" = "403" ]; then
    echo "✅ Endpoint exists but requires authentication (expected)"
else
    echo "ℹ️ Unexpected status: $HTTP_STATUS"
fi
echo ""

echo "DELETE /api/iot/sample-data:"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BACKEND_URL/api/iot/sample-data")
echo "Status: $HTTP_STATUS"

if [ "$HTTP_STATUS" = "404" ]; then
    echo "❌ 404 Error - Endpoint not found!"
elif [ "$HTTP_STATUS" = "401" ] || [ "$HTTP_STATUS" = "403" ]; then
    echo "✅ Endpoint exists but requires authentication (expected)"
else
    echo "ℹ️ Unexpected status: $HTTP_STATUS"
fi
echo ""

echo "5. Checking all registered routes..."
curl -s "$BACKEND_URL/debug/routes" | jq -r '.routes[] | select(.path | contains("/api/iot/")) | "\(.method) \(.path)"' || echo "❌ Could not fetch routes"

echo ""
echo "=== DEBUGGING INSTRUCTIONS ==="
echo "If you see 404 errors:"
echo "1. Make sure backend is running: go run main.go"
echo "2. Check the logs for route registration"
echo "3. Verify the server is listening on port 8080"
echo "4. Check for any Go compilation errors"