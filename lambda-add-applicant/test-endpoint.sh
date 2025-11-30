#!/bin/bash

# Test script for Add Applicant API
# Usage: ./test-endpoint.sh YOUR_API_URL

if [ -z "$1" ]; then
  echo "Usage: ./test-endpoint.sh YOUR_API_URL"
  echo "Example: ./test-endpoint.sh https://abc123.execute-api.us-east-2.amazonaws.com/prod/add-applicant"
  exit 1
fi

API_URL="$1"

echo "Testing Add Applicant API..."
echo "URL: $API_URL"
echo ""

# Test with sample data
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "Applicant",
    "email": "test.applicant@example.com",
    "phone": "555-123-4567",
    "address": "123 Test Street",
    "city": "Test City",
    "state": "TS",
    "zipCode": "12345",
    "dateOfBirth": "2000-01-01",
    "gender": "Prefer not to say",
    "gpa": "3.8",
    "major": "Computer Science",
    "graduationYear": "2025",
    "school": "Test University",
    "essayResponse": "This is a test essay response.",
    "challengeOrObstacle": "Test challenge",
    "howDidYouHear": "Test referral",
    "wishForYourself": "Test wish",
    "financialNeed": "Test financial need"
  }' \
  | python3 -m json.tool

echo ""
echo ""
echo "If successful, you should see:"
echo '  "success": true'
echo '  "applicantId": "some-uuid"'
echo ""
echo "Now check your DynamoDB table to verify the applicant was added!"
