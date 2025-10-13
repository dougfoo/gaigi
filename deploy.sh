#!/bin/bash

# Get git commit hash
GIT_HASH=$(git rev-parse HEAD)
BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

echo "Deploying with:"
echo "  Git Hash: $GIT_HASH"
echo "  Build Date: $BUILD_DATE"

# Deploy to Cloud Run with build args
gcloud run deploy gaigi \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "NEXT_PUBLIC_GIT_HASH=$GIT_HASH,NEXT_PUBLIC_BUILD_DATE=$BUILD_DATE"

echo "Deployment complete!"
