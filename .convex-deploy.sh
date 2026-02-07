#!/bin/bash
# Try different methods to deploy Convex functions

echo "=== Attempt 1: Using .env.deployment key ==="
export CONVEX_DEPLOY_KEY=$(cat .env.deployment | grep CONVEX_DEPLOY_KEY | cut -d= -f2)
echo "Key: $CONVEX_DEPLOY_KEY"
npx convex deploy --yes 2>&1 | head -20

echo -e "\n=== Attempt 2: Check convex status ==="
npx convex dev --once 2>&1 | head -20
