# Quick Start Guide - Scholarship Voting CRM

## Prerequisites
- AWS CLI configured with your credentials
- Node.js installed
- Access to your AWS account

## Step-by-Step Setup

### 1. Set Up AWS Infrastructure (5-10 minutes)

```bash
cd aws-setup

# Install dependencies
npm install

# Create DynamoDB tables
chmod +x setup-dynamodb.sh
./setup-dynamodb.sh

# Create Cognito User Pool (SAVE THE OUTPUT!)
chmod +x setup-cognito.sh
./setup-cognito.sh
```

**IMPORTANT**: The Cognito script will output values like:
```
REACT_APP_USER_POOL_ID=us-east-1_ABC123
REACT_APP_CLIENT_ID=xyz789...
REACT_APP_IDENTITY_POOL_ID=us-east-1:...
```

Copy these values - you'll need them in the next step!

### 2. Configure the React App

```bash
cd ../scholarship-voting-crm

# Copy environment template
cp .env.example .env

# Edit .env and paste the values from step 1
nano .env  # or use your preferred editor
```

### 3. Create Your Admin User

Replace `YOUR_USER_POOL_ID` with the actual value from step 1:

```bash
# Create in Cognito
aws cognito-idp admin-create-user \
    --user-pool-id YOUR_USER_POOL_ID \
    --username mike@manovermachine.com \
    --user-attributes \
        Name=email,Value=mike@manovermachine.com \
        Name=email_verified,Value=true \
        Name=name,Value="Mike Freeman" \
    --message-action SUPPRESS

# Add to DynamoDB
aws dynamodb put-item \
    --table-name ScholarshipBoardMembers \
    --item '{
        "email": {"S": "mike@manovermachine.com"},
        "name": {"S": "Mike Freeman"},
        "isAdmin": {"BOOL": true},
        "createdAt": {"S": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"}
    }'

# Set a password for testing
aws cognito-idp admin-set-user-password \
    --user-pool-id YOUR_USER_POOL_ID \
    --username mike@manovermachine.com \
    --password "TempPassword123!" \
    --permanent
```

### 4. Import Applicant Data

```bash
cd ../aws-setup
npm run import-applicants
```

### 5. Test Locally

```bash
cd ../scholarship-voting-crm
npm install
npm start
```

Open http://localhost:3000 and login with:
- Email: `mike@manovermachine.com`
- Password: `TempPassword123!`

### 6. Deploy to Production

```bash
# Build the app
npm run build

# Deploy to S3
chmod +x deploy-to-s3.sh
./deploy-to-s3.sh
```

Your app will be live at: `https://onemoredayapply.com/internalreview/`

## Adding Board Members

Once logged in as admin:

1. Go to the **Admin** tab
2. Enter board member's email and name
3. Click "Invite Board Member"
4. They'll receive an email with temporary password

## Testing the System

As admin, you can:

1. **Toggle Testing Mode**: In Admin panel, toggle "View as All Votes Complete" to preview the dashboard
2. **Reset Votes**: Reset votes for any applicant to test voting again
3. **Delete Notes**: Remove test notes
4. **Add Test Board Members**: Create test users to see multi-user voting

## Common Issues

### "No credentials available"
- Make sure your AWS CLI is configured: `aws configure`
- Check that your IAM user has permissions for DynamoDB, Cognito, and S3

### "Cannot find module"
- Run `npm install` in both `aws-setup` and `scholarship-voting-crm` directories

### Login fails
- Verify the `.env` file has correct Cognito values
- Check that admin user exists in both Cognito and DynamoDB

### Applicants not showing
- Verify import script ran successfully
- Check DynamoDB table `ScholarshipApplicants` has data

## Next Steps

1. Change your admin password after first login
2. Add other board members through the Admin panel
3. Test the voting workflow
4. Review the rankings on the Dashboard

## Support

For detailed documentation, see `scholarship-voting-crm/README.md`
