#!/bin/bash

echo "Updating Cognito admin permissions for auth role..."

# Get the auth role name
AUTH_ROLE="ScholarshipVotingCRM-AuthRole"

# Create or update the inline policy
aws iam put-role-policy \
  --role-name "$AUTH_ROLE" \
  --policy-name "CognitoAdminAccess" \
  --policy-document file://cognito-admin-policy.json

if [ $? -eq 0 ]; then
  echo "✅ Successfully updated Cognito permissions!"
  echo ""
  echo "The auth role now has permission to:"
  echo "  - AdminCreateUser"
  echo "  - AdminDeleteUser"
  echo "  - AdminGetUser"
  echo "  - AdminSetUserPassword"
  echo "  - ListUsers"
else
  echo "❌ Failed to update permissions"
  exit 1
fi
