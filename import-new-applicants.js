const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const fs = require('fs');
const csv = require('csv-parser');

const client = new DynamoDBClient({ region: 'us-east-2' });
const docClient = DynamoDBDocumentClient.from(client);

const applicants = [];

// Read the CSV file
fs.createReadStream('applicants_2.csv')
  .pipe(csv())
  .on('data', (row) => {
    // Map CSV columns to DynamoDB structure
    const applicant = {
      email: row['Email'].toLowerCase().trim(),
      firstName: row['First Name'],
      lastName: row['Last Name'],
      address: row['Address'],
      city: row['City'],
      state: row['State'],
      zipCode: row['Zip Code'],
      country: row['Country'],
      phone: row['Phone'],
      whyApply: row['What drew you to apply for this scholarship?'],
      challenge: row['What is a challenge or obstacle that you have faced, or are currently facing, and how might time on the trail help you to better meet this challenge?'],
      inspiration: row['Where do you find inspiration when faced with challenges and obstacles? When has your courage surprised you?'],
      wishForSelf: row['At the end of your hike (whether or not you complete the entire 2,190 miles), what do you wish for yourself?'],
      anythingElse: row['Is there anything else you would like to share or that we should consider as we are making our decision?'],
      contactPreference: row['If you are selected as a finalist, you will be contacted by one of the review team members for an interview. Please indicate how you would like to be contacted (phone, email, text).'],
      howHeard: row['How did you hear about this scholarship?'],
      howHeardOther: row['If you answered "other" above, please share how you learned about this scholarship opportunity.'] || '',
      status: row['Status'] || 'Submitted',
      applicationUrl: row['Application URL'],
      aboutYourself: row['Tell us about yourself.'],
      dateApplied: row['Date Applied'],
      createdAt: new Date().toISOString(),
    };
    
    applicants.push(applicant);
  })
  .on('end', async () => {
    console.log(`Found ${applicants.length} applicants to import`);
    
    for (const applicant of applicants) {
      try {
        const params = {
          TableName: 'ScholarshipApplicants',
          Item: applicant,
        };
        
        await docClient.send(new PutCommand(params));
        console.log(`✅ Added: ${applicant.firstName} ${applicant.lastName} (${applicant.email})`);
      } catch (error) {
        console.error(`❌ Error adding ${applicant.email}:`, error.message);
      }
    }
    
    console.log('\n✅ Import complete!');
  });
