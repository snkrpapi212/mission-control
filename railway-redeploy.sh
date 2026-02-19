#!/bin/bash
# Manual Railway deployment trigger (working version with explicit commit SHA)
# Usage: ./railway-redeploy.sh [commit-sha]

RAILWAY_TOKEN="aba02c3e-77d6-4e9f-8423-34f21d5b7e03"
SERVICE_ID="e2578691-6779-460b-b01a-d2cd2acd3893"
ENVIRONMENT_ID="74b195b8-a833-4b65-b240-beda1fd570b5"

# Get commit SHA from argument or fetch latest from GitHub
if [ -n "$1" ]; then
  COMMIT_SHA="$1"
  echo "🎯 Using provided commit SHA: $COMMIT_SHA"
else
  echo "🔍 Fetching latest commit from GitHub main..."
  COMMIT_SHA=$(curl -s https://api.github.com/repos/snkrpapi212/mission-control/commits/main | python3 -c "import sys, json; print(json.load(sys.stdin)['sha'])")
  if [ -z "$COMMIT_SHA" ]; then
    echo "❌ Failed to fetch latest commit SHA from GitHub"
    exit 1
  fi
  echo "📝 Latest commit: ${COMMIT_SHA:0:7}"
fi

echo ""
echo "🚀 Triggering Railway deployment with commit $COMMIT_SHA..."

DEPLOY_RESPONSE=$(curl -s -X POST https://backboard.railway.app/graphql/v2 \
  -H "Authorization: Bearer $RAILWAY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { serviceInstanceDeploy(environmentId: \"'"$ENVIRONMENT_ID"'\", serviceId: \"'"$SERVICE_ID"'\", commitSha: \"'"$COMMIT_SHA"'\") }"
  }')

echo "$DEPLOY_RESPONSE" | python3 -m json.tool

if echo "$DEPLOY_RESPONSE" | grep -q '"serviceInstanceDeploy": true'; then
  echo ""
  echo "⏳ Waiting 5 seconds for deployment to initialize..."
  sleep 5
  
  echo "🔍 Checking deployment status..."
  curl -s -X POST https://backboard.railway.app/graphql/v2 \
    -H "Authorization: Bearer $RAILWAY_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "query": "query service($id: String!) { service(id: $id) { deployments(first: 1) { edges { node { id status createdAt meta } } } } }",
      "variables": {
        "id": "'"$SERVICE_ID"'"
      }
    }' | python3 -c "
import sys, json
data = json.load(sys.stdin)
dep = data['data']['service']['deployments']['edges'][0]['node']
commit_hash = dep['meta'].get('commitHash', 'N/A')
commit_msg = dep['meta'].get('commitMessage', 'N/A')
print(f\"\\n✅ Deployment triggered successfully!\")
print(f\"🆔 Deployment ID: {dep['id']}\")
print(f\"⚡ Status: {dep['status']}\")
print(f\"📝 Commit: {commit_hash[:7] if commit_hash != 'N/A' else 'N/A'}\")
print(f\"💬 Message: {commit_msg}\")
print(f\"🔗 Dashboard: https://web-production-21ebe.up.railway.app/dashboard\")
"
else
  echo ""
  echo "❌ Deployment trigger failed"
  exit 1
fi
