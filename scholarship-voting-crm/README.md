# One More Day on the AT - Scholarship Voting CRM

A secure, internal review system for board members to evaluate and vote on scholarship applicants.

## Features

- **AWS Cognito Authentication**: Secure login for board members only
- **Voting System**: 0-10 score slider with confirmation, one vote per applicant
- **Notes**: Shared notes visible to all board members
- **Dashboard**: Rankings and statistics (visible only after voting)
- **Admin Panel**: Manage board members, reset votes, delete applicants (admin only)
- **Testing Controls**: Admin can toggle "all votes complete" view for testing

## Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **Authentication**: AWS Cognito
- **Database**: DynamoDB
- **Hosting**: AWS S3
- **Icons**: Lucide React

## Setup Instructions

### 1. AWS Infrastructure Setup

First, set up the AWS infrastructure (DynamoDB, Cognito):

```bash
cd ../aws-setup

# Install dependencies for import script
npm install

# Create DynamoDB tables
chmod +x setup-dynamodb.sh
./setup-dynamodb.sh

# Create Cognito User Pool
chmod +x setup-cognito.sh
./setup-cognito.sh
```

The Cognito setup script will output configuration values. **Copy these values!**

### 2. Configure Environment Variables

Create a `.env` file in this directory:

```bash
cp .env.example .env
```

Edit `.env` and add the values from the Cognito setup script:

```env
REACT_APP_USER_POOL_ID=us-east-1_XXXXXXXXX
REACT_APP_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
REACT_APP_IDENTITY_POOL_ID=us-east-1:XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
REACT_APP_REGION=us-east-1
```

### 3. Create Admin User

Create the admin user in Cognito and DynamoDB:

```bash
# Replace YOUR_USER_POOL_ID with the actual value
aws cognito-idp admin-create-user \
    --user-pool-id YOUR_USER_POOL_ID \
    --username mike@manovermachine.com \
    --user-attributes Name=email,Value=mike@manovermachine.com Name=email_verified,Value=true Name=name,Value="Mike Freeman" \
    --message-action SUPPRESS

# Add to board members table
aws dynamodb put-item \
    --table-name ScholarshipBoardMembers \
    --item '{
        "email": {"S": "mike@manovermachine.com"},
        "name": {"S": "Mike Freeman"},
        "isAdmin": {"BOOL": true},
        "createdAt": {"S": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"}
    }'
```

### 4. Import Applicants

Import applicant data from CSV:

```bash
cd ../aws-setup
npm run import-applicants
```

### 5. Run Development Server

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000)

### 6. Deploy to Production

Build and deploy to S3:

```bash
# Build the app
npm run build

# Deploy to S3 (requires AWS CLI configured)
chmod +x deploy-to-s3.sh
./deploy-to-s3.sh
```

The app will be available at: `https://onemoredayapply.com/internalreview/`

## Usage

### For Board Members

1. **Login**: Use your email and temporary password (sent via email)
2. **Review & Vote**: 
   - Read applicant details
   - Add notes (visible to all board members)
   - Vote using the 0-10 slider
   - Confirm your vote (cannot be changed)
3. **Dashboard**: View rankings after you've voted on all applicants

### For Admin (mike@manovermachine.com)

Additional capabilities:

- **Admin Panel**: 
  - Add/remove board members
  - Reset votes for any applicant
  - Delete notes
  - Delete applicants
  - Toggle testing mode to preview "all votes complete" state

## Voting Rules

- Board members can see notes before voting
- Notes are shared among all board members
- Cannot change vote after submission
- Cannot see other board members' individual votes
- Can see average score after voting on that applicant
- Dashboard shows rankings only for applicants you've voted on

## Security

- Only invited board members can access the system
- Applicants cannot access the system (their emails are not granted access)
- Admin-only functions require `isAdmin: true` flag in DynamoDB
- All data stored in DynamoDB with proper IAM permissions

## Project Structure

```
scholarship-voting-crm/
├── src/
│   ├── components/
│   │   ├── AdminPanel.tsx       # Admin controls
│   │   ├── ApplicantDetail.tsx  # Full applicant profile modal
│   │   ├── Dashboard.tsx        # Rankings and stats
│   │   ├── NotesSection.tsx     # Notes UI
│   │   ├── VotingReview.tsx     # Main voting interface
│   │   └── VotingSlider.tsx     # 0-10 score slider
│   ├── services/
│   │   ├── cognito.ts           # Cognito user management
│   │   └── dynamodb.ts          # DynamoDB operations
│   ├── aws-config.ts            # AWS Amplify configuration
│   ├── types.ts                 # TypeScript interfaces
│   └── App.tsx                  # Main app component
├── aws-setup/                   # AWS infrastructure scripts
└── deploy-to-s3.sh             # Deployment script
```

## Troubleshooting

### Cannot authenticate
- Verify `.env` file has correct Cognito values
- Check that user exists in Cognito User Pool
- Ensure user is in `ScholarshipBoardMembers` DynamoDB table

### Cannot load data
- Verify DynamoDB tables exist
- Check AWS credentials have proper IAM permissions
- Ensure applicants were imported successfully

### Deployment issues
- Verify S3 bucket `onemoredayapply.com` exists
- Check AWS CLI is configured with proper credentials
- Ensure bucket allows public read access for the `/internalreview` path

## Support

For issues or questions, contact the development team.
