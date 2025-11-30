#!/bin/bash

# Complete Deployment Script for Scholarship Voting CRM
# Domain: voting.onemoredayontheatapply.com

set -e

echo "=========================================="
echo "One More Day on the AT"
echo "Scholarship Voting CRM"
echo "Complete Setup & Deployment"
echo "=========================================="
echo ""
echo "This will:"
echo "1. Create AWS infrastructure (DynamoDB, Cognito)"
echo "2. Import applicant data"
echo "3. Build and deploy React app"
echo "4. Set up DNS"
echo ""
echo "Domain: voting.onemoredayontheatapply.com"
echo "=========================================="
echo ""
read -p "Ready to begin? (yes/no): " -r
if [[ ! $REPLY =~ ^[Yy]es$ ]]; then
    echo "Setup cancelled."
    exit 1
fi

# Step 1: AWS Infrastructure
echo ""
echo "=========================================="
echo "STEP 1: AWS Infrastructure Setup"
echo "=========================================="
cd aws-setup

if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

echo ""
echo "Creating DynamoDB tables..."
chmod +x setup-dynamodb.sh
./setup-dynamodb.sh

echo ""
echo "Creating Cognito User Pool..."
chmod +x setup-cognito.sh
./setup-cognito.sh > /tmp/cognito-output.txt

echo ""
echo "=========================================="
echo "✓ AWS Infrastructure Created!"
echo "=========================================="
echo ""
cat /tmp/cognito-output.txt
echo ""
echo "=========================================="
echo "IMPORTANT: Save these Cognito values!"
echo "=========================================="
echo ""
read -p "Press ENTER after you've saved the values..."

# Extract values from output
USER_POOL_ID=$(grep "REACT_APP_USER_POOL_ID=" /tmp/cognito-output.txt | cut -d'=' -f2)
CLIENT_ID=$(grep "REACT_APP_CLIENT_ID=" /tmp/cognito-output.txt | cut -d'=' -f2)
IDENTITY_POOL_ID=$(grep "REACT_APP_IDENTITY_POOL_ID=" /tmp/cognito-output.txt | cut -d'=' -f2)

# Step 2: Configure React App
echo ""
echo "=========================================="
echo "STEP 2: Configuring React App"
echo "=========================================="
cd ../scholarship-voting-crm

cat > .env <<EOF
# AWS Cognito Configuration
REACT_APP_USER_POOL_ID=${USER_POOL_ID}
REACT_APP_CLIENT_ID=${CLIENT_ID}
REACT_APP_IDENTITY_POOL_ID=${IDENTITY_POOL_ID}
REACT_APP_REGION=us-east-1

# DynamoDB Table Names
REACT_APP_APPLICANTS_TABLE=ScholarshipApplicants
REACT_APP_VOTES_TABLE=ScholarshipVotes
REACT_APP_NOTES_TABLE=ScholarshipNotes
REACT_APP_BOARD_MEMBERS_TABLE=ScholarshipBoardMembers

# Admin Email
REACT_APP_ADMIN_EMAIL=mike@manovermachine.com
EOF

echo "✓ .env file created"

# Step 3: Create Admin User
echo ""
echo "=========================================="
echo "STEP 3: Creating Admin User"
echo "=========================================="

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
echo "  Email: mike@manovermachine.com"
echo "  Password: TempPassword123!"

# Step 4: Import Applicants
echo ""
echo "=========================================="
echo "STEP 4: Importing Applicants"
echo "=========================================="
cd ../aws-setup
npm run import-applicants

# Step 5: Build and Deploy
echo ""
echo "=========================================="
echo "STEP 5: Building & Deploying"
echo "=========================================="
cd ../scholarship-voting-crm

if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

echo "Building React app..."
npm run build

echo ""
chmod +x deploy-to-s3.sh
./deploy-to-s3.sh

# Step 6: DNS Setup
echo ""
echo "=========================================="
echo "STEP 6: Setting up DNS"
echo "=========================================="

echo "Creating Route53 CNAME record..."
aws route53 change-resource-record-sets \
    --hosted-zone-id Z09245892R23ZMVGQYRXU \
    --change-batch '{
  "Changes": [{
    "Action": "CREATE",
    "ResourceRecordSet": {
      "Name": "voting.onemoredayontheatapply.com",
      "Type": "CNAME",
      "TTL": 300,
      "ResourceRecords": [{"Value": "voting.onemoredayontheatapply.com.s3-website-us-east-1.amazonaws.com"}]
    }
  }]
}' 2>/dev/null && echo "✓ DNS record created" || echo "⚠ DNS record may already exist (this is OK)"

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
echo "Next steps:"
echo "1. Wait 2-5 minutes for DNS to propagate"
echo "2. Visit http://voting.onemoredayontheatapply.com"
echo "3. Login and test the system"
echo "4. Add board members via Admin panel"
echo "5. Change your password!"
echo ""
echo "Note: Site is HTTP only. For HTTPS, you'll need to:"
echo "  - Request SSL certificate in AWS Certificate Manager"
echo "  - Set up CloudFront distribution"
echo "  - Update DNS to point to CloudFront"
echo ""
echo "=========================================="
