#!/bin/bash
# Get Railway service details

RAILWAY_TOKEN="bd0d60fa-abfa-4ee6-a349-bae67944b7eb"
ENVIRONMENT_ID="7c42c1fc-6c44-4ca5-b64e-c8019234a749"

# GraphQL query to get environment with deployments
curl -s -X POST https://backboard.railway.app/graphql/v2 \
  -H "Authorization: Bearer $RAILWAY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query":"query { environment(id: \"'$ENVIRONMENT_ID'\") { serviceInstances { edges { node { domains { serviceDomains { domain } } latestDeployment { status staticUrl } } } } } }"}'
