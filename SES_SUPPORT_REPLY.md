# Reply to AWS SES Support Case

**Copy and paste this as your reply to the AWS support email:**

---

Hello,

Thank you for reviewing our request. I'm happy to provide detailed information about our email use case.

## Use Case Overview

We operate the "One More Day on the Appalachian Trail" memorial scholarship review portal at https://voting.onemoredayontheatapply.com. This is a non-profit scholarship program that requires transactional email communication with our review board members.

## Email Sending Frequency & Volume

**Annual Volume:** Approximately 50-100 emails per year
**Recipients:** 10-20 board members (fixed, curated list)
**Frequency:** 
- Initial board member invitations: Once per member when they join
- Voting reminders: 2-3 times during the annual review period (typically 2-3 weeks)
- Administrative updates: Occasional, as needed (1-2 times per year)

This is very low-volume, transactional email for a small group of participants.

## Types of Emails We Send

### 1. Board Member Welcome Emails
Sent when a new board member is invited to join the review process. Contains:
- Welcome message explaining the scholarship program
- Secure login credentials for the review portal
- Link to access the portal
- Instructions for getting started

### 2. Voting Reminder Emails
Sent to board members who have pending applicant reviews. Contains:
- Number of applicants awaiting review
- List of applicant names
- Link to the review portal
- Optional custom message from administrator

### 3. Administrative Messages
Occasional updates about the scholarship process, deadlines, or important announcements.

## Recipient List Management

**How we maintain our list:**
- Board members are manually invited by the scholarship administrator
- Each member explicitly agrees to participate in the review process
- We maintain a database of active board members in AWS DynamoDB
- Members are removed from the list when they leave the board
- List is small (10-20 people) and carefully curated

**Recipient consent:**
- All recipients have explicitly agreed to participate as board members
- These emails are required for them to perform their review duties
- Recipients expect and need these emails to access the review portal

## Bounce & Complaint Management

**Bounce handling:**
- We use SES's built-in bounce tracking
- Invalid email addresses are flagged and removed from our system
- Board member contact information is verified before invitation

**Complaint handling:**
- We monitor complaint rates through SES
- Any complaints would be investigated immediately
- Given our small recipient list, we have direct contact with all recipients

**Unsubscribe requests:**
- These are administrative emails required for board participation
- Unsubscribe = resignation from the review board
- Handled manually through direct communication with administrator
- Not applicable in the traditional marketing sense

## Email Quality & Content

All emails are:
- Professionally designed with our scholarship branding
- Clear, concise, and relevant to the scholarship review process
- Transactional in nature (not promotional or marketing)
- Sent only when necessary for the review process
- Expected and welcomed by recipients

**Example email content:** Our welcome email includes the scholarship program name, login credentials, portal link, and instructions. Our reminder emails include the number of pending reviews, applicant names, and a link to the portal.

## Domain Verification

✅ **Domain verified:** onemoredayontheatapply.com
✅ **DKIM enabled:** All three DKIM records configured in Route53
✅ **Verification status:** SUCCESS (verified on 2025-11-29)

You can verify this in our account - the domain is fully verified and ready for sending.

## Technical Setup

- **From address:** noreply@onemoredayontheatapply.com
- **Authentication:** DKIM enabled
- **DNS:** All records properly configured in Route53
- **Application:** React frontend with AWS Cognito authentication
- **Email service:** AWS SES (switching from Mailgun)

## Why We Need Production Access

We are currently in sandbox mode, which requires us to verify each board member's email individually. This creates friction in our onboarding process:

1. Administrator invites board member
2. Board member must verify their email with AWS before receiving credentials
3. This adds an extra step and causes confusion

With production access, we can send directly to board members when they're invited, providing a seamless onboarding experience.

## Commitment to Best Practices

We commit to:
- Monitoring bounce and complaint rates
- Maintaining accurate recipient lists
- Sending only necessary, transactional emails
- Following AWS SES best practices
- Responding promptly to any delivery issues

## Summary

This is a legitimate, low-volume, transactional email use case for a non-profit scholarship program. We have:
- ✅ Verified domain with DKIM
- ✅ Small, permission-based recipient list
- ✅ Clear transactional purpose
- ✅ Proper bounce/complaint handling
- ✅ Professional email content
- ✅ Very low volume (50-100 emails/year)

We would greatly appreciate production access to provide a better experience for our scholarship review board members.

Please let me know if you need any additional information.

Thank you for your consideration.

Best regards,
[Your Name]

---

**After sending this reply, you should get approved within 24 hours!**
