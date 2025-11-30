# AWS Setup for Scholarship Voting CRM

This directory contains scripts to set up the AWS infrastructure for the Scholarship Voting CRM.

## Prerequisites

- AWS CLI configured with appropriate credentials
- Node.js installed (for import script)

## Setup Steps

### 1. Create DynamoDB Tables

```bash
chmod +x setup-dynamodb.sh
./setup-dynamodb.sh
```

This creates four tables:
- **ScholarshipApplicants**: Stores applicant data
- **ScholarshipVotes**: Stores board member votes
- **ScholarshipNotes**: Stores notes on applicants
- **ScholarshipBoardMembers**: Stores board member information

### 2. Create Cognito User Pool

```bash
chmod +x setup-cognito.sh
./setup-cognito.sh
```

This creates:
- Cognito User Pool for authentication
- User Pool Client
- Identity Pool
- Saves configuration to `cognito-config.json`

**IMPORTANT**: Copy the output values to your React app's `.env` file.

### 3. Import Applicants from CSV

```bash
npm install
npm run import-applicants
```

This imports all applicants from `applicants.csv` into DynamoDB.

## Admin User Setup

After Cognito is created, create the admin user:

```bash
aws cognito-idp admin-create-user \
    --user-pool-id <YOUR_USER_POOL_ID> \
    --username mike@manovermachine.com \
    --user-attributes Name=email,Value=mike@manovermachine.com Name=email_verified,Value=true \
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

## Tables Schema

### ScholarshipApplicants
- `applicantId` (Primary Key): Unique identifier
- All applicant data from CSV (excluding review fields)

### ScholarshipVotes
- `voteId` (Primary Key): Unique identifier
- `applicantId`: Reference to applicant
- `boardMemberEmail`: Email of voter
- `score`: Vote score (0-10)
- `votedAt`: Timestamp

### ScholarshipNotes
- `noteId` (Primary Key): Unique identifier
- `applicantId`: Reference to applicant
- `boardMemberEmail`: Email of note author
- `boardMemberName`: Name of note author
- `content`: Note text
- `createdAt`: Timestamp

### ScholarshipBoardMembers
- `email` (Primary Key): Board member email
- `name`: Board member name
- `isAdmin`: Boolean flag
- `createdAt`: Timestamp
