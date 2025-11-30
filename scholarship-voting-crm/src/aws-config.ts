import { Amplify } from 'aws-amplify';

const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.REACT_APP_USER_POOL_ID || '',
      userPoolClientId: process.env.REACT_APP_CLIENT_ID || '',
      identityPoolId: process.env.REACT_APP_IDENTITY_POOL_ID || '',
    }
  }
};

Amplify.configure(awsConfig);

export const awsRegion = process.env.REACT_APP_REGION || 'us-east-2';

export default awsConfig;
