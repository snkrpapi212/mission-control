#!/bin/bash
# Trigger a new Railway deployment

RAILWAY_TOKEN="bd0d60fa-abfa-4ee6-a349-bae67944b7eb"
SERVICE_ID="b80cac52-1362-4264-8551-6ec2b7b3e90b"
ENVIRONMENT_ID="7c42c1fc-6c44-4ca5-b64e-c8019234a749"

# GraphQL mutation to trigger deployment
curl -X POST https://backboard.railway.app/graphql/v2 \
  -H "Authorization: Bearer $RAILWAY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation { deploymentTrigger(input: { serviceId: \"'$SERVICE_ID'\", environmentId: \"'$ENVIRONMENT_ID'\" }) { id status } }"}'
