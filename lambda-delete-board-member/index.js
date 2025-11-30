const AWS = require('aws-sdk');
const cognito = new AWS.CognitoIdentityServiceProvider();
const dynamodb = new AWS.DynamoDB.DocumentClient();

const USER_POOL_ID = process.env.USER_POOL_ID;
const BOARD_MEMBERS_TABLE = process.env.BOARD_MEMBERS_TABLE || 'BoardMembers';

exports.handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  
  // Handle CORS preflight
  if (event.requestContext?.http?.method === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST,OPTIONS'
      },
      body: ''
    };
  }
  
  try {
    // Parse the incoming data
    let requestData;
    if (event.body) {
      requestData = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    } else {
      requestData = event;
    }
    
    const { email } = requestData;
    
    if (!email) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: false,
          error: 'Missing required field: email'
        })
      };
    }
    
    console.log('Deleting board member:', email);
    
    // Step 1: Delete from Cognito
    try {
      await cognito.adminDeleteUser({
        UserPoolId: USER_POOL_ID,
        Username: email
      }).promise();
      console.log('Deleted from Cognito:', email);
    } catch (cognitoError) {
      // If user doesn't exist in Cognito, that's okay - continue with DynamoDB deletion
      if (cognitoError.code !== 'UserNotFoundException') {
        throw cognitoError;
      }
      console.log('User not found in Cognito (already deleted):', email);
    }
    
    // Step 2: Delete from DynamoDB
    await dynamodb.delete({
      TableName: BOARD_MEMBERS_TABLE,
      Key: { email }
    }).promise();
    console.log('Deleted from DynamoDB:', email);
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        message: `Successfully deleted board member: ${email}`
      })
    };
    
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};
