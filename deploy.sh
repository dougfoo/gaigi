#!/bin/bash

# Get git commit hash and build date
GIT_HASH=$(git rev-parse HEAD)
BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

echo "Deploying GAIGI..."
echo "  Git Hash: $GIT_HASH"
echo "  Build Date: $BUILD_DATE"

# Deploy to Cloud Run
~/google-cloud-sdk/bin/gcloud run deploy gaigi \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --update-env-vars "NEXT_PUBLIC_GIT_HASH=$GIT_HASH,NEXT_PUBLIC_BUILD_DATE=$BUILD_DATE"

echo ""
echo "Deployment complete!"
echo "URL: https://gaigi-951551269765.us-central1.run.app"
