# Zapier Quick Setup Guide

## Your Zapier Configuration

### Trigger
- **App:** Your form app (Google Forms, Typeform, Webflow, etc.)
- **Event:** New Form Submission

### Action
- **App:** Webhooks by Zapier
- **Event:** POST

---

## Webhook Configuration

### URL
```
https://YOUR-API-GATEWAY-URL/add-applicant
```
*(Get this after deploying Lambda - see DEPLOYMENT.md)*

### Method
`POST`

### Payload Type
`json`

### Headers
```
Content-Type: application/json
```

---

## Field Mapping (Data Section)

Map your Zapier form fields to these exact keys:

### Required Fields
```
firstName: [Your form first name field]
lastName: [Your form last name field]
email: [Your form email field]
phone: [Your form phone field]
address: [Your form address field]
```

### Optional Fields (include what you have)
```
city: [Your form city field]
state: [Your form state field]
zipCode: [Your form zip code field]
dateOfBirth: [Your form DOB field]
gender: [Your form gender field]
ethnicity: [Your form ethnicity field]
gpa: [Your form GPA field]
major: [Your form major field]
graduationYear: [Your form graduation year field]
school: [Your form school field]
essayResponse: [Your form essay field]
challengeOrObstacle: [Your form challenge field]
howDidYouHear: [Your form referral field]
wishForYourself: [Your form wish field]
financialNeed: [Your form financial need field]
extracurriculars: [Your form activities field]
workExperience: [Your form work field]
awards: [Your form awards field]
references: [Your form references field]
additionalInfo: [Your form additional info field]
```

---

## Test Your Setup

1. Submit a test form
2. Check Zapier Task History (should show success)
3. Check DynamoDB table for new applicant
4. Check your voting portal - applicant should appear!

---

## Success Response
When working correctly, you'll see:
```json
{
  "success": true,
  "message": "Applicant added successfully",
  "applicantId": "uuid-generated-id"
}
```

## Error Response
If something is wrong:
```json
{
  "success": false,
  "error": "Error message here"
}
```

Check Lambda CloudWatch logs for details.
