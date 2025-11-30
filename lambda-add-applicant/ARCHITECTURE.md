# Architecture Overview

## Current Manual Process (Before)
```
Applicant fills form
    ↓
Export to CSV
    ↓
Manually import to DynamoDB
    ↓
Applicant appears in portal
```

## New Automated Process (After)
```
Applicant fills Zapier form
    ↓
Zapier webhook triggers
    ↓
API Gateway receives POST
    ↓
Lambda function executes
    ↓
Validates required fields
    ↓
Generates unique applicantId
    ↓
Writes to DynamoDB
    ↓
Applicant INSTANTLY appears in portal
```

## Components

### 1. Zapier Form
- Your existing form (Google Forms, Typeform, etc.)
- Collects applicant information
- Triggers on new submission

### 2. Zapier Webhook
- Sends POST request to API Gateway
- Maps form fields to JSON payload
- Runs automatically on each submission

### 3. API Gateway
- Public HTTPS endpoint
- Routes requests to Lambda
- Handles CORS for security
- URL format: `https://[id].execute-api.us-east-2.amazonaws.com/prod/add-applicant`

### 4. Lambda Function
- Node.js 18.x runtime
- Validates incoming data
- Generates UUID for applicantId
- Adds timestamp
- Writes to DynamoDB
- Returns success/error response

### 5. DynamoDB Table
- Table: `ScholarshipApplicants`
- Primary Key: `applicantId` (String)
- Stores all applicant data
- Same table your portal reads from

### 6. Voting Portal
- Automatically shows new applicants
- No changes needed
- Real-time updates

## Data Flow

### Request Format (from Zapier)
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "555-1234",
  "address": "123 Main St",
  "city": "Springfield",
  "state": "IL",
  "zipCode": "62701",
  ...
}
```

### Lambda Processing
1. Parse JSON body
2. Validate required fields
3. Generate `applicantId` using UUID
4. Add `submittedAt` timestamp
5. Add `status: "pending"`
6. Write to DynamoDB

### DynamoDB Item
```json
{
  "applicantId": "550e8400-e29b-41d4-a716-446655440000",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "submittedAt": "2025-11-27T22:30:00.000Z",
  "status": "pending",
  ...
}
```

### Response to Zapier
```json
{
  "success": true,
  "message": "Applicant added successfully",
  "applicantId": "550e8400-e29b-41d4-a716-446655440000"
}
```

## Security

- **API Gateway**: Public but validates requests
- **Lambda**: Minimal IAM permissions (DynamoDB PutItem only)
- **CORS**: Configured to allow Zapier
- **Validation**: Required fields checked
- **Logging**: All requests logged to CloudWatch

## Monitoring

### CloudWatch Logs
- Every request logged
- Error details captured
- Search by applicant email

### DynamoDB Metrics
- Track write capacity
- Monitor for throttling
- View item count

### Zapier Task History
- See all submissions
- Failed tasks highlighted
- Retry failed submissions

## Cost Estimate

**Very low cost for typical usage:**

- **API Gateway**: $3.50 per million requests
- **Lambda**: First 1M requests free, then $0.20 per 1M
- **DynamoDB**: On-demand pricing, ~$1.25 per million writes
- **CloudWatch Logs**: First 5GB free

**Example:** 100 applicants/month = essentially free
