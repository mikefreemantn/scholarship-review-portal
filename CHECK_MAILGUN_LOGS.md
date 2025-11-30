# How to Check Mailgun Email Logs

## Option 1: Mailgun Dashboard (Easiest)

1. Go to https://app.mailgun.com/
2. Log in with your Mailgun credentials
3. Click on **"Sending"** in the left sidebar
4. Click on **"Logs"**
5. You'll see all recent email attempts with:
   - Timestamp
   - Recipient email
   - Subject
   - Status (delivered, failed, etc.)
   - Any error messages

## Option 2: Check via API (if you have curl)

```bash
# List recent logs
curl -s --user 'api:YOUR_MAILGUN_API_KEY' \
     https://api.mailgun.net/v3/YOUR_DOMAIN/events \
     --get \
     --data-urlencode "begin=$(date -u -v-1H '+%a, %d %b %Y %H:%M:%S %Z')" \
     --data-urlencode "ascending=yes" \
     --data-urlencode "limit=25"
```

## What to Look For

### Successful Email:
- Status: "delivered" or "accepted"
- No error messages

### Failed Email - Common Issues:

1. **"Mailgun Sandbox" Error**
   - You're using a sandbox domain
   - Need to verify recipient email or upgrade to production

2. **"550 5.7.1" or "Rejected"**
   - Recipient's email server rejected it
   - Could be spam filter or invalid email

3. **"Domain not verified"**
   - Need to verify DNS records for your domain

4. **"Insufficient credits"**
   - Mailgun account needs more credits

## Quick Test

Try sending to a different email address (like a Gmail) to see if it's specific to mike@digigraph-design.com or a general issue.

## Current Configuration

- **Domain:** onemoredayontheappalachiantrail.com
- **From Email:** noreply@onemoredayontheappalachiantrail.com
- **API Key:** (stored in Lambda environment variables)

## Troubleshooting Steps

1. Check browser console for JavaScript errors
2. Check Mailgun dashboard logs
3. Check spam/junk folder
4. Verify email address is correct
5. Try sending to a different email address
6. Check if domain DNS is properly configured
