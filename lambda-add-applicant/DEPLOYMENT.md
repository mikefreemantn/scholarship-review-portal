# Deploy Add Applicant Lambda Function

## Step 1: Install Dependencies and Package

```bash
cd lambda-add-applicant
npm install
zip -r function.zip index.js node_modules package.json
```

## Step 2: Create Lambda Function in AWS Console

1. Go to AWS Lambda Console: https://console.aws.amazon.com/lambda
2. Click "Create function"
3. Choose "Author from scratch"
4. Function name: `AddScholarshipApplicant`
5. Runtime: **Node.js 18.x** (or latest)
6. Architecture: x86_64
7. Click "Create function"

## Step 3: Upload Code

1. In the Lambda function page, go to "Code" tab
2. Click "Upload from" → ".zip file"
3. Upload the `function.zip` file you created
4. Click "Save"

## Step 4: Configure Environment Variables

1. Go to "Configuration" tab → "Environment variables"
2. Click "Edit"
3. Add:
   - Key: `APPLICANTS_TABLE`
   - Value: `ScholarshipApplicants`
4. Click "Save"

## Step 5: Set IAM Permissions

1. Go to "Configuration" tab → "Permissions"
2. Click on the role name (it will open IAM)
3. Click "Add permissions" → "Attach policies"
4. Search for and attach: `AmazonDynamoDBFullAccess`
   - OR create a custom policy with just PutItem permission for ScholarshipApplicants table
5. Click "Add permissions"

## Step 6: Create API Gateway

1. Go to API Gateway Console: https://console.aws.amazon.com/apigateway
2. Click "Create API"
3. Choose "HTTP API" → "Build"
4. Click "Add integration"
5. Select "Lambda"
6. Choose your region (us-east-2)
7. Select the Lambda function: `AddScholarshipApplicant`
8. API name: `ScholarshipApplicantAPI`
9. Click "Next"

## Step 7: Configure Routes

1. Method: `POST`
2. Resource path: `/add-applicant`
3. Integration target: Your Lambda function
4. Click "Next"

## Step 8: Configure CORS

1. Click "Configure CORS"
2. Access-Control-Allow-Origin: `*`
3. Access-Control-Allow-Headers: `content-type,x-api-key`
4. Access-Control-Allow-Methods: `POST,OPTIONS`
5. Click "Next"

## Step 9: Deploy

1. Stage name: `prod`
2. Click "Next" → "Create"
3. **Copy the Invoke URL** - this is what you'll use in Zapier!
   - It will look like: `https://xxxxxxxxxx.execute-api.us-east-2.amazonaws.com/prod`

## Step 10: Test the Endpoint

```bash
curl -X POST https://YOUR-API-URL/add-applicant \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "Applicant",
    "email": "test@example.com",
    "phone": "555-1234",
    "address": "123 Test St",
    "city": "Test City",
    "state": "TS",
    "zipCode": "12345"
  }'
```

You should get a response like:
```json
{
  "success": true,
  "message": "Applicant added successfully",
  "applicantId": "uuid-here"
}
```

---

# Zapier Setup Instructions

## Step 1: Create Zap

1. Go to Zapier.com
2. Click "Create Zap"

## Step 2: Set Up Trigger

1. Choose your form app (e.g., Google Forms, Typeform, Webflow Forms, etc.)
2. Trigger event: "New Form Submission" or similar
3. Connect your account
4. Test the trigger to pull in sample data

## Step 3: Set Up Action

1. Click "+" to add an action
2. Search for "Webhooks by Zapier"
3. Choose "POST" as the action event
4. Click "Continue"

## Step 4: Configure Webhook

**URL:** 
```
https://YOUR-API-URL/add-applicant
```
(Use the Invoke URL from API Gateway + `/add-applicant`)

**Payload Type:** `json`

**Data:** Map your form fields to the expected fields:

```
firstName: [Map from form field]
lastName: [Map from form field]
email: [Map from form field]
phone: [Map from form field]
address: [Map from form field]
city: [Map from form field]
state: [Map from form field]
zipCode: [Map from form field]
dateOfBirth: [Map from form field]
gender: [Map from form field]
ethnicity: [Map from form field]
gpa: [Map from form field]
major: [Map from form field]
graduationYear: [Map from form field]
school: [Map from form field]
essayResponse: [Map from form field]
challengeOrObstacle: [Map from form field]
howDidYouHear: [Map from form field]
wishForYourself: [Map from form field]
financialNeed: [Map from form field]
extracurriculars: [Map from form field]
workExperience: [Map from form field]
awards: [Map from form field]
references: [Map from form field]
additionalInfo: [Map from form field]
```

**Headers:**
```
Content-Type: application/json
```

## Step 5: Test and Enable

1. Click "Test action" to send a test submission
2. Check your DynamoDB table to verify the applicant was added
3. If successful, turn on your Zap!

---

# Field Mapping Reference

## Required Fields (Must be provided):
- `firstName`
- `lastName`
- `email`
- `phone`
- `address`

## Optional Fields (Can be empty):
- `city`
- `state`
- `zipCode`
- `dateOfBirth`
- `gender`
- `ethnicity`
- `gpa`
- `major`
- `graduationYear`
- `school`
- `essayResponse`
- `challengeOrObstacle`
- `howDidYouHear`
- `wishForYourself`
- `financialNeed`
- `extracurriculars`
- `workExperience`
- `awards`
- `references`
- `additionalInfo`

---

# Troubleshooting

## If applicants aren't showing up:

1. **Check Lambda Logs:**
   - Go to Lambda → Monitor → View logs in CloudWatch
   - Look for errors

2. **Check DynamoDB:**
   - Go to DynamoDB → Tables → ScholarshipApplicants
   - Click "Explore table items"
   - Verify new items are being added

3. **Test the API directly:**
   - Use the curl command above
   - Check the response

4. **Check Zapier Task History:**
   - Go to your Zap → Task History
   - Look for failed tasks and error messages

## Common Issues:

- **403 Forbidden:** Lambda doesn't have DynamoDB permissions
- **500 Error:** Check Lambda logs for details
- **Missing fields:** Make sure all required fields are mapped in Zapier
- **CORS errors:** Make sure API Gateway CORS is configured correctly
