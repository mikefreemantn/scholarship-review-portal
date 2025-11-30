const https = require('https');
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const APPLICANTS_TABLE = process.env.APPLICANTS_TABLE || 'Applicants';

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
    
    const { question } = requestData;
    
    if (!question) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: false,
          error: 'Missing required field: question'
        })
      };
    }
    
    console.log('Question:', question);
    
    // Fetch ALL applicants from DynamoDB
    const scanResult = await dynamodb.scan({
      TableName: APPLICANTS_TABLE
    }).promise();
    
    const applicants = scanResult.Items || [];
    console.log(`Found ${applicants.length} applicants`);
    
    if (applicants.length === 0) {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: true,
          answer: "No applicants found in the database."
        })
      };
    }
    
    // Create a summary of all applicants for the AI with IDs using ACTUAL field names
    const applicantsSummary = applicants.map((app, idx) => {
      return `
[ID: ${app.applicantId || app.id}]
**${app.firstName} ${app.lastName}** (${app.email})
- Location: ${app.city || 'N/A'}, ${app.state || 'N/A'}
- About Themselves: ${app.aboutYourself || 'N/A'}
- Why They Applied: ${app.whyApplied || 'N/A'}
- Challenge/Obstacle: ${app.challengeOrObstacle || 'N/A'}
- Inspiration & Courage: ${app.inspirationAndCourage || 'N/A'}
- Wish For Themselves: ${app.wishForYourself || 'N/A'}
- Anything Else: ${app.anythingElse || 'N/A'}
---`;
    }).join('\n');
    
    // Create the system prompt
    const systemPrompt = `You are helping a scholarship review board find applicants that match specific criteria.

Below are ALL the applicant profiles. Analyze them and return a JSON object with a "matches" array containing ONLY applicants that match the user's question.

RESPONSE FORMAT - Return a JSON object like this:
{
  "matches": [
    {
      "id": "applicant-id-here",
      "firstName": "First",
      "lastName": "Last",
      "reason": "Brief explanation of why they match (cite specific details from their profile)"
    }
  ]
}

If multiple applicants match, include ALL of them in the matches array.
If NO applicants match, return: {"matches": []}

APPLICANT DATA:

${applicantsSummary}`;

    const userPrompt = question;
    
    // Call OpenAI API
    const openaiResponse = await callOpenAI(systemPrompt, userPrompt);
    console.log('OpenAI raw response:', openaiResponse.substring(0, 500));
    
    // Parse the JSON response
    let matches = [];
    try {
      const parsed = JSON.parse(openaiResponse);
      matches = parsed.matches || [];
      console.log('Successfully parsed matches:', matches.length, 'applicants');
      if (matches.length === 0) {
        console.log('WARNING: OpenAI returned empty matches array');
      }
    } catch (e) {
      console.error('Failed to parse OpenAI response as JSON:', openaiResponse.substring(0, 200));
      console.error('Parse error:', e.message);
      // Fallback: return empty matches
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: true,
          matches: []
        })
      };
    }
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        matches: matches
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

function callOpenAI(systemPrompt, userPrompt) {
  return new Promise((resolve, reject) => {
    const requestBody = JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 3000,
      response_format: { type: "json_object" }
    });

    const options = {
      hostname: 'api.openai.com',
      port: 443,
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody),
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.error) {
            reject(new Error(response.error.message));
          } else {
            resolve(response.choices[0].message.content);
          }
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(requestBody);
    req.end();
  });
}
