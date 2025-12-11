import { CognitoIdentityServiceProvider } from 'aws-sdk';
import { fetchAuthSession } from 'aws-amplify/auth';
import { awsRegion } from '../aws-config';

const USER_POOL_ID = process.env.REACT_APP_USER_POOL_ID || '';

let cognitoClient: CognitoIdentityServiceProvider | null = null;

async function getCognitoClient(): Promise<CognitoIdentityServiceProvider> {
  if (cognitoClient) {
    return cognitoClient;
  }

  const session = await fetchAuthSession();
  const credentials = session.credentials;

  if (!credentials) {
    throw new Error('No credentials available');
  }

  cognitoClient = new CognitoIdentityServiceProvider({
    region: awsRegion,
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken,
    },
  });

  return cognitoClient;
}

export async function inviteBoardMember(email: string, name: string): Promise<string> {
  const client = await getCognitoClient();
  
  // Normalize email to lowercase to match login behavior
  const normalizedEmail = email.toLowerCase();
  
  // Generate a temporary password
  const tempPassword = Math.random().toString(36).slice(-10) + 'Aa1!';
  
  try {
    // Create user with temp password in FORCE_CHANGE_PASSWORD state
    await client.adminCreateUser({
      UserPoolId: USER_POOL_ID,
      Username: normalizedEmail,
      UserAttributes: [
        { Name: 'email', Value: normalizedEmail },
        { Name: 'email_verified', Value: 'true' },
        { Name: 'name', Value: name },
      ],
      TemporaryPassword: tempPassword,
      MessageAction: 'SUPPRESS', // Don't send Cognito's default email
    }).promise();
    
    return tempPassword;
  } catch (error: any) {
    if (error.code === 'UsernameExistsException') {
      throw new Error(`User ${normalizedEmail} already exists in Cognito. If they're not showing in the admin panel, there may be a sync issue. Try using "Resend Invite" if they appear in the list, or contact support.`);
    }
    throw error;
  }
}

export async function sendPasswordSetupLink(email: string): Promise<void> {
  // This will be called from the frontend using AWS Amplify's resetPassword
  // We just need to import it in the component
  const { resetPassword } = await import('aws-amplify/auth');
  await resetPassword({ username: email.toLowerCase() });
}

export async function resetBoardMemberPassword(email: string): Promise<string> {
  const client = await getCognitoClient();
  
  // Normalize email to lowercase
  const normalizedEmail = email.toLowerCase();
  
  // Generate a new permanent password
  const password = Math.random().toString(36).slice(-10) + 'Aa1!';
  
  // Reset the user's password
  await client.adminSetUserPassword({
    UserPoolId: USER_POOL_ID,
    Username: normalizedEmail,
    Password: password,
    Permanent: true,
  }).promise();
  
  return password;
}

export async function adminSetUserPassword(email: string, password: string): Promise<void> {
  const client = await getCognitoClient();
  
  // Normalize email to lowercase
  const normalizedEmail = email.toLowerCase();
  
  // Set a specific password for the user (permanent, no force change)
  await client.adminSetUserPassword({
    UserPoolId: USER_POOL_ID,
    Username: normalizedEmail,
    Password: password,
    Permanent: true,
  }).promise();
}

export async function getCognitoUser(email: string): Promise<any> {
  const client = await getCognitoClient();
  
  // Normalize email to lowercase
  const normalizedEmail = email.toLowerCase();
  
  try {
    const result = await client.adminGetUser({
      UserPoolId: USER_POOL_ID,
      Username: normalizedEmail,
    }).promise();
    
    return result;
  } catch (error: any) {
    if (error.code === 'UserNotFoundException') {
      return null;
    }
    throw error;
  }
}

export async function removeBoardMemberFromCognito(email: string): Promise<void> {
  const client = await getCognitoClient();
  
  // Normalize email to lowercase
  const normalizedEmail = email.toLowerCase();
  
  await client.adminDeleteUser({
    UserPoolId: USER_POOL_ID,
    Username: normalizedEmail,
  }).promise();
}
