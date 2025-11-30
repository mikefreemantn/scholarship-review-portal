# Scholarship Applicant Auto-Add System

This Lambda function automatically adds scholarship applicants to your DynamoDB database when they submit your Zapier form.

## Quick Start

### 1. Deploy Lambda Function
Follow the detailed steps in `DEPLOYMENT.md`

**TL;DR:**
```bash
cd lambda-add-applicant
npm install
zip -r function.zip index.js node_modules package.json
```
Then upload to AWS Lambda and configure API Gateway.

### 2. Get Your API Endpoint
After deploying, you'll get a URL like:
```
https://abc123xyz.execute-api.us-east-2.amazonaws.com/prod/add-applicant
```

### 3. Configure Zapier

**Trigger:** Your form submission (Google Forms, Typeform, etc.)

**Action:** Webhooks by Zapier → POST

**URL:** Your API endpoint from step 2

**Data:** Map your form fields to these keys:
- `firstName` (required)
- `lastName` (required)
- `email` (required)
- `phone` (required)
- `address` (required)
- Plus any optional fields (see DEPLOYMENT.md)

### 4. Test It!
Submit a test form and check:
1. Zapier Task History (should show success)
2. DynamoDB table (applicant should appear)
3. Your voting portal (applicant should be visible)

## How It Works

```
Form Submission → Zapier → API Gateway → Lambda → DynamoDB
```

1. User fills out your Zapier form
2. Zapier sends data to your API endpoint
3. API Gateway triggers Lambda function
4. Lambda validates data and generates unique ID
5. Lambda adds applicant to DynamoDB
6. Applicant immediately appears in your voting portal

## Benefits

✅ **Automatic** - No more manual CSV imports
✅ **Real-time** - Applicants appear instantly
✅ **Validated** - Required fields are checked
✅ **Unique IDs** - Auto-generated for each applicant
✅ **Timestamped** - Tracks when submitted
✅ **Error handling** - Logs issues for debugging

## Security

- API is public but validates all data
- Lambda has minimal DynamoDB permissions
- CORS configured for safety
- All submissions logged in CloudWatch

## Monitoring

Check Lambda CloudWatch logs to see:
- All submissions
- Any errors
- Validation failures

## Support

If applicants aren't showing up, check:
1. Zapier Task History for errors
2. Lambda CloudWatch logs
3. DynamoDB table directly
4. API Gateway configuration

See `DEPLOYMENT.md` for detailed troubleshooting.
