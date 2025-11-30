# System Overview - Scholarship Voting CRM

## User Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         BOARD MEMBER                            │
│                    (Invited via Admin)                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Login Screen    │
                    │  (AWS Cognito)   │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │   Main App       │
                    │   3 Tabs:        │
                    │   - Review/Vote  │
                    │   - Dashboard    │
                    │   - Admin*       │
                    └──────────────────┘
                              │
                ┌─────────────┼─────────────┐
                ▼             ▼             ▼
        ┌──────────┐  ┌──────────┐  ┌──────────┐
        │  REVIEW  │  │DASHBOARD │  │  ADMIN*  │
        │  & VOTE  │  │          │  │          │
        └──────────┘  └──────────┘  └──────────┘
```

## Review & Vote Flow

```
START
  │
  ▼
┌─────────────────────────────────────┐
│ View Applicant Profile              │
│ - Name, location, contact           │
│ - About them                        │
│ - Why they applied                  │
│ - Challenges they face              │
│ - Their inspiration                 │
│ - What they wish for                │
└─────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────┐
│ Read Notes from Other Board Members│
│ (Shared, visible to all)            │
└─────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────┐
│ Add Your Own Note (Optional)        │
│ - Visible to all board members      │
└─────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────┐
│ Vote Using Slider (0-10)            │
│ - Drag slider to select score       │
│ - See score in real-time            │
└─────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────┐
│ Confirm Vote                        │
│ ⚠️  Cannot be changed!              │
└─────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────┐
│ Move to Next Applicant              │
│ OR                                  │
│ Go to Dashboard (if all voted)      │
└─────────────────────────────────────┘
```

## Dashboard Flow

```
┌─────────────────────────────────────┐
│ Can Only Access After:              │
│ ✓ Voted on ALL applicants           │
│ OR                                  │
│ ✓ Admin toggles testing mode        │
└─────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────┐
│ Statistics Overview                 │
│ - Total applicants                  │
│ - Number you've voted on            │
│ - Number remaining                  │
└─────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────┐
│ Ranked List                         │
│ #1 - Highest average score          │
│ #2 - Second highest                 │
│ #3 - Third highest                  │
│ ...                                 │
│                                     │
│ Shows:                              │
│ - Rank (with trophy icons)          │
│ - Name & location                   │
│ - Average score                     │
│ - Number of votes                   │
└─────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────┐
│ Click Any Applicant                 │
│ → View Full Profile                 │
│ → See Average Score                 │
└─────────────────────────────────────┘
```

## Admin Panel Flow (mike@manovermachine.com only)

```
┌─────────────────────────────────────┐
│ TESTING CONTROLS                    │
│ - Toggle "All Votes Complete" view  │
│   (Preview dashboard without voting)│
└─────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────┐
│ BOARD MEMBER MANAGEMENT             │
│                                     │
│ Add Member:                         │
│ 1. Enter email & name               │
│ 2. System creates Cognito user      │
│ 3. Sends invitation email           │
│ 4. Adds to DynamoDB                 │
│                                     │
│ Remove Member:                      │
│ 1. Click delete                     │
│ 2. Removes from Cognito             │
│ 3. Removes from DynamoDB            │
└─────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────┐
│ APPLICANT MANAGEMENT                │
│                                     │
│ For Each Applicant:                 │
│ - Reset Votes (delete all votes)    │
│ - Delete Notes (delete all notes)   │
│ - Delete Applicant (permanent)      │
└─────────────────────────────────────┘
```

## Data Flow

```
┌──────────────┐
│   Browser    │
│  (React App) │
└──────────────┘
       │
       │ AWS Amplify SDK
       │
       ▼
┌──────────────────────────────────────────────┐
│            AWS Services                      │
│                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Cognito  │  │ DynamoDB │  │    S3    │  │
│  │          │  │          │  │          │  │
│  │ - Login  │  │ - Votes  │  │ - Host   │  │
│  │ - Users  │  │ - Notes  │  │ - Files  │  │
│  │ - Auth   │  │ - Data   │  │          │  │
│  └──────────┘  └──────────┘  └──────────┘  │
└──────────────────────────────────────────────┘
```

## Security Model

```
┌─────────────────────────────────────────────┐
│              AUTHENTICATION                 │
│                                             │
│  Cognito User Pool                          │
│  - Only invited emails can login            │
│  - Applicant emails NOT invited             │
│  - Temporary password on first login        │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│              AUTHORIZATION                  │
│                                             │
│  DynamoDB: ScholarshipBoardMembers          │
│  - email (primary key)                      │
│  - name                                     │
│  - isAdmin (boolean)                        │
│                                             │
│  If isAdmin = true:                         │
│    → Show Admin tab                         │
│    → Allow board member management          │
│    → Allow data reset/delete                │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│              DATA ACCESS                    │
│                                             │
│  Board Member Can:                          │
│  ✓ View all applicants                      │
│  ✓ Vote on applicants (once each)           │
│  ✓ Add notes (unlimited)                    │
│  ✓ View all notes                           │
│  ✓ View average scores (after voting)       │
│  ✗ See individual votes                     │
│  ✗ Change their vote                        │
│                                             │
│  Admin Can (in addition):                   │
│  ✓ Add/remove board members                 │
│  ✓ Reset votes                              │
│  ✓ Delete notes                             │
│  ✓ Delete applicants                        │
│  ✓ Toggle testing mode                      │
└─────────────────────────────────────────────┘
```

## Vote Privacy Model

```
SCENARIO: 3 board members vote on Applicant A

┌─────────────────────────────────────────────┐
│  Board Member 1 votes: 8                    │
│  Board Member 2 votes: 9                    │
│  Board Member 3 votes: 7                    │
│                                             │
│  Average: 8.0                               │
└─────────────────────────────────────────────┘

WHAT EACH BOARD MEMBER SEES:

Before voting on Applicant A:
  → Cannot see dashboard for Applicant A
  → Can see notes from others

After voting on Applicant A:
  → Can see average score: 8.0
  → Can see total votes: 3
  → CANNOT see individual scores (8, 9, 7)
  → Can see their own vote in their records

This prevents bias and ensures independent evaluation.
```

## Voting Progress Tracking

```
Total Applicants: 13

Board Member Status:
┌────────────────┬─────────┬───────────┬────────────┐
│ Board Member   │ Voted   │ Remaining │ Progress   │
├────────────────┼─────────┼───────────┼────────────┤
│ Mike (Admin)   │   5     │     8     │ ████░░░░   │
│ Sarah          │  13     │     0     │ ████████   │
│ John           │   2     │    11     │ █░░░░░░░   │
│ Lisa           │   0     │    13     │ ░░░░░░░░   │
└────────────────┴─────────┴───────────┴────────────┘

Admin can see this in Admin Panel
Board members only see their own progress
```

## Deployment Architecture

```
┌─────────────────────────────────────────────┐
│         Developer Machine                   │
│                                             │
│  1. npm run build                           │
│  2. ./deploy-to-s3.sh                       │
└─────────────────────────────────────────────┘
                    │
                    │ AWS CLI
                    ▼
┌─────────────────────────────────────────────┐
│         S3 Bucket                           │
│         onemoredayapply.com                 │
│                                             │
│  /                  (main site)             │
│  /internalreview/   (voting CRM) ← HERE     │
└─────────────────────────────────────────────┘
                    │
                    │ HTTPS
                    ▼
┌─────────────────────────────────────────────┐
│         Board Members                       │
│                                             │
│  https://onemoredayapply.com/internalreview │
└─────────────────────────────────────────────┘
```

## Key Design Decisions

### Why AWS Cognito?
- Handles authentication securely
- Email-based invitations
- Temporary passwords
- No need to build custom auth

### Why DynamoDB?
- Serverless (no server management)
- Pay per request (very cheap for small scale)
- Fast queries with indexes
- Scales automatically

### Why S3 Hosting?
- Static site (React build)
- Very cheap (~$0.50/month)
- Reliable
- Easy deployment

### Why Separate /internalreview Path?
- Keeps voting system separate from main site
- Easy to manage permissions
- Clear separation of concerns
- Can delete after voting season

## Success Metrics

The system is working correctly when:

✓ Board members can login
✓ All 13 applicants are visible
✓ Votes are saved and cannot be changed
✓ Notes are shared between board members
✓ Dashboard shows rankings after all votes
✓ Admin can manage board members
✓ No applicants can access the system
