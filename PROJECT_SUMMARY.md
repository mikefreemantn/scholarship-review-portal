# Scholarship Voting CRM - Project Summary

## What We Built

A complete, production-ready scholarship voting system for the One More Day on the AT board to review and vote on applicants.

## Key Features Implemented

### ✅ Authentication & Security
- **AWS Cognito** integration for secure login
- Board members only (applicants cannot access)
- Admin role with special permissions for mike@manovermachine.com

### ✅ Voting System
- **0-10 sliding scale** with visual feedback
- **Confirmation required** before vote submission
- **One vote per applicant** - cannot be changed after submission
- **Vote privacy** - board members cannot see individual votes, only averages

### ✅ Notes System
- **Shared notes** visible to all board members
- Add notes before or during voting
- View notes from other board members
- Admin can delete any note

### ✅ Dashboard & Rankings
- **Smart visibility**: Only shows rankings for applicants you've voted on
- **Real-time statistics**: Total applicants, voted count, remaining
- **Ranked list** with average scores
- **Click to view** full applicant profiles

### ✅ Admin Panel (mike@manovermachine.com only)
- **Board Member Management**: Add/remove board members via Cognito
- **Reset Controls**: Reset votes, delete notes, delete applicants
- **Testing Mode**: Toggle to preview "all votes complete" state
- **Full oversight** of the voting process

### ✅ Applicant Review Interface
- **Full profile view** with all application details
- **Progress tracking** - see how many applicants remaining
- **Navigation** - move between applicants
- **Quick preview** before voting

## Technical Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Frontend                          │
│              (TypeScript + Tailwind CSS)                    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    AWS Amplify                              │
│              (Authentication & SDK)                         │
└─────────────────────────────────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            ▼               ▼               ▼
    ┌──────────┐    ┌──────────┐    ┌──────────┐
    │ Cognito  │    │ DynamoDB │    │    S3    │
    │  Users   │    │  Tables  │    │ Hosting  │
    └──────────┘    └──────────┘    └──────────┘
```

## Database Schema

### DynamoDB Tables

1. **ScholarshipApplicants**
   - Stores all applicant data from CSV
   - Excludes review status fields

2. **ScholarshipVotes**
   - Links board member to applicant with score
   - Indexed by applicant and board member

3. **ScholarshipNotes**
   - Shared notes on applicants
   - Indexed by applicant

4. **ScholarshipBoardMembers**
   - Board member profiles
   - Admin flag for special permissions

## File Structure

```
VotingREeview/
├── applicants.csv                    # Source data
├── QUICK_START.md                    # Setup guide
├── PROJECT_SUMMARY.md                # This file
│
├── aws-setup/                        # AWS infrastructure
│   ├── setup-dynamodb.sh            # Creates DynamoDB tables
│   ├── setup-cognito.sh             # Creates Cognito User Pool
│   ├── import-applicants.js         # Imports CSV to DynamoDB
│   ├── package.json                 # Node dependencies
│   └── README.md                    # AWS setup docs
│
└── scholarship-voting-crm/          # React application
    ├── src/
    │   ├── components/
    │   │   ├── AdminPanel.tsx       # Admin controls
    │   │   ├── ApplicantDetail.tsx  # Full profile modal
    │   │   ├── Dashboard.tsx        # Rankings view
    │   │   ├── NotesSection.tsx     # Notes UI
    │   │   ├── VotingReview.tsx     # Main voting interface
    │   │   └── VotingSlider.tsx     # Score slider
    │   ├── services/
    │   │   ├── cognito.ts           # User management
    │   │   └── dynamodb.ts          # Database operations
    │   ├── aws-config.ts            # AWS configuration
    │   ├── types.ts                 # TypeScript types
    │   └── App.tsx                  # Main app
    ├── deploy-to-s3.sh              # Deployment script
    ├── .env.example                 # Environment template
    └── README.md                    # Full documentation
```

## Voting Rules Implemented

| Rule | Implementation |
|------|----------------|
| One vote per applicant | ✅ Vote stored with unique key: `{email}-{applicantId}` |
| Cannot change vote | ✅ No update function, only create |
| See notes before voting | ✅ Notes displayed on voting page |
| Notes are shared | ✅ All board members see all notes |
| Cannot see individual votes | ✅ Only average score shown |
| See average after voting | ✅ Dashboard shows averages for voted applicants |
| Must vote on all applicants | ✅ Dashboard only shows after all votes complete |

## Admin Features

### Board Member Management
- Invite new board members (creates Cognito user + DynamoDB entry)
- Remove board members (deletes from both systems)
- View all board members

### Testing Controls
- **Toggle "All Votes Complete"**: Preview dashboard without voting on all applicants
- Useful for testing the final view

### Data Management
- **Reset Votes**: Delete all votes for an applicant
- **Delete Notes**: Remove all notes for an applicant
- **Delete Applicant**: Permanently remove applicant and all associated data

## Security Features

1. **Authentication Required**: AWS Cognito enforces login
2. **Board Members Only**: Only invited users can access
3. **Admin Flag**: Special permissions stored in DynamoDB
4. **No Applicant Access**: Applicant emails are NOT invited to Cognito
5. **HTTPS**: Hosted on S3 with CloudFront (when configured)

## Deployment Path

The application will be deployed to:
```
https://onemoredayapply.com/internalreview/
```

This keeps it separate from your main site content.

## What's Next

### Immediate Setup (30-60 minutes)
1. Run AWS setup scripts to create infrastructure
2. Configure environment variables
3. Create admin user
4. Import applicant data
5. Test locally
6. Deploy to S3

### Before Board Review
1. Add all board members via Admin panel
2. Test voting workflow with a test user
3. Verify email invitations are working
4. Review applicant data for accuracy

### During Review Period
1. Monitor votes through Admin panel
2. Answer board member questions
3. Reset votes if needed (testing only)

### After Voting Complete
1. Export final rankings from Dashboard
2. Review notes from board members
3. Make final decision
4. Archive data for records

## Support & Maintenance

### Common Admin Tasks

**Add a board member:**
```
Admin Panel → Add New Board Member → Enter email/name → Invite
```

**Reset someone's vote:**
```
Admin Panel → Applicant Management → Reset Votes
```

**View rankings:**
```
Dashboard tab (after voting on all applicants)
```

**Toggle testing mode:**
```
Admin Panel → Testing Controls → Click toggle
```

### Troubleshooting

**Board member can't login:**
- Check they're in Cognito User Pool
- Verify they're in ScholarshipBoardMembers table
- Resend temporary password

**Votes not saving:**
- Check browser console for errors
- Verify AWS credentials are valid
- Check DynamoDB table permissions

**Dashboard not showing:**
- Ensure all applicants have been voted on
- Or use Admin testing toggle to preview

## Cost Estimate

With AWS Free Tier:
- **DynamoDB**: Free (under 25GB, 25 WCU/RCU)
- **Cognito**: Free (under 50,000 MAU)
- **S3**: ~$0.50/month (minimal traffic)
- **Total**: < $1/month for typical usage

## Future Enhancements (Optional)

- Email notifications when all board members have voted
- Export rankings to PDF
- Multi-year support (archive previous years)
- Applicant portal (separate system)
- Analytics dashboard (vote distribution, time to vote, etc.)

## Acknowledgments

Built for **One More Day on the AT** - honoring Nate's memory by helping hikers achieve their dreams on the Appalachian Trail.
