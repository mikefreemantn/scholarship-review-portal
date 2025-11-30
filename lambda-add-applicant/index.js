const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

const client = new DynamoDBClient({ region: 'us-east-2' });
const dynamodb = DynamoDBDocumentClient.from(client);

const APPLICANTS_TABLE = process.env.APPLICANTS_TABLE || 'ScholarshipApplicants';

exports.handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Api-Key',
        'Access-Control-Allow-Methods': 'POST,OPTIONS'
      },
      body: ''
    };
  }
  
  try {
    // Parse the incoming data
    let applicantData;
    
    if (event.body) {
      applicantData = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    } else {
      applicantData = event;
    }
    
    console.log('Parsed applicant data:', applicantData);
    
    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address'];
    const missingFields = requiredFields.filter(field => !applicantData[field]);
    
    if (missingFields.length > 0) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: false,
          error: `Missing required fields: ${missingFields.join(', ')}`
        })
      };
    }
    
    // Generate unique applicant ID
    const applicantId = uuidv4();
    
    // Create the applicant item with all fields from your CSV structure
    const applicantItem = {
      applicantId,
      firstName: applicantData.firstName,
      lastName: applicantData.lastName,
      email: applicantData.email,
      phone: applicantData.phone,
      address: applicantData.address,
      city: applicantData.city || '',
      state: applicantData.state || '',
      zipCode: applicantData.zipCode || '',
      country: applicantData.country || '',
      aboutYourself: applicantData.aboutYourself || '',
      whyApply: applicantData.whyApply || '',
      challengeOrObstacle: applicantData.challengeOrObstacle || '',
      inspiration: applicantData.inspiration || '',
      wishForYourself: applicantData.wishForYourself || '',
      anythingElse: applicantData.anythingElse || '',
      contactPreference: applicantData.contactPreference || '',
      howDidYouHear: applicantData.howDidYouHear || '',
      howDidYouHearOther: applicantData.howDidYouHearOther || '',
      dateApplied: applicantData.dateApplied || '',
      submittedAt: new Date().toISOString(),
      status: 'pending'
    };
    
    // Add to DynamoDB
    await dynamodb.send(new PutCommand({
      TableName: APPLICANTS_TABLE,
      Item: applicantItem
    }));
    
    console.log('Successfully added applicant:', applicantId);
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        message: 'Applicant added successfully',
        applicantId: applicantId,
        applicant: applicantItem
      })
    };
    
  } catch (error) {
    console.error('Error adding applicant:', error);
    
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
