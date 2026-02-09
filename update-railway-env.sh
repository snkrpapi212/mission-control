#!/bin/bash
# Update Railway environment variable for NEXT_PUBLIC_CONVEX_URL

RAILWAY_TOKEN="bd0d60fa-abfa-4ee6-a349-bae67944b7eb"
PROJECT_ID="58980e13-1b7c-4a3a-afca-0b8c82a2d8f0"
ENVIRONMENT_ID="7c42c1fc-6c44-4ca5-b64e-c8019234a749"
SERVICE_ID="b80cac52-1362-4264-8551-6ec2b7b3e90b"

# GraphQL mutation to upsert environment variable
curl -X POST https://backboard.railway.app/graphql/v2 \
  -H "Authorization: Bearer $RAILWAY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation { variableUpsert(input: { projectId: \"'$PROJECT_ID'\", environmentId: \"'$ENVIRONMENT_ID'\", serviceId: \"'$SERVICE_ID'\", name: \"NEXT_PUBLIC_CONVEX_URL\", value: \"https://tidy-salamander-925.eu-west-1.convex.cloud\" }) }"}'
