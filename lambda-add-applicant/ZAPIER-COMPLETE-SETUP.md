# Complete Zapier Setup Instructions

## Prerequisites
✅ Lambda function deployed to AWS ✅ DONE!
✅ API Gateway endpoint created ✅ DONE!
✅ Your API URL is: **`https://zx2ah3ayx2.execute-api.us-east-2.amazonaws.com/add-applicant`**

---

## Part 1: Create Your Zap

### Step 1: Start a New Zap
1. Go to https://zapier.com/app/zaps
2. Click the **"Create Zap"** button (orange button, top right)
3. You'll see a blank Zap editor with "Trigger" and "Action" sections

---

## Part 2: Configure the Trigger (Your Form)

### Step 2: Choose Your Form App

**If you're using Google Forms:**
1. In the **Trigger** section, click "Choose App & Event"
2. Search for **"Google Forms"**
3. Click on it
4. For the Event, select **"New Response in Spreadsheet"**
5. Click **"Continue"**

**If you're using Typeform:**
1. Search for **"Typeform"**
2. Event: **"New Entry"**
3. Click **"Continue"**

**If you're using Webflow Forms:**
1. Search for **"Webflow"**
2. Event: **"New Form Submission"**
3. Click **"Continue"**

**If you're using another form tool:**
- Search for your form app name
- Choose the "New Submission" or "New Response" event

### Step 3: Connect Your Account
1. Click **"Sign in to [Your Form App]"**
2. Follow the authentication flow
3. Grant Zapier permission to access your forms
4. Click **"Continue"**

### Step 4: Select Your Form
1. You'll see a dropdown of your forms
2. Select the **scholarship application form**
3. Click **"Continue"**

### Step 5: Test the Trigger
1. Click **"Test trigger"**
2. Zapier will pull in a recent form submission
3. You should see all the form fields populated with sample data
4. **Important:** Review the field names - you'll need these for mapping!
5. Click **"Continue"**

---

## Part 3: Configure the Action (Send to Your API)

### Step 6: Add Webhooks Action
1. Click the **"+"** button below your trigger
2. In "Choose App & Event", search for **"Webhooks by Zapier"**
3. Click on it
4. For Action Event, select **"POST"**
5. Click **"Continue"**

### Step 7: Configure the Webhook

#### URL Field
Paste your API Gateway URL (copy this exactly):
```
https://zx2ah3ayx2.execute-api.us-east-2.amazonaws.com/add-applicant
```
**This is your live endpoint - tested and working!**

#### Payload Type
Select **"json"** from the dropdown

#### Data Section (This is the important part!)

Click **"+ Add Field"** for each field below. You'll create a key-value pair for each one.

**REQUIRED FIELDS** (Must map these):

| Key (Type exactly) | Value (Select from dropdown) |
|-------------------|------------------------------|
| `firstName` | Select your form's "First Name" field |
| `lastName` | Select your form's "Last Name" field |
| `email` | Select your form's "Email" field |
| `phone` | Select your form's "Phone" field |
| `address` | Select your form's "Address" field |

**OPTIONAL FIELDS** (Map if you have them in your form):

| Key (Type exactly) | Value (Select from dropdown) | Your Form Question |
|-------------------|------------------------------|-------------------|
| `city` | Select your form's "City" field | City |
| `state` | Select your form's "State" field | State |
| `zipCode` | Select your form's "Zip Code" field | Zip Code |
| `country` | Select your form's "Country" field | Country |
| `aboutYourself` | Select your form's "About" field | Tell us about yourself. |
| `whyApply` | Select your form's "Why Applied" field | What drew you to apply for this scholarship? |
| `challengeOrObstacle` | Select your form's "Challenge" field | What is a challenge or obstacle that you have faced... |
| `inspiration` | Select your form's "Inspiration" field | Where do you find inspiration when faced with challenges... |
| `wishForYourself` | Select your form's "Wish" field | At the end of your hike... what do you wish for yourself? |
| `anythingElse` | Select your form's "Anything Else" field | Is there anything else you would like to share... |
| `contactPreference` | Select your form's "Preferred Contact" field | Please indicate how you would like to be contacted... |
| `howDidYouHear` | Select your form's "How did you hear" field | How did you hear about this scholarship? |
| `howDidYouHearOther` | Select your form's "Other source" field | If you answered "other" above... |
| `dateApplied` | Select your form's "Date Applied" field | Date Applied |

**Important Notes:**
- The **keys** (left side) must be typed EXACTLY as shown (case-sensitive!)
- The **values** (right side) should be selected from the dropdown that shows your form fields
- If you don't have a field in your form, skip it
- Only the 5 required fields are mandatory

#### Headers Section
Click **"+ Add Header"**

| Key | Value |
|-----|-------|
| `Content-Type` | `application/json` |

#### Other Settings
- **Wrap Request in Array:** Leave OFF (unchecked)
- **Unflatten:** Leave OFF (unchecked)
- **Basic Auth:** Leave blank
- **Query String Params:** Leave blank

### Step 8: Test the Action
1. Click **"Test action"**
2. Zapier will send a test request to your API
3. You should see a response like:
```json
{
  "success": true,
  "message": "Applicant added successfully",
  "applicantId": "some-uuid-here"
}
```
4. If you see `"success": true`, it worked! 🎉
5. If you see an error, check the troubleshooting section below

### Step 9: Verify in DynamoDB
1. Go to AWS Console → DynamoDB
2. Click on **Tables** → **ScholarshipApplicants**
3. Click **"Explore table items"**
4. You should see your test applicant!
5. Verify all fields are populated correctly

---

## Part 4: Name and Activate Your Zap

### Step 10: Name Your Zap
1. Click on "Untitled Zap" at the top
2. Name it something like: **"Add Scholarship Applicants to Database"**
3. Press Enter

### Step 11: Turn On Your Zap
1. Click the **"Publish"** button (top right)
2. Your Zap is now LIVE! ✅

---

## Part 5: Test with a Real Submission

### Step 12: Submit a Real Test Form
1. Go to your scholarship application form
2. Fill it out with test data (use your own email so you can verify)
3. Submit the form
4. Wait 1-2 minutes

### Step 13: Verify It Worked
1. Go to Zapier → Your Zap → **"Zap History"**
2. You should see a successful run
3. Go to your voting portal and refresh
4. The test applicant should appear!

---

## Troubleshooting

### ❌ "Missing required fields" error
**Problem:** One or more required fields aren't being sent

**Solution:**
1. Go back to your Zap
2. Check the Data section in Step 7
3. Make sure you mapped all 5 required fields:
   - firstName
   - lastName
   - email
   - phone
   - address
4. Make sure the keys are spelled EXACTLY right (case-sensitive)

### ❌ "403 Forbidden" error
**Problem:** Lambda doesn't have permission to write to DynamoDB

**Solution:**
1. Go to AWS Lambda → Your function → Configuration → Permissions
2. Click on the role name
3. Attach policy: `AmazonDynamoDBFullAccess`
4. Try the test again

### ❌ "500 Internal Server Error"
**Problem:** Something went wrong in the Lambda function

**Solution:**
1. Go to AWS Lambda → Your function → Monitor → View logs in CloudWatch
2. Look for the error message
3. Common issues:
   - Environment variable `APPLICANTS_TABLE` not set
   - Missing `uuid` package (re-upload the zip with node_modules)

### ❌ Zap shows success but applicant not in database
**Problem:** Data might not be formatted correctly

**Solution:**
1. Check CloudWatch logs for the Lambda function
2. Look for validation errors
3. Verify the applicantId was generated
4. Check if the DynamoDB write succeeded

### ❌ Some fields are empty in DynamoDB
**Problem:** Field mapping might be incorrect

**Solution:**
1. Go to Zapier → Your Zap → Edit
2. Click on the Webhooks action
3. Review the Data section
4. Make sure each field is mapped to the correct form field
5. Re-test the action

---

## Field Mapping Examples

### Example 1: Google Forms
If your Google Form has these questions:
- "What is your first name?" → Map to `firstName`
- "What is your last name?" → Map to `lastName`
- "Email address" → Map to `email`
- "Phone number" → Map to `phone`
- "Street address" → Map to `address`

### Example 2: Typeform
If your Typeform has these fields:
- "First Name" → Map to `firstName`
- "Last Name" → Map to `lastName`
- "Email" → Map to `email`
- "Phone" → Map to `phone`
- "Address" → Map to `address`

### Example 3: Multi-line Address
If your form has separate fields for address:
- Street: "123 Main St"
- City: "Springfield"
- State: "IL"
- Zip: "62701"

Map them separately:
- `address` → Street field
- `city` → City field
- `state` → State field
- `zipCode` → Zip field

---

## Monitoring Your Zap

### View Zap History
1. Go to your Zap
2. Click **"Zap History"** tab
3. See all runs (successful and failed)
4. Click on any run to see details

### Set Up Notifications
1. In your Zap, click the settings icon (gear)
2. Enable **"Send Zap error emails"**
3. You'll get notified if anything fails

### Check Task Usage
1. Go to Zapier Dashboard
2. Check your task usage (free plan = 100 tasks/month)
3. Each form submission = 1 task

---

## Advanced Tips

### Filter Out Test Submissions
If you want to exclude test submissions:

1. Add a **Filter** step between Trigger and Action
2. Set condition: "Email does not contain 'test'"
3. This prevents test submissions from being added

### Add Email Notification
Want to get notified when someone applies?

1. Add another Action after the Webhook
2. Choose **"Email by Zapier"**
3. Send yourself an email with applicant details

### Multi-Step Workflow
You could also:
1. Add applicant to database (current setup)
2. Send confirmation email to applicant
3. Notify you via Slack/Email
4. Add to Google Sheets for backup

---

## Quick Reference Card

**Your API URL:**
```
https://zx2ah3ayx2.execute-api.us-east-2.amazonaws.com/add-applicant
```

**Required Keys (must type exactly):**
- firstName
- lastName
- email
- phone
- address

**Success Response:**
```json
{
  "success": true,
  "applicantId": "uuid-here"
}
```

**Test Command:**
```bash
cd lambda-add-applicant
./test-endpoint.sh https://zx2ah3ayx2.execute-api.us-east-2.amazonaws.com/add-applicant
```

---

## Support

If you get stuck:
1. Check Zap History for error messages
2. Check Lambda CloudWatch logs
3. Verify API Gateway is deployed
4. Test the endpoint directly with curl
5. Make sure all required fields are mapped

Your applicants should now flow automatically from form → database → portal! 🎉
