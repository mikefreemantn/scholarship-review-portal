# SES Domain Verification - DNS Records Required

## Domain: onemoredayontheatapply.com

You need to add these **3 CNAME records** to your DNS (wherever you manage onemoredayontheatapply.com):

### DKIM Record 1:
- **Type:** CNAME
- **Name:** `mznnpddvh3phsmh4k7bzyghglu2meer6._domainkey.onemoredayontheatapply.com`
- **Value:** `mznnpddvh3phsmh4k7bzyghglu2meer6.dkim.amazonses.com`

### DKIM Record 2:
- **Type:** CNAME
- **Name:** `7hj6tiryn7qrexvhz5s2zvb7e6zv5slm._domainkey.onemoredayontheatapply.com`
- **Value:** `7hj6tiryn7qrexvhz5s2zvb7e6zv5slm.dkim.amazonses.com`

### DKIM Record 3:
- **Type:** CNAME
- **Name:** `fimnnu3issb5ruhm3c4dtshbv3l2qzt6._domainkey.onemoredayontheatapply.com`
- **Value:** `fimnnu3issb5ruhm3c4dtshbv3l2qzt6.dkim.amazonses.com`

---

## Steps to Add DNS Records:

1. Go to your DNS provider (GoDaddy, Cloudflare, Route53, etc.)
2. Find DNS management for `onemoredayontheatapply.com`
3. Add the 3 CNAME records above
4. Wait 10-30 minutes for DNS propagation
5. SES will automatically verify once DNS is detected

---

## Check Verification Status:

Run this command to check if it's verified:
```bash
aws sesv2 get-email-identity --email-identity onemoredayontheatapply.com --region us-east-2
```

Look for: `"VerifiedForSendingStatus": true`

---

## Important Notes:

- **Still in Sandbox:** Even after domain verification, you're still in SES sandbox mode
- **Sandbox Limitations:** Can only send to verified email addresses
- **To Send to Anyone:** Need to request production access (takes 24-48 hours)

---

## Temporary Workaround (While in Sandbox):

You can verify individual email addresses to send to them:

```bash
aws sesv2 create-email-identity --email-identity mike@digigraph-design.com --region us-east-2
```

Then check that email for a verification link from AWS.

---

## Request Production Access:

Once domain is verified, request production access:

1. Go to: https://console.aws.amazon.com/ses/
2. Click "Account dashboard" in left sidebar
3. Click "Request production access"
4. Fill out the form explaining your use case
5. AWS typically approves within 24-48 hours
