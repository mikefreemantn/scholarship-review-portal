#!/bin/bash

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Amanda Jones
aws dynamodb put-item --table-name ScholarshipApplicants --region us-east-2 --item '{
  "applicantId": {"S": "amanda-jones-'$(uuidgen | tr '[:upper:]' '[:lower:]')'"},
  "email": {"S": "funkmeblind@gmail.com"},
  "firstName": {"S": "Amanda"},
  "lastName": {"S": "Jones"},
  "address": {"S": "92 county road 658"},
  "city": {"S": "Hanceville"},
  "state": {"S": "AL - Alabama"},
  "zipCode": {"S": "35077.0"},
  "country": {"S": "United States"},
  "phone": {"S": "12568876043"},
  "whyApply": {"S": "my soul feels the need to hike the entire AT or as far as I can go. The expense of proper equipment is a downfall for me. But it'\''s something that I must do."},
  "challengeOrObstacle": {"S": "With a diagnosis of I'\''m going completely blind around the corner. I'\''m scared. I need this hike. I need to see everything I can while I can. I need to take pictures so my daughters can tell me-about them when I can'\''t see them with my own eyes. Taking this  thru hike will give me and maybe someone else they encouragement to never stop living."},
  "inspiration": {"S": "When I'\''m face with challenges, I find my inspiration in my children'\''s eyes and their words. Or I will often find myself in the backyard near thebiggest tree crying my eyes out and somehow it makes me feel better more grounded. My courage has surprised me when I had to deal withmy baby brother Committing suicide in front of me when he came home from Iraq."},
  "wishForYourself": {"S": "to always see, even when I cannot."},
  "anythingElse": {"S": "it is such a blessing to just be considered for this opportunity so thank you for all you do."},
  "contactPreference": {"S": "Phone"},
  "howDidYouHear": {"S": "Social Media"},
  "howDidYouHearOther": {"S": ""},
  "applicationUrl": {"S": "https://drive.google.com/drive/folders/12EhJzdBs3TEPF8l4E4OaXtfY2qSF52DU"},
  "aboutYourself": {"S": "I am a 50-year-old female. Mother of two girls. I have been given a diagnosis of going blind. I have two rapidly mutating genes that is causing my sight to go. I am finding that being outside and taking in every thing I can while I can helps ease my some of my fears. I have been made to stop working and draw disability now."},
  "dateApplied": {"S": "November 24 2025"},
  "createdAt": {"S": "'"$TIMESTAMP"'"}
}'

echo "✅ Added Amanda Jones"

# Christie Ogden-Kristoff
aws dynamodb put-item --table-name ScholarshipApplicants --region us-east-2 --item '{
  "applicantId": {"S": "christie-ogden-kristoff-'$(uuidgen | tr '[:upper:]' '[:lower:]')'"},
  "email": {"S": "whatifitsamazing@gmail.com"},
  "firstName": {"S": "Christie"},
  "lastName": {"S": "Ogden-Kristoff"},
  "address": {"S": "495 stewart rd"},
  "city": {"S": "Salt spring island"},
  "state": {"S": "WA - Washington"},
  "zipCode": {"S": "98039.0"},
  "country": {"S": "Canada"},
  "phone": {"S": "17808607958"},
  "whyApply": {"S": "I have always wanted to thru hike the Appalachian Trail. Over the years I have put off the trail because of physical or emotional disabilities that I have battled over the years."},
  "challengeOrObstacle": {"S": "I have been dealing with PTSD for many years. After surviving horrible domestic abuse as well as the death of one of my children, my mental state was affected by PTSD. This affects me in my every day life. Being on the trail helps myself and my children to connect and be present. It helps my mental health to be out in nature."},
  "inspiration": {"S": "My kids are what keep me going. I want them to know that we can do anything if we put our minds to it. My courage has most surprised me in 2011 when I made the decision to take my kids (the 15 year old was under a year old) and move to the Caribbean. After renting a cabin, and buying flights I had $300 for the next month. I had to figure out how to make things work fast! I just KNEW that I needed make this work for myself and my kids"},
  "wishForYourself": {"S": "My goal at the end of the trail is for myself and my kids become closer and have better mental health."},
  "anythingElse": {"S": "Hiking is important to myself and my family. We live on a very small budget and we hike with what we can afford. We are a family that is always together"},
  "contactPreference": {"S": "Email"},
  "howDidYouHear": {"S": "Other"},
  "howDidYouHearOther": {"S": "I heard about the scholarship from a hiking group on facebook that I am in."},
  "applicationUrl": {"S": "https://drive.google.com/drive/folders/15Mx-JU7OKuAmAIeiFEjnuIJCINCRdxbt"},
  "aboutYourself": {"S": "I am a 52 year old mom of 6. I have 4 adult kids and 2 young kids who are 15 and 11. My 15 year old has profound autism and cognitive disabilities. He will always need assistance for the basics. We love to hike together as a family."},
  "dateApplied": {"S": "November 26 2025"},
  "createdAt": {"S": "'"$TIMESTAMP"'"}
}'

echo "✅ Added Christie Ogden-Kristoff"
echo ""
echo "✅ Import complete!"
