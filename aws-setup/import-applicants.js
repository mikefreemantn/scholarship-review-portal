const AWS = require('aws-sdk');
const fs = require('fs');
const csv = require('csv-parser');
const { v4: uuidv4 } = require('uuid');

// Configure AWS
AWS.config.update({ region: 'us-east-2' });
const dynamodb = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = 'ScholarshipApplicants';

// Fields to exclude from import
const EXCLUDED_FIELDS = [
  'Status',
  'Reviewed By Matt',
  'Reviewed By Maggie',
  'Reviewed By Babs & Tom',
  'Reviewed By F-Word',
  'Reviewed By Harvey'
];

async function importApplicants() {
  const applicants = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream('../applicants.csv')
      .pipe(csv())
      .on('data', (row) => {
        // Create applicant object, excluding specified fields
        const applicant = {
          applicantId: uuidv4(),
          firstName: row['First Name'],
          lastName: row['Last Name'],
          email: row['Email'],
          address: row['Address'],
          city: row['City'],
          state: row['State'],
          zipCode: row['Zip Code'],
          country: row['Country'],
          phone: row['Phone'],
          dateApplied: row['Date Applied'],
          applicationUrl: row['Application URL'],
          aboutYourself: row['Tell us about yourself.'],
          whyApply: row['What drew you to apply for this scholarship?'],
          challengeOrObstacle: row['What is a challenge or obstacle that you have faced, or are currently facing, and how might time on the trail help you to better meet this challenge?'],
          inspiration: row['Where do you find inspiration when faced with challenges and obstacles? When has your courage surprised you?'],
          wishForYourself: row['At the end of your hike (whether or not you complete the entire 2,190 miles), what do you wish for yourself?'],
          anythingElse: row['Is there anything else you would like to share or that we should consider as we are making our decision?'],
          contactPreference: row['If you are selected as a finalist, you will be contacted by one of the review team members for an interview. Please indicate how you would like to be contacted (phone, email, text).'],
          howDidYouHear: row['How did you hear about this scholarship?'],
          howDidYouHearOther: row['If you answered "other" above, please share how you learned about this scholarship opportunity.'],
          createdAt: new Date().toISOString()
        };
        
        applicants.push(applicant);
      })
      .on('end', async () => {
        console.log(`Parsed ${applicants.length} applicants from CSV`);
        
        // Batch write to DynamoDB
        try {
          for (let i = 0; i < applicants.length; i += 25) {
            const batch = applicants.slice(i, i + 25);
            const putRequests = batch.map(applicant => ({
              PutRequest: {
                Item: applicant
              }
            }));
            
            const params = {
              RequestItems: {
                [TABLE_NAME]: putRequests
              }
            };
            
            await dynamodb.batchWrite(params).promise();
            console.log(`Imported batch ${Math.floor(i / 25) + 1}`);
          }
          
          console.log('All applicants imported successfully!');
          resolve();
        } catch (error) {
          console.error('Error importing applicants:', error);
          reject(error);
        }
      })
      .on('error', reject);
  });
}

// Run import
importApplicants()
  .then(() => {
    console.log('Import complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Import failed:', error);
    process.exit(1);
  });
