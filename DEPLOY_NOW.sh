#!/bin/bash

# Complete Setup and Deployment Script
# This will set up everything and deploy the voting CRM

set -e

echo "=========================================="
echo "One More Day on the AT"
echo "Scholarship Voting CRM Setup & Deployment"
echo "=========================================="
echo ""

# Step 1: AWS Infrastructure
echo "STEP 1: Setting up AWS Infrastructure"
echo "--------------------------------------"
cd aws-setup

echo "Installing dependencies..."
npm install

echo ""
echo "Creating DynamoDB tables..."
chmod +x setup-dynamodb.sh
./setup-dynamodb.sh

echo ""
echo "Creating Cognito User Pool..."
chmod +x setup-cognito.sh
./setup-cognito.sh

echo ""
echo "=========================================="
echo "IMPORTANT: Copy the Cognito values above!"
echo "=========================================="
echo ""
read -p "Press ENTER after you've copied the values..."

echo ""
echo "STEP 2: Configure React App"
echo "--------------------------------------"
cd ../scholarship-voting-crm

if [ ! -f .env ]; then
    cp .env.example .env
    echo "Created .env file"
    echo ""
    echo "Please edit .env and paste the Cognito values:"
    echo "  nano .env"
    echo ""
    read -p "Press ENTER after you've updated .env..."
fi

echo ""
echo "STEP 3: Create Admin User"
echo "--------------------------------------"
echo "Please run these commands manually with your USER_POOL_ID:"
echo ""
echo "aws cognito-idp admin-create-user \\"
echo "    --user-pool-id YOUR_USER_POOL_ID \\"
echo "    --username mike@manovermachine.com \\"
echo "    --user-attributes Name=email,Value=mike@manovermachine.com Name=email_verified,Value=true Name=name,Value=\"Mike Freeman\" \\"
echo "    --message-action SUPPRESS"
echo ""
echo "aws dynamodb put-item \\"
echo "    --table-name ScholarshipBoardMembers \\"
echo "    --item '{"
echo "        \"email\": {\"S\": \"mike@manovermachine.com\"},"
echo "        \"name\": {\"S\": \"Mike Freeman\"},"
echo "        \"isAdmin\": {\"BOOL\": true},"
echo "        \"createdAt\": {\"S\": \"'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'\"}
echo "    }'"
echo ""
echo "aws cognito-idp admin-set-user-password \\"
echo "    --user-pool-id YOUR_USER_POOL_ID \\"
echo "    --username mike@manovermachine.com \\"
echo "    --password \"TempPassword123!\" \\"
echo "    --permanent"
echo ""
read -p "Press ENTER after you've created the admin user..."

echo ""
echo "STEP 4: Import Applicants"
echo "--------------------------------------"
cd ../aws-setup
npm run import-applicants

echo ""
echo "STEP 5: Build and Deploy"
echo "--------------------------------------"
cd ../scholarship-voting-crm

echo "Installing React dependencies..."
npm install

echo ""
echo "Building application..."
npm run build

echo ""
chmod +x deploy-to-s3.sh
./deploy-to-s3.sh

echo ""
echo "=========================================="
echo "✓ DEPLOYMENT COMPLETE!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Configure Route53 to point to your S3 bucket"
echo "2. Test at: http://onemoredayontheatapply.com.s3-website-us-east-1.amazonaws.com/internalreview/"
echo "3. Login with mike@manovermachine.com / TempPassword123!"
echo ""
