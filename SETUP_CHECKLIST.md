# Setup Checklist - Scholarship Voting CRM

Use this checklist to set up your voting system step by step.

## Pre-Setup ✓

- [ ] AWS CLI installed and configured (`aws configure`)
- [ ] Node.js installed (v14 or higher)
- [ ] Access to AWS account with admin permissions
- [ ] S3 bucket `onemoredayapply.com` exists

## Phase 1: AWS Infrastructure (15 minutes)

### DynamoDB Tables
- [ ] Navigate to `aws-setup` directory
- [ ] Run `npm install`
- [ ] Run `chmod +x setup-dynamodb.sh`
- [ ] Run `./setup-dynamodb.sh`
- [ ] Verify 4 tables created in AWS Console:
  - [ ] ScholarshipApplicants
  - [ ] ScholarshipVotes
  - [ ] ScholarshipNotes
  - [ ] ScholarshipBoardMembers

### Cognito User Pool
- [ ] Run `chmod +x setup-cognito.sh`
- [ ] Run `./setup-cognito.sh`
- [ ] **SAVE THE OUTPUT** - you'll need these values:
  - [ ] REACT_APP_USER_POOL_ID
  - [ ] REACT_APP_CLIENT_ID
  - [ ] REACT_APP_IDENTITY_POOL_ID
- [ ] Verify User Pool created in AWS Console

## Phase 2: React App Configuration (5 minutes)

- [ ] Navigate to `scholarship-voting-crm` directory
- [ ] Run `cp .env.example .env`
- [ ] Edit `.env` file with values from Cognito setup
- [ ] Verify all environment variables are set

## Phase 3: Admin User Setup (5 minutes)

Replace `YOUR_USER_POOL_ID` with actual value in these commands:

- [ ] Create Cognito user:
```bash
aws cognito-idp admin-create-user \
    --user-pool-id YOUR_USER_POOL_ID \
    --username mike@manovermachine.com \
    --user-attributes Name=email,Value=mike@manovermachine.com Name=email_verified,Value=true Name=name,Value="Mike Freeman" \
    --message-action SUPPRESS
```

- [ ] Add to DynamoDB:
```bash
aws dynamodb put-item \
    --table-name ScholarshipBoardMembers \
    --item '{
        "email": {"S": "mike@manovermachine.com"},
        "name": {"S": "Mike Freeman"},
        "isAdmin": {"BOOL": true},
        "createdAt": {"S": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"}
    }'
```

- [ ] Set password:
```bash
aws cognito-idp admin-set-user-password \
    --user-pool-id YOUR_USER_POOL_ID \
    --username mike@manovermachine.com \
    --password "TempPassword123!" \
    --permanent
```

## Phase 4: Import Data (5 minutes)

- [ ] Navigate to `aws-setup` directory
- [ ] Run `npm run import-applicants`
- [ ] Verify import completed successfully (should see "Import complete!")
- [ ] Check AWS Console - ScholarshipApplicants table should have 13 items

## Phase 5: Local Testing (10 minutes)

- [ ] Navigate to `scholarship-voting-crm` directory
- [ ] Run `npm install` (first time only)
- [ ] Run `npm start`
- [ ] Open http://localhost:3000
- [ ] Login with:
  - Email: `mike@manovermachine.com`
  - Password: `TempPassword123!`
- [ ] Verify you can see:
  - [ ] 13 applicants in voting interface
  - [ ] Admin tab in navigation
  - [ ] Your name in header

### Test Core Features
- [ ] Click "View Full Profile" on an applicant
- [ ] Add a test note
- [ ] Vote on one applicant (use slider, confirm)
- [ ] Check Dashboard tab (should show 1 voted, 12 remaining)
- [ ] Go to Admin tab
- [ ] Toggle "View as All Votes Complete"
- [ ] Verify Dashboard now shows rankings

## Phase 6: Production Deployment (10 minutes)

- [ ] Navigate to `scholarship-voting-crm` directory
- [ ] Run `npm run build`
- [ ] Verify build completed successfully
- [ ] Run `chmod +x deploy-to-s3.sh`
- [ ] Run `./deploy-to-s3.sh`
- [ ] Verify deployment completed
- [ ] Open https://onemoredayapply.com/internalreview/
- [ ] Test login on production site

## Phase 7: Board Member Setup (As Needed)

For each board member:

- [ ] Login as admin
- [ ] Go to Admin tab
- [ ] Click "Add New Board Member"
- [ ] Enter their email and full name
- [ ] Click "Invite Board Member"
- [ ] Verify they receive email with temporary password
- [ ] Have them login and change password

## Phase 8: Final Verification

- [ ] All board members can login
- [ ] All applicants are visible
- [ ] Voting works correctly
- [ ] Notes are shared between users
- [ ] Dashboard shows rankings after voting
- [ ] Admin controls work

## Troubleshooting Checklist

If something doesn't work:

### Cannot authenticate
- [ ] Check `.env` file has correct values
- [ ] Verify user exists in Cognito
- [ ] Check user is in ScholarshipBoardMembers table
- [ ] Try resetting password

### Cannot see applicants
- [ ] Verify import script ran successfully
- [ ] Check ScholarshipApplicants table in DynamoDB
- [ ] Check browser console for errors
- [ ] Verify AWS credentials are valid

### Deployment fails
- [ ] Verify S3 bucket exists
- [ ] Check AWS CLI credentials
- [ ] Ensure bucket has correct permissions
- [ ] Try building locally first (`npm run build`)

### Admin features not showing
- [ ] Verify `isAdmin: true` in DynamoDB for your user
- [ ] Clear browser cache and reload
- [ ] Check browser console for errors

## Post-Setup Tasks

- [ ] Change admin password to something secure
- [ ] Add all board members
- [ ] Send board members instructions
- [ ] Set voting deadline
- [ ] Monitor progress through Admin panel

## Support

- See `QUICK_START.md` for detailed setup instructions
- See `PROJECT_SUMMARY.md` for system overview
- See `scholarship-voting-crm/README.md` for full documentation

## Notes

Use this space to track your setup progress:

```
Setup started: _______________
Completed: _______________
Issues encountered: _______________
_______________________________________________
_______________________________________________
```
