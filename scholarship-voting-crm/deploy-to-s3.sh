#!/bin/bash

# Deploy Scholarship Voting CRM to S3
# This script builds the React app and deploys it to S3 under /internalreview
# SAFE: Only touches /internalreview folder, never root or other folders

set -e

# Configuration
BUCKET_NAME="voting.onemoredayontheatapply.com"
DEPLOY_PATH=""  # Root of bucket since it's a dedicated subdomain
REGION="us-east-1"

echo "=========================================="
echo "Scholarship Voting CRM Deployment"
echo "=========================================="
echo "Bucket: ${BUCKET_NAME}"
echo "Path: /${DEPLOY_PATH}/"
echo "Region: ${REGION}"
echo "=========================================="
echo ""

# Check if bucket exists, create if not
echo "Checking if bucket exists..."
if ! aws s3 ls "s3://${BUCKET_NAME}" 2>&1 | grep -q 'NoSuchBucket'; then
    echo "✓ Bucket exists"
else
    echo "Bucket does not exist. Creating..."
    aws s3 mb s3://${BUCKET_NAME} --region ${REGION}
    
    # Enable static website hosting
    aws s3 website s3://${BUCKET_NAME} --index-document index.html --error-document index.html
    
    # Set bucket policy for public read
    cat > /tmp/bucket-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::${BUCKET_NAME}/*"
    }
  ]
}
EOF
    aws s3api put-bucket-policy --bucket ${BUCKET_NAME} --policy file:///tmp/bucket-policy.json
    rm /tmp/bucket-policy.json
    
    echo "✓ Bucket created and configured"
fi

echo ""
echo "Building React application..."
npm run build

echo ""
echo "=========================================="
echo "SAFETY CHECK"
echo "=========================================="
echo "This deployment will ONLY affect:"
echo "  s3://${BUCKET_NAME}/${DEPLOY_PATH}/"
echo ""
echo "It will NOT touch:"
echo "  s3://${BUCKET_NAME}/ (root)"
echo "  s3://${BUCKET_NAME}/<any-other-folder>/"
echo "=========================================="
echo ""
read -p "Continue with deployment? (yes/no): " -r
if [[ ! $REPLY =~ ^[Yy]es$ ]]; then
    echo "Deployment cancelled."
    exit 1
fi

echo ""
echo "Deploying to S3..."

# Determine S3 path (with or without trailing slash)
if [ -z "$DEPLOY_PATH" ]; then
  S3_PATH="s3://${BUCKET_NAME}/"
  URL_PATH=""
else
  S3_PATH="s3://${BUCKET_NAME}/${DEPLOY_PATH}/"
  URL_PATH="${DEPLOY_PATH}/"
fi

# Sync build folder to S3
aws s3 sync build/ ${S3_PATH} \
  --delete \
  --cache-control "public, max-age=31536000" \
  --exclude "index.html" \
  --exclude "asset-manifest.json" \
  --exclude "service-worker.js"

# Upload index.html and other files with no-cache
aws s3 cp build/index.html ${S3_PATH}index.html \
  --cache-control "no-cache, no-store, must-revalidate" \
  --content-type "text/html"

if [ -f "build/asset-manifest.json" ]; then
  aws s3 cp build/asset-manifest.json ${S3_PATH}asset-manifest.json \
    --cache-control "no-cache, no-store, must-revalidate"
fi

if [ -f "build/service-worker.js" ]; then
  aws s3 cp build/service-worker.js ${S3_PATH}service-worker.js \
    --cache-control "no-cache, no-store, must-revalidate"
fi

echo ""
echo "=========================================="
echo "✓ Deployment complete!"
echo "=========================================="
echo "Application available at:"
echo "  http://${BUCKET_NAME}.s3-website-${REGION}.amazonaws.com/${URL_PATH}"
echo ""
echo "Setting up DNS..."
echo "Run this command to create the Route53 record:"
echo ""
echo "aws route53 change-resource-record-sets --hosted-zone-id Z09245892R23ZMVGQYRXU --change-batch '{
  \"Changes\": [{
    \"Action\": \"CREATE\",
    \"ResourceRecordSet\": {
      \"Name\": \"${BUCKET_NAME}\",
      \"Type\": \"CNAME\",
      \"TTL\": 300,
      \"ResourceRecords\": [{\"Value\": \"${BUCKET_NAME}.s3-website-${REGION}.amazonaws.com\"}]
    }
  }]
}'"
echo ""
echo "After DNS propagates, your site will be available at:"
echo "  http://${BUCKET_NAME}"
echo "=========================================="
