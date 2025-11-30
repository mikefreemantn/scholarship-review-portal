#!/bin/bash

# Continue Deployment - DynamoDB tables already exist
# This picks up where we left off

set -e

echo "=========================================="
echo "Continuing Deployment"
echo "DynamoDB tables already created ✓"
echo "=========================================="
echo ""

# Step 1: Create Cognito (fixed version)
echo "STEP 1: Creating Cognito User Pool..."
echo "--------------------------------------"
cd aws-setup

chmod +x setup-cognito.sh
./setup-cognito.sh > /tmp/cognito-output.txt

echo ""
cat /tmp/cognito-output.txt
echo ""
echo "=========================================="
echo "✓ Cognito Created!"
echo "=========================================="
echo ""

# Extract values
USER_POOL_ID=$(grep "REACT_APP_USER_POOL_ID=" /tmp/cognito-output.txt | cut -d'=' -f2)
CLIENT_ID=$(grep "REACT_APP_CLIENT_ID=" /tmp/cognito-output.txt | cut -d'=' -f2)
IDENTITY_POOL_ID=$(grep "REACT_APP_IDENTITY_POOL_ID=" /tmp/cognito-output.txt | cut -d'=' -f2)

echo "Extracted values:"
echo "  USER_POOL_ID: $USER_POOL_ID"
echo "  CLIENT_ID: $CLIENT_ID"
echo "  IDENTITY_POOL_ID: $IDENTITY_POOL_ID"
echo ""

# Step 2: Configure React App
echo "STEP 2: Configuring React App..."
echo "--------------------------------------"
cd ../scholarship-voting-crm

cat > .env <<EOF
# AWS Cognito Configuration
REACT_APP_USER_POOL_ID=${USER_POOL_ID}
REACT_APP_CLIENT_ID=${CLIENT_ID}
REACT_APP_IDENTITY_POOL_ID=${IDENTITY_POOL_ID}
REACT_APP_REGION=us-east-2

# DynamoDB Table Names
REACT_APP_APPLICANTS_TABLE=ScholarshipApplicants
REACT_APP_VOTES_TABLE=ScholarshipVotes
REACT_APP_NOTES_TABLE=ScholarshipNotes
REACT_APP_BOARD_MEMBERS_TABLE=ScholarshipBoardMembers

# Admin Email
REACT_APP_ADMIN_EMAIL=mike@manovermachine.com
EOF

echo "✓ .env file created"
cat .env
echo ""

# Step 3: Create Admin User
echo "STEP 3: Creating Admin User..."
echo "--------------------------------------"

echo "Creating Cognito user..."
aws cognito-idp admin-create-user \
    --user-pool-id ${USER_POOL_ID} \
    --username mike@manovermachine.com \
    --user-attributes \
        Name=email,Value=mike@manovermachine.com \
        Name=email_verified,Value=true \
        Name=name,Value="Mike Freeman" \
    --message-action SUPPRESS

echo "Adding to DynamoDB..."
aws dynamodb put-item \
    --table-name ScholarshipBoardMembers \
    --item "{
        \"email\": {\"S\": \"mike@manovermachine.com\"},
        \"name\": {\"S\": \"Mike Freeman\"},
        \"isAdmin\": {\"BOOL\": true},
        \"createdAt\": {\"S\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"}
    }"

echo "Setting password..."
aws cognito-idp admin-set-user-password \
    --user-pool-id ${USER_POOL_ID} \
    --username mike@manovermachine.com \
    --password "TempPassword123!" \
    --permanent

echo "✓ Admin user created"
echo ""

# Step 4: Import Applicants
echo "STEP 4: Importing Applicants..."
echo "--------------------------------------"
cd ../aws-setup
npm run import-applicants

echo ""

# Step 5: Build and Deploy
echo "STEP 5: Building & Deploying..."
echo "--------------------------------------"
cd ../scholarship-voting-crm

if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

echo "Building React app..."
npm run build

echo ""
echo "Deploying to S3..."
echo ""

# Create S3 bucket
echo "Creating S3 bucket..."
aws s3 mb s3://voting.onemoredayontheatapply.com --region us-east-1 2>/dev/null || echo "Bucket already exists"

# Enable static website hosting
aws s3 website s3://voting.onemoredayontheatapply.com --index-document index.html --error-document index.html

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
      "Resource": "arn:aws:s3:::voting.onemoredayontheatapply.com/*"
    }
  ]
}
EOF
aws s3api put-bucket-policy --bucket voting.onemoredayontheatapply.com --policy file:///tmp/bucket-policy.json
rm /tmp/bucket-policy.json

# Sync files
echo "Uploading files..."
aws s3 sync build/ s3://voting.onemoredayontheatapply.com/ \
  --delete \
  --cache-control "public, max-age=31536000" \
  --exclude "index.html" \
  --exclude "asset-manifest.json"

aws s3 cp build/index.html s3://voting.onemoredayontheatapply.com/index.html \
  --cache-control "no-cache, no-store, must-revalidate" \
  --content-type "text/html"

echo "✓ Deployed to S3"
echo ""

# Step 6: DNS Setup
echo "STEP 6: Setting up DNS..."
echo "--------------------------------------"

echo "Creating Route53 CNAME record..."
aws route53 change-resource-record-sets \
    --hosted-zone-id Z09245892R23ZMVGQYRXU \
    --change-batch '{
  "Changes": [{
    "Action": "UPSERT",
    "ResourceRecordSet": {
      "Name": "voting.onemoredayontheatapply.com",
      "Type": "CNAME",
      "TTL": 300,
      "ResourceRecords": [{"Value": "voting.onemoredayontheatapply.com.s3-website-us-east-1.amazonaws.com"}]
    }
  }]
}' && echo "✓ DNS record created"

echo ""
echo "=========================================="
echo "🎉 DEPLOYMENT COMPLETE!"
echo "=========================================="
echo ""
echo "Your voting CRM is now live at:"
echo "  http://voting.onemoredayontheatapply.com"
echo ""
echo "Login credentials:"
echo "  Email: mike@manovermachine.com"
echo "  Password: TempPassword123!"
echo ""
echo "Wait 2-5 minutes for DNS to propagate, then visit the site!"
echo ""
echo "=========================================="
