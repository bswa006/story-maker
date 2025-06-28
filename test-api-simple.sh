#!/bin/bash

# First test if the server is running
echo "Testing server connection..."
curl -I http://localhost:3002 2>/dev/null | head -n 1

# Test the GET endpoint to see available templates
echo -e "\n\nTesting GET /api/ai/generate-story..."
curl -X GET 'http://localhost:3002/api/ai/generate-story' \
  -H 'Content-Type: application/json' | jq .