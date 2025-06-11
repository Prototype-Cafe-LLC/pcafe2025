#!/bin/bash

# Test authenticated bulk import
echo "Testing authenticated bulk import..."

# Step 1: Login and capture cookies
echo "Step 1: Login..."
COOKIES=$(curl -s -c - -X POST -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  http://localhost:8080/api/auth/login | grep -E "session|PHPSESSID|connect.sid")

# Extract session cookie
SESSION_COOKIE=$(echo "$COOKIES" | grep -E "session|PHPSESSID|connect.sid" | awk '{print $6"="$7}')

echo "Session cookie: $SESSION_COOKIE"

# Step 2: Test bulk import with authentication
echo "Step 2: Test bulk import..."
curl -X POST -H "Content-Type: application/json" \
  -H "Cookie: $SESSION_COOKIE" \
  -d '{"year":2025,"month":1,"days":[1,2],"status":"on"}' \
  http://localhost:8080/api/sanjo-tsubame-calendar/bulk-import

echo -e "\n\nStep 3: Verify changes..."
curl -H "Content-Type: application/json" \
  http://localhost:8080/api/sanjo-tsubame-calendar/2025/1 | jq '.data["2025-01-01"], .data["2025-01-02"]'