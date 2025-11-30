#!/bin/bash

# Setup AWS Cognito User Pool for Scholarship Voting CRM

echo "Creating Cognito User Pool..."

# Create User Pool
USER_POOL_ID=$(aws cognito-idp create-user-pool \
    --pool-name ScholarshipVotingCRM \
    --policies "PasswordPolicy={MinimumLength=8,RequireUppercase=true,RequireLowercase=true,RequireNumbers=true,RequireSymbols=false}" \
    --auto-verified-attributes email \
    --username-attributes email \
    --mfa-configuration OFF \
    --email-configuration EmailSendingAccount=COGNITO_DEFAULT \
    --admin-create-user-config "AllowAdminCreateUserOnly=true,InviteMessageTemplate={EmailSubject='Your Scholarship Voting CRM Access',EmailMessage='You have been invited to join the One More Day on the AT scholarship review board. Username: {username} Temporary password: {####}. Please login at http://voting.onemoredayontheatapply.com'}" \
    --query 'UserPool.Id' \
    --output text)

echo "User Pool created: $USER_POOL_ID"

# Create User Pool Client
CLIENT_ID=$(aws cognito-idp create-user-pool-client \
    --user-pool-id $USER_POOL_ID \
    --client-name ScholarshipVotingCRMClient \
    --no-generate-secret \
    --explicit-auth-flows ALLOW_USER_PASSWORD_AUTH ALLOW_REFRESH_TOKEN_AUTH ALLOW_USER_SRP_AUTH \
    --prevent-user-existence-errors ENABLED \
    --query 'UserPoolClient.ClientId' \
    --output text)

echo "User Pool Client created: $CLIENT_ID"

# Create Identity Pool
IDENTITY_POOL_ID=$(aws cognito-identity create-identity-pool \
    --identity-pool-name ScholarshipVotingCRMIdentity \
    --allow-unauthenticated-identities false \
    --cognito-identity-providers ProviderName=cognito-idp.us-east-1.amazonaws.com/$USER_POOL_ID,ClientId=$CLIENT_ID \
    --query 'IdentityPoolId' \
    --output text)

echo "Identity Pool created: $IDENTITY_POOL_ID"

# Save configuration
cat > cognito-config.json <<EOF
{
  "userPoolId": "$USER_POOL_ID",
  "clientId": "$CLIENT_ID",
  "identityPoolId": "$IDENTITY_POOL_ID",
  "region": "us-east-1"
}
EOF

echo "Configuration saved to cognito-config.json"
echo ""
echo "IMPORTANT: Add these values to your React app's .env file:"
echo "REACT_APP_USER_POOL_ID=$USER_POOL_ID"
echo "REACT_APP_CLIENT_ID=$CLIENT_ID"
echo "REACT_APP_IDENTITY_POOL_ID=$IDENTITY_POOL_ID"
echo "REACT_APP_REGION=us-east-1"
