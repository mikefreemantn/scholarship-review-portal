#!/bin/bash

echo "Available versions:"
git tag --sort=-creatordate | head -10

echo ""
echo "Enter version tag to rollback to (e.g., v2025.12.11-161206):"
read VERSION

if [ -z "$VERSION" ]; then
  echo "No version specified. Aborting."
  exit 1
fi

echo "Rolling back to $VERSION..."

# Checkout the version
git checkout "$VERSION"

# Build
echo "Building..."
REACT_APP_VERSION=$VERSION npm run build

if [ $? -ne 0 ]; then
  echo "Build failed! Aborting rollback."
  git checkout main
  exit 1
fi

# Deploy to S3
echo "Deploying to S3..."
aws s3 sync build/ s3://voting.onemoredayontheatapply.com/ --delete --cache-control "public, max-age=31536000" --exclude "index.html"
aws s3 cp build/index.html s3://voting.onemoredayontheatapply.com/index.html --cache-control "no-cache, no-store, must-revalidate" --content-type "text/html"

# Invalidate CloudFront
echo "Invalidating CloudFront..."
aws cloudfront create-invalidation --distribution-id E1AIS5KSYIRLVS --paths "/*"

# Return to main branch
git checkout main

echo ""
echo "✅ Rollback complete to $VERSION!"
echo "Site: https://voting.onemoredayontheatapply.com"
