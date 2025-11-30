#!/bin/bash

# Setup DynamoDB tables for Scholarship Voting CRM
# This script creates all necessary tables

echo "Creating DynamoDB tables..."

# Create Applicants table
aws dynamodb create-table \
    --table-name ScholarshipApplicants \
    --attribute-definitions \
        AttributeName=applicantId,AttributeType=S \
    --key-schema \
        AttributeName=applicantId,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST

echo "Created ScholarshipApplicants table"

# Create Votes table
aws dynamodb create-table \
    --table-name ScholarshipVotes \
    --attribute-definitions \
        AttributeName=voteId,AttributeType=S \
        AttributeName=applicantId,AttributeType=S \
        AttributeName=boardMemberEmail,AttributeType=S \
    --key-schema \
        AttributeName=voteId,KeyType=HASH \
    --global-secondary-indexes \
        "[
            {
                \"IndexName\": \"ApplicantIndex\",
                \"KeySchema\": [{\"AttributeName\":\"applicantId\",\"KeyType\":\"HASH\"}],
                \"Projection\":{\"ProjectionType\":\"ALL\"}
            },
            {
                \"IndexName\": \"BoardMemberIndex\",
                \"KeySchema\": [{\"AttributeName\":\"boardMemberEmail\",\"KeyType\":\"HASH\"}],
                \"Projection\":{\"ProjectionType\":\"ALL\"}
            }
        ]" \
    --billing-mode PAY_PER_REQUEST

echo "Created ScholarshipVotes table"

# Create Notes table
aws dynamodb create-table \
    --table-name ScholarshipNotes \
    --attribute-definitions \
        AttributeName=noteId,AttributeType=S \
        AttributeName=applicantId,AttributeType=S \
    --key-schema \
        AttributeName=noteId,KeyType=HASH \
    --global-secondary-indexes \
        "[
            {
                \"IndexName\": \"ApplicantIndex\",
                \"KeySchema\": [{\"AttributeName\":\"applicantId\",\"KeyType\":\"HASH\"}],
                \"Projection\":{\"ProjectionType\":\"ALL\"}
            }
        ]" \
    --billing-mode PAY_PER_REQUEST

echo "Created ScholarshipNotes table"

# Create Board Members table
aws dynamodb create-table \
    --table-name ScholarshipBoardMembers \
    --attribute-definitions \
        AttributeName=email,AttributeType=S \
    --key-schema \
        AttributeName=email,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST

echo "Created ScholarshipBoardMembers table"

echo "All tables created successfully!"
echo "Waiting for tables to become active..."

aws dynamodb wait table-exists --table-name ScholarshipApplicants
aws dynamodb wait table-exists --table-name ScholarshipVotes
aws dynamodb wait table-exists --table-name ScholarshipNotes
aws dynamodb wait table-exists --table-name ScholarshipBoardMembers

echo "All tables are now active!"
