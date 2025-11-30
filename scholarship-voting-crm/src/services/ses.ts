import { SES } from 'aws-sdk';
import { fetchAuthSession } from 'aws-amplify/auth';
import { awsRegion } from '../aws-config';

let sesClient: SES | null = null;

async function getSESClient(): Promise<SES> {
  if (sesClient) {
    return sesClient;
  }

  const session = await fetchAuthSession();
  const credentials = session.credentials;

  if (!credentials) {
    throw new Error('No credentials available');
  }

  sesClient = new SES({
    region: awsRegion,
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken,
    },
  });

  return sesClient;
}

interface EmailParams {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
}

const FROM_EMAIL = 'noreply@onemoredayontheatapply.com';
const FROM_NAME = 'One More Day Scholarship Board';

export const sendEmail = async (params: EmailParams): Promise<boolean> => {
  const { to, subject, text, html } = params;
  
  try {
    const client = await getSESClient();
    
    const destinations = Array.isArray(to) ? to : [to];
    
    await client.sendEmail({
      Source: `${FROM_NAME} <${FROM_EMAIL}>`,
      Destination: {
        ToAddresses: destinations,
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: 'UTF-8',
        },
        Body: {
          ...(html && {
            Html: {
              Data: html,
              Charset: 'UTF-8',
            },
          }),
          ...(text && {
            Text: {
              Data: text,
              Charset: 'UTF-8',
            },
          }),
        },
      },
    }).promise();
    
    console.log('Email sent successfully via SES');
    return true;
  } catch (error) {
    console.error('Error sending email via SES:', error);
    return false;
  }
};

// Welcome email for new board members
export const sendWelcomeEmail = async (
  email: string,
  name: string,
  temporaryPassword: string
): Promise<boolean> => {
  const subject = '🏔️ Welcome to the One More Day Scholarship Review Board';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
              
              <!-- Header with brand colors -->
              <tr>
                <td style="background: linear-gradient(135deg, #2d4a3e 0%, #1f3329 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="color: #d4c5a0; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 1px;">
                    ONE MORE DAY
                  </h1>
                  <p style="color: #d4c5a0; margin: 8px 0 0 0; font-size: 14px; letter-spacing: 2px; text-transform: uppercase;">
                    On the Appalachian Trail
                  </p>
                </td>
              </tr>
              
              <!-- Welcome Message -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="color: #2d4a3e; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
                    Welcome to the Review Board, ${name}! 🎉
                  </h2>
                  
                  <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                    Thank you for joining us in selecting the recipient of the <strong>One More Day on the AT Memorial Scholarship</strong>. Your expertise and perspective will help us identify a deserving hiker whose journey will honor the memory of those who loved the trail.
                  </p>
                  
                  <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 30px 0;">
                    This scholarship supports hikers who embody the spirit of perseverance, community, and love for the Appalachian Trail.
                  </p>
                  
                  <!-- Login Credentials Box -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-left: 4px solid #2d4a3e; border-radius: 8px; margin: 0 0 30px 0;">
                    <tr>
                      <td style="padding: 25px;">
                        <h3 style="color: #2d4a3e; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
                          🔐 Your Login Credentials
                        </h3>
                        <p style="color: #333; margin: 0 0 10px 0; font-size: 15px;">
                          <strong style="color: #2d4a3e;">Email:</strong><br>
                          <span style="color: #555;">${email}</span>
                        </p>
                        <p style="color: #333; margin: 0; font-size: 15px;">
                          <strong style="color: #2d4a3e;">Password:</strong><br>
                          <code style="background: #ffffff; padding: 8px 12px; border-radius: 4px; font-size: 16px; color: #d63384; font-weight: 600; display: inline-block; margin-top: 5px; border: 1px solid #dee2e6;">${temporaryPassword}</code>
                        </p>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- CTA Button -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding: 10px 0 30px 0;">
                        <a href="https://voting.onemoredayontheatapply.com" 
                           style="display: inline-block; background: linear-gradient(135deg, #2d4a3e 0%, #1f3329 100%); color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(45, 74, 62, 0.3);">
                          Access Review Portal →
                        </a>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0;">
                    If you have any questions or need assistance, please don't hesitate to reach out.
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #dee2e6;">
                  <p style="color: #6c757d; font-size: 13px; line-height: 1.6; margin: 0 0 10px 0;">
                    <strong style="color: #2d4a3e;">One More Day on the Appalachian Trail</strong><br>
                    Memorial Scholarship Review Board
                  </p>
                  <p style="color: #adb5bd; font-size: 12px; margin: 0;">
                    This email was sent to ${email}
                  </p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
  
  const text = `
Welcome to the Review Board, ${name}!

You've been invited to join the One More Day on the AT Scholarship review board.

Your Login Credentials:
Email: ${email}
Password: ${temporaryPassword}

Login at: https://voting.onemoredayontheatapply.com

If you have any questions, please reach out.
  `;
  
  return sendEmail({ to: email, subject, html, text });
};

// Voting digest email
export const sendVotingDigest = async (
  boardMemberEmail: string,
  boardMemberName: string,
  unvotedApplicants: Array<{ firstName: string; lastName: string; email: string }>,
  customMessage?: string
): Promise<boolean> => {
  const subject = `📋 Voting Reminder: ${unvotedApplicants.length} Applicant${unvotedApplicants.length !== 1 ? 's' : ''} Awaiting Review`;
  
  const applicantsList = unvotedApplicants
    .map((app, index) => `
      <tr>
        <td style="padding: 12px 20px; border-bottom: 1px solid #e9ecef;">
          <span style="color: #2d4a3e; font-weight: 600; font-size: 16px;">${index + 1}.</span>
          <span style="color: #333; font-size: 16px; margin-left: 10px;">${app.firstName} ${app.lastName}</span>
        </td>
      </tr>
    `)
    .join('');
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #2d4a3e 0%, #1f3329 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="color: #d4c5a0; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 1px;">
                    ONE MORE DAY
                  </h1>
                  <p style="color: #d4c5a0; margin: 8px 0 0 0; font-size: 14px; letter-spacing: 2px; text-transform: uppercase;">
                    On the Appalachian Trail
                  </p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="color: #2d4a3e; margin: 0 0 10px 0; font-size: 24px; font-weight: 600;">
                    📋 Voting Reminder
                  </h2>
                  
                  <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                    Hi ${boardMemberName},
                  </p>
                  
                  ${customMessage ? `
                    <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); border-left: 4px solid #2196f3; border-radius: 8px; margin: 0 0 25px 0;">
                      <tr>
                        <td style="padding: 20px;">
                          <p style="color: #0d47a1; margin: 0 0 8px 0; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                            💬 Message from Admin
                          </p>
                          <p style="color: #1565c0; margin: 0; font-size: 15px; line-height: 1.5;">
                            ${customMessage}
                          </p>
                        </td>
                      </tr>
                    </table>
                  ` : ''}
                  
                  <!-- Stats Box -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%); border-radius: 8px; margin: 0 0 30px 0;">
                    <tr>
                      <td style="padding: 25px; text-align: center;">
                        <p style="color: #e65100; margin: 0 0 5px 0; font-size: 48px; font-weight: 700; line-height: 1;">
                          ${unvotedApplicants.length}
                        </p>
                        <p style="color: #ef6c00; margin: 0; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                          Applicant${unvotedApplicants.length !== 1 ? 's' : ''} Awaiting Your Review
                        </p>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
                    Your input is valuable in helping us select the scholarship recipient. Please review the following applicants at your earliest convenience:
                  </p>
                  
                  <!-- Applicants List -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #dee2e6; border-radius: 8px; overflow: hidden; margin: 0 0 30px 0;">
                    <tr>
                      <td style="background-color: #f8f9fa; padding: 15px 20px; border-bottom: 2px solid #dee2e6;">
                        <p style="color: #2d4a3e; margin: 0; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                          Pending Reviews
                        </p>
                      </td>
                    </tr>
                    ${applicantsList}
                  </table>
                  
                  <!-- CTA Button -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding: 10px 0 20px 0;">
                        <a href="https://voting.onemoredayontheatapply.com/voting" 
                           style="display: inline-block; background: linear-gradient(135deg, #2d4a3e 0%, #1f3329 100%); color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(45, 74, 62, 0.3);">
                          Start Reviewing →
                        </a>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0; text-align: center;">
                    Thank you for your time and dedication to this process.
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #dee2e6;">
                  <p style="color: #6c757d; font-size: 13px; line-height: 1.6; margin: 0 0 10px 0;">
                    <strong style="color: #2d4a3e;">One More Day on the Appalachian Trail</strong><br>
                    Memorial Scholarship Review Board
                  </p>
                  <p style="color: #adb5bd; font-size: 12px; margin: 0;">
                    This email was sent to ${boardMemberEmail}
                  </p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
  
  const text = `
Voting Reminder

Hi ${boardMemberName},

${customMessage ? `Message from Admin: ${customMessage}\n\n` : ''}

You have ${unvotedApplicants.length} applicant${unvotedApplicants.length !== 1 ? 's' : ''} awaiting your review:

${unvotedApplicants.map(app => `- ${app.firstName} ${app.lastName}`).join('\n')}

Review applicants at: https://voting.onemoredayontheatapply.com/voting
  `;
  
  return sendEmail({ to: boardMemberEmail, subject, html, text });
};

// Board message email
export const sendBoardMessage = async (
  to: string | string[],
  customMessage: string
): Promise<boolean> => {
  const subject = '📬 Message from Scholarship Review Board';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #2d4a3e 0%, #1f3329 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="color: #d4c5a0; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 1px;">
                    ONE MORE DAY
                  </h1>
                  <p style="color: #d4c5a0; margin: 8px 0 0 0; font-size: 14px; letter-spacing: 2px; text-transform: uppercase;">
                    On the Appalachian Trail
                  </p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="color: #2d4a3e; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
                    📬 Board Message
                  </h2>
                  
                  <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                    You have a message from the <strong>One More Day Scholarship Review Board</strong>:
                  </p>
                  
                  <!-- Message Box -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-left: 4px solid #2d4a3e; border-radius: 8px; margin: 0 0 30px 0;">
                    <tr>
                      <td style="padding: 25px;">
                        <p style="color: #333; margin: 0; font-size: 16px; line-height: 1.6; white-space: pre-wrap;">
                          ${customMessage}
                        </p>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- CTA Button -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding: 10px 0 20px 0;">
                        <a href="https://voting.onemoredayontheatapply.com" 
                           style="display: inline-block; background: linear-gradient(135deg, #2d4a3e 0%, #1f3329 100%); color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(45, 74, 62, 0.3);">
                          Access Review Portal →
                        </a>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0; text-align: center;">
                    If you have any questions, please reach out to the board administrator.
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #dee2e6;">
                  <p style="color: #6c757d; font-size: 13px; line-height: 1.6; margin: 0 0 10px 0;">
                    <strong style="color: #2d4a3e;">One More Day on the Appalachian Trail</strong><br>
                    Memorial Scholarship Review Board
                  </p>
                  <p style="color: #adb5bd; font-size: 12px; margin: 0;">
                    Message sent at ${new Date().toLocaleString()}
                  </p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
  
  const text = `
Board Message

You have a message from the One More Day Scholarship Review Board:

${customMessage}

Access the review portal at: https://voting.onemoredayontheatapply.com
  `;
  
  return sendEmail({ to, subject, html, text });
};
