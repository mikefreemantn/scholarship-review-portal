#!/bin/bash

# Get commit message from user
echo "Enter deployment description (or press Enter for default):"
read COMMIT_MSG

if [ -z "$COMMIT_MSG" ]; then
  COMMIT_MSG="Deploy: $(date '+%Y-%m-%d %H:%M:%S')"
fi

# Generate version tag
VERSION="v$(date '+%Y.%m.%d-%H%M%S')"

echo "================================================"
echo "Deploying version: $VERSION"
echo "Message: $COMMIT_MSG"
echo "================================================"

# Build the React app
echo ""
echo "Building React app..."
npm run build

if [ $? -ne 0 ]; then
  echo "Build failed! Aborting deployment."
  exit 1
fi

# Git commit and tag
echo ""
echo "Committing to git..."
cd ..
git add .
git commit -m "$COMMIT_MSG" || echo "No changes to commit"
git tag -a "$VERSION" -m "$COMMIT_MSG"
git push origin main
git push origin "$VERSION"

# Sync to S3
echo ""
echo "Syncing to S3..."
cd scholarship-voting-crm
aws s3 sync build/ s3://voting.onemoredayontheatapply.com/ --delete --cache-control "public, max-age=31536000" --exclude "index.html"
aws s3 cp build/index.html s3://voting.onemoredayontheatapply.com/index.html --cache-control "no-cache, no-store, must-revalidate" --content-type "text/html"

# Invalidate CloudFront cache
echo ""
echo "Invalidating CloudFront cache..."
aws cloudfront create-invalidation --distribution-id E1AIS5KSYIRLVS --paths "/*"

echo ""
echo "================================================"
echo "✅ Deployment complete!"
echo "Version: $VERSION"
echo "Site: https://voting.onemoredayontheatapply.com"
echo "GitHub: https://github.com/mikefreemantn/scholarship-review-portal/releases/tag/$VERSION"
echo "================================================"
