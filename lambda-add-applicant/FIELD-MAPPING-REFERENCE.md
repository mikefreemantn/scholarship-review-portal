# Zapier Field Mapping Reference

## Quick Copy-Paste Guide

When setting up your Zapier webhook, use these **exact** field names (case-sensitive!):

### ✅ REQUIRED FIELDS (Must have these 5)
```
firstName
lastName
email
phone
address
```

### 📋 OPTIONAL FIELDS (Add what you have)

#### Basic Info
```
city
state
zipCode
country
```

#### Application Questions
```
aboutYourself          → "Tell us about yourself."
whyApply               → "What drew you to apply for this scholarship?"
challengeOrObstacle    → "What is a challenge or obstacle that you have faced..."
inspiration            → "Where do you find inspiration when faced with challenges..."
wishForYourself        → "At the end of your hike... what do you wish for yourself?"
anythingElse           → "Is there anything else you would like to share..."
```

#### Contact & Logistics
```
contactPreference      → "Please indicate how you would like to be contacted..."
howDidYouHear          → "How did you hear about this scholarship?"
howDidYouHearOther     → "If you answered 'other' above..."
dateApplied            → "Date Applied"
```

---

## Full Mapping Table

| Zapier Key | Your Form Question |
|------------|-------------------|
| `firstName` | First Name |
| `lastName` | Last Name |
| `email` | Email |
| `phone` | Phone |
| `address` | Address |
| `city` | City |
| `state` | State |
| `zipCode` | Zip Code |
| `country` | Country |
| `aboutYourself` | Tell us about yourself. |
| `whyApply` | What drew you to apply for this scholarship? |
| `challengeOrObstacle` | What is a challenge or obstacle that you have faced, or are currently facing, and how might time on the trail help you to better meet this challenge? |
| `inspiration` | Where do you find inspiration when faced with challenges and obstacles? When has your courage surprised you? |
| `wishForYourself` | At the end of your hike (whether or not you complete the entire 2,190 miles), what do you wish for yourself? |
| `anythingElse` | Is there anything else you would like to share or that we should consider as we are making our decision? |
| `contactPreference` | If you are selected as a finalist, you will be contacted by one of the review team members for an interview. Please indicate how you would like to be contacted (phone, email, text). |
| `howDidYouHear` | How did you hear about this scholarship? |
| `howDidYouHearOther` | If you answered "other" above, please share how you learned about this scholarship opportunity. |
| `dateApplied` | Date Applied |

---

## In Zapier: Step-by-Step

1. **Action:** Webhooks by Zapier → POST
2. **URL:** `https://zx2ah3ayx2.execute-api.us-east-2.amazonaws.com/add-applicant`
3. **Payload Type:** json
4. **Data:** Click "+ Add Field" for each mapping above
   - **Left side (Key):** Type the exact key name (e.g., `firstName`)
   - **Right side (Value):** Select the matching field from your form dropdown

---

## Example in Zapier

When you click "+ Add Field", you'll add pairs like this:

```
Key: firstName          Value: [Select "First Name" from dropdown]
Key: lastName           Value: [Select "Last Name" from dropdown]
Key: email              Value: [Select "Email" from dropdown]
Key: phone              Value: [Select "Phone" from dropdown]
Key: address            Value: [Select "Address" from dropdown]
Key: aboutYourself      Value: [Select "Tell us about yourself" from dropdown]
Key: whyApply           Value: [Select "What drew you to apply..." from dropdown]
Key: challengeOrObstacle Value: [Select "What is a challenge..." from dropdown]
Key: inspiration        Value: [Select "Where do you find inspiration..." from dropdown]
Key: wishForYourself    Value: [Select "At the end of your hike..." from dropdown]
Key: anythingElse       Value: [Select "Is there anything else..." from dropdown]
Key: contactPreference  Value: [Select "Please indicate how..." from dropdown]
Key: howDidYouHear      Value: [Select "How did you hear..." from dropdown]
Key: howDidYouHearOther Value: [Select "If you answered other..." from dropdown]
```

---

## What Gets Auto-Added

You don't need to map these - they're added automatically:

- `applicantId` - Unique UUID generated for each applicant
- `submittedAt` - Timestamp when received
- `status` - Set to "pending"

---

## Testing

After setting up, test with a form submission and verify in DynamoDB that all fields appear correctly!
