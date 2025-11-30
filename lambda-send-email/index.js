const https = require('https');

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = 'noreply@onemoredayontheatapply.com';
const FROM_NAME = 'One More Day Scholarship Board';

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
    
    const { to, subject, html, text } = requestData;
    
    if (!to || !subject) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: false,
          error: 'Missing required fields: to, subject'
        })
      };
    }
    
    console.log('Sending email to:', to);
    
    // Prepare Resend payload
    const toArray = Array.isArray(to) ? to : [to];
    
    const payload = JSON.stringify({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: toArray,
      subject,
      html: html || text,
      text: text,
    });
    
    // Send via Resend API
    const result = await sendToResend(payload);
    
    console.log('Email sent successfully');
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        message: 'Email sent successfully'
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

function sendToResend(payload) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.resend.com',
      port: 443,
      path: '/emails',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          console.error('Resend error:', res.statusCode, data);
          reject(new Error(`Resend API error: ${res.statusCode} - ${data}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.write(payload);
    req.end();
  });
}
