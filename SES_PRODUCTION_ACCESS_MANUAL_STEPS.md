# How to Request SES Production Access (Manual Steps)

## Current Status:
- ❌ **Previous request was DENIED** (Case ID: 176445442400144)
- 🔄 Need to submit a new, more detailed request

## Option 1: AWS Console (Recommended)

### Steps:

1. **Go to SES Console**
   - Visit: https://console.aws.amazon.com/ses/
   - Make sure you're in **us-east-2** region (top right)

2. **Navigate to Account Dashboard**
   - Click "Account dashboard" in the left sidebar
   - You'll see "Production access: Sandbox" status

3. **Request Production Access**
   - Click the **"Request production access"** button
   - This opens a form

4. **Fill Out the Form**

   **Mail type:** Transactional
   
   **Website URL:** https://voting.onemoredayontheatapply.com
   
   **Use case description:** (Copy this exactly)
   ```
   SCHOLARSHIP REVIEW BOARD EMAIL SYSTEM
   
   We operate the "One More Day on the Appalachian Trail" memorial scholarship review portal. This is a legitimate non-profit scholarship program that requires transactional email communication with our review board.
   
   EMAIL TYPES & RECIPIENTS:
   • Board Member Invitations: Welcome emails with secure login credentials
   • Voting Reminders: Notifications about pending applicant reviews  
   • Administrative Updates: Important announcements to the review board
   
   VOLUME & RECIPIENTS:
   • Total recipients: 10-20 board members (fixed, curated list)
   • Annual volume: Approximately 50-100 emails per year
   • All recipients have explicitly agreed to participate as board members
   • These emails are required for board members to perform their review duties
   
   COMPLIANCE:
   • Domain verified: onemoredayontheatapply.com with DKIM
   • All emails are permission-based and transactional
   • We monitor bounce/complaint rates
   • Proper authentication configured
   • Low-volume, legitimate use case
   
   This is NOT marketing email. These are essential administrative communications for a scholarship review process.
   ```

   **Additional email addresses:** (Leave blank or add your email)
   
   **Preferred contact language:** English

5. **Submit**
   - Click "Submit request"
   - You'll get a case number

6. **Wait for Response**
   - Usually takes 24-48 hours
   - Check your email for updates
   - AWS may ask follow-up questions

---

## Option 2: Contact AWS Support

If the form doesn't work or you get denied again:

1. Go to: https://console.aws.amazon.com/support/
2. Click "Create case"
3. Select "Service limit increase"
4. Choose "SES Sending Limits"
5. Explain your use case in detail

---

## Why Was It Denied?

Common reasons for denial:
- ❌ Too generic description
- ❌ Looks like marketing email
- ❌ New AWS account with no history
- ❌ Unclear use case
- ❌ Missing website/domain info

## How to Improve Your Request:

✅ **Be specific** about your use case
✅ **Emphasize transactional** nature (not marketing)
✅ **Show low volume** (50-100 emails/year)
✅ **Mention verified domain** and DKIM
✅ **Explain recipient consent** (board members)
✅ **Highlight non-profit** scholarship program

---

## Temporary Workaround (While Waiting):

Verify individual email addresses to send to them in sandbox mode:

```bash
# Verify your email
aws sesv2 create-email-identity --email-identity mike@digigraph-design.com --region us-east-2

# Verify each board member's email
aws sesv2 create-email-identity --email-identity boardmember@example.com --region us-east-2
```

Each person will get a verification email from AWS. Once they click the link, you can send to them even in sandbox mode.

---

## Alternative: Use a Different Email Service

If SES continues to deny:

1. **SendGrid** - Free tier: 100 emails/day
2. **Mailgun** - (if they reactivate your account)
3. **Postmark** - Good for transactional emails
4. **Amazon Pinpoint** - Alternative AWS service

---

## Next Steps:

1. ✅ Go to SES Console and submit new request with detailed description above
2. ⏳ Wait 24-48 hours for AWS response
3. 📧 Meanwhile, verify individual board member emails as workaround
4. 🔄 If denied again, contact AWS Support directly

**Important:** Be patient and provide as much detail as possible. AWS is cautious about email abuse, but legitimate use cases like yours should be approved with proper explanation.
