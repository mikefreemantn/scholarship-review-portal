import { DynamoDB } from 'aws-sdk';
import { fetchAuthSession } from 'aws-amplify/auth';
import { awsRegion } from '../aws-config';
import { Applicant, Vote, Note, BoardMember, VideoSubmission } from '../types';

const APPLICANTS_TABLE = process.env.REACT_APP_APPLICANTS_TABLE || 'ScholarshipApplicants';
const VOTES_TABLE = process.env.REACT_APP_VOTES_TABLE || 'ScholarshipVotes';
const NOTES_TABLE = process.env.REACT_APP_NOTES_TABLE || 'ScholarshipNotes';
const BOARD_MEMBERS_TABLE = process.env.REACT_APP_BOARD_MEMBERS_TABLE || 'ScholarshipBoardMembers';

let dynamoDBClient: DynamoDB.DocumentClient | null = null;

async function getDynamoDBClient(): Promise<DynamoDB.DocumentClient> {
  if (dynamoDBClient) {
    return dynamoDBClient;
  }

  const session = await fetchAuthSession();
  const credentials = session.credentials;

  if (!credentials) {
    throw new Error('No credentials available');
  }

  dynamoDBClient = new DynamoDB.DocumentClient({
    region: awsRegion,
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken,
    },
  });

  return dynamoDBClient;
}

// Applicants
export async function getAllApplicants(): Promise<Applicant[]> {
  const client = await getDynamoDBClient();
  const result = await client.scan({ TableName: APPLICANTS_TABLE }).promise();
  return (result.Items || []) as Applicant[];
}

export async function getApplicant(applicantId: string): Promise<Applicant | null> {
  const client = await getDynamoDBClient();
  const result = await client.get({
    TableName: APPLICANTS_TABLE,
    Key: { applicantId },
  }).promise();
  return (result.Item as Applicant) || null;
}

export async function deleteApplicant(applicantId: string): Promise<void> {
  const client = await getDynamoDBClient();
  await client.delete({
    TableName: APPLICANTS_TABLE,
    Key: { applicantId },
  }).promise();
}

// Votes
export async function getAllVotes(): Promise<Vote[]> {
  const client = await getDynamoDBClient();
  const result = await client.scan({ TableName: VOTES_TABLE }).promise();
  return (result.Items || []) as Vote[];
}

export async function getVotesByApplicant(applicantId: string): Promise<Vote[]> {
  const client = await getDynamoDBClient();
  const result = await client.query({
    TableName: VOTES_TABLE,
    IndexName: 'ApplicantIndex',
    KeyConditionExpression: 'applicantId = :applicantId',
    ExpressionAttributeValues: {
      ':applicantId': applicantId,
    },
  }).promise();
  return (result.Items || []) as Vote[];
}

export async function getVotesByBoardMember(boardMemberEmail: string): Promise<Vote[]> {
  const client = await getDynamoDBClient();
  const result = await client.query({
    TableName: VOTES_TABLE,
    IndexName: 'BoardMemberIndex',
    KeyConditionExpression: 'boardMemberEmail = :email',
    ExpressionAttributeValues: {
      ':email': boardMemberEmail,
    },
  }).promise();
  return (result.Items || []) as Vote[];
}

export async function createVote(vote: Omit<Vote, 'voteId' | 'votedAt'>): Promise<Vote> {
  const client = await getDynamoDBClient();
  const newVote: Vote = {
    ...vote,
    voteId: `${vote.boardMemberEmail}-${vote.applicantId}`,
    votedAt: new Date().toISOString(),
  };
  
  await client.put({
    TableName: VOTES_TABLE,
    Item: newVote,
  }).promise();
  
  return newVote;
}

export async function deleteVote(voteId: string): Promise<void> {
  const client = await getDynamoDBClient();
  await client.delete({
    TableName: VOTES_TABLE,
    Key: { voteId },
  }).promise();
}

export async function deleteVotesByApplicant(applicantId: string): Promise<void> {
  const votes = await getVotesByApplicant(applicantId);
  const client = await getDynamoDBClient();
  
  for (const vote of votes) {
    await client.delete({
      TableName: VOTES_TABLE,
      Key: { voteId: vote.voteId },
    }).promise();
  }
}

// Notes
export async function getNotesByApplicant(applicantId: string): Promise<Note[]> {
  const client = await getDynamoDBClient();
  const result = await client.query({
    TableName: NOTES_TABLE,
    IndexName: 'ApplicantIndex',
    KeyConditionExpression: 'applicantId = :applicantId',
    ExpressionAttributeValues: {
      ':applicantId': applicantId,
    },
  }).promise();
  return (result.Items || []) as Note[];
}

export async function createNote(note: Omit<Note, 'noteId' | 'createdAt'>): Promise<Note> {
  const client = await getDynamoDBClient();
  const newNote: Note = {
    ...note,
    noteId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
  };
  
  await client.put({
    TableName: NOTES_TABLE,
    Item: newNote,
  }).promise();
  
  return newNote;
}

export async function deleteNote(noteId: string): Promise<void> {
  const client = await getDynamoDBClient();
  await client.delete({
    TableName: NOTES_TABLE,
    Key: { noteId },
  }).promise();
}

export async function deleteNotesByApplicant(applicantId: string): Promise<void> {
  const notes = await getNotesByApplicant(applicantId);
  const client = await getDynamoDBClient();
  
  for (const note of notes) {
    await client.delete({
      TableName: NOTES_TABLE,
      Key: { noteId: note.noteId },
    }).promise();
  }
}

// Board Members
export async function getAllBoardMembers(): Promise<BoardMember[]> {
  const client = await getDynamoDBClient();
  const result = await client.scan({ TableName: BOARD_MEMBERS_TABLE }).promise();
  return (result.Items || []) as BoardMember[];
}

export async function getBoardMember(email: string): Promise<BoardMember | null> {
  const client = await getDynamoDBClient();
  const result = await client.get({
    TableName: BOARD_MEMBERS_TABLE,
    Key: { email },
  }).promise();
  return (result.Item as BoardMember) || null;
}

export async function createBoardMember(boardMember: Omit<BoardMember, 'createdAt'>): Promise<BoardMember> {
  const client = await getDynamoDBClient();
  const newBoardMember: BoardMember = {
    ...boardMember,
    createdAt: new Date().toISOString(),
  };
  
  await client.put({
    TableName: BOARD_MEMBERS_TABLE,
    Item: newBoardMember,
  }).promise();
  
  return newBoardMember;
}

export async function updateBoardMemberAdminStatus(email: string, isAdmin: boolean): Promise<void> {
  const client = await getDynamoDBClient();
  await client.update({
    TableName: BOARD_MEMBERS_TABLE,
    Key: { email },
    UpdateExpression: 'SET isAdmin = :isAdmin',
    ExpressionAttributeValues: {
      ':isAdmin': isAdmin,
    },
  }).promise();
}

export async function deleteBoardMember(email: string): Promise<void> {
  const client = await getDynamoDBClient();
  await client.delete({
    TableName: BOARD_MEMBERS_TABLE,
    Key: { email },
  }).promise();
}

// Video Submissions (from omdat-video-submissions table in us-east-1)
export async function getAllVideoSubmissions(): Promise<VideoSubmission[]> {
  try {
    const session = await fetchAuthSession();
    const credentials = session.credentials;

    if (!credentials) {
      throw new Error('No credentials available');
    }

    const videoClient = new DynamoDB.DocumentClient({
      region: 'us-east-1',
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
        sessionToken: credentials.sessionToken,
      },
    });

    const result = await videoClient.scan({
      TableName: 'omdat-video-submissions',
    }).promise();

    return (result.Items || []) as VideoSubmission[];
  } catch (error) {
    console.error('Error fetching video submissions:', error);
    return [];
  }
}

export async function getVideoSubmissionByEmail(email: string): Promise<VideoSubmission | null> {
  try {
    const session = await fetchAuthSession();
    const credentials = session.credentials;

    if (!credentials) {
      throw new Error('No credentials available');
    }

    // Create a separate client for us-east-1 (video submissions table)
    const videoClient = new DynamoDB.DocumentClient({
      region: 'us-east-1',
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
        sessionToken: credentials.sessionToken,
      },
    });

    const result = await videoClient.scan({
      TableName: 'omdat-video-submissions',
      FilterExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email,
      },
    }).promise();

    if (result.Items && result.Items.length > 0) {
      return result.Items[0] as VideoSubmission;
    }

    return null;
  } catch (error) {
    console.error('Error fetching video submission:', error);
    return null;
  }
}
