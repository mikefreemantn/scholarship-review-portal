const https = require('https');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

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
    // Parse the incoming data - API Gateway v2 format
    let requestData;
    if (event.body) {
      requestData = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    } else {
      requestData = event;
    }
    
    console.log('Parsed request data:', JSON.stringify(requestData, null, 2));
    
    const { applicant, message, conversationHistory = [] } = requestData;
    
    if (!applicant || !message) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: false,
          error: 'Missing required fields: applicant and message'
        })
      };
    }
    
    // Build system prompt with applicant context
    const systemPrompt = `You are an AI assistant helping board members review scholarship applications. You have access to the following applicant's information:

APPLICANT PROFILE:
Name: ${applicant.firstName} ${applicant.lastName}
Email: ${applicant.email}
Phone: ${applicant.phone || 'Not provided'}
Address: ${applicant.address || 'Not provided'}, ${applicant.city || ''}, ${applicant.state || ''} ${applicant.zipCode || ''}
Country: ${applicant.country || 'Not provided'}

ABOUT THEM:
${applicant.aboutYourself || 'Not provided'}

WHY THEY APPLIED:
${applicant.whyApply || 'Not provided'}

CHALLENGE OR OBSTACLE:
${applicant.challengeOrObstacle || 'Not provided'}

INSPIRATION:
${applicant.inspiration || 'Not provided'}

THEIR WISH:
${applicant.wishForYourself || 'Not provided'}

ADDITIONAL INFORMATION:
${applicant.anythingElse || 'Not provided'}

CONTACT PREFERENCE: ${applicant.contactPreference || 'Not provided'}
HOW THEY HEARD: ${applicant.howDidYouHear || 'Not provided'}
DATE APPLIED: ${applicant.dateApplied || 'Not provided'}

CRITICAL INSTRUCTIONS:
1. ONLY answer questions based on the information provided above
2. If asked about something not in the applicant's profile, say "I don't have that information in their application"
3. Do NOT make up, infer, or speculate about information not explicitly stated
4. Be helpful, concise, and professional
5. Help the board member understand and evaluate this applicant
6. You can summarize, compare, or analyze the provided information
7. If asked to compare with other applicants, explain you only have access to this one applicant's data`;

    // Build messages array
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: message }
    ];
    
    // Call OpenAI API
    const response = await callOpenAI(messages);
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        response: response
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

function callOpenAI(messages) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: 'gpt-4o-mini',
      messages: messages,
      temperature: 0.3, // Lower temperature for more factual responses
      max_tokens: 500
    });
    
    const options = {
      hostname: 'api.openai.com',
      port: 443,
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Length': Buffer.byteLength(data)
      }
    };
    
    const req = https.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          if (response.error) {
            reject(new Error(response.error.message));
          } else {
            resolve(response.choices[0].message.content);
          }
        } catch (error) {
          reject(error);
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.write(data);
    req.end();
  });
}
