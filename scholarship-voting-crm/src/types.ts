export interface Applicant {
  applicantId: string;
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  dateApplied: string;
  applicationUrl: string;
  aboutYourself: string;
  whyApply: string;
  challengeOrObstacle: string;
  inspiration: string;
  wishForYourself: string;
  anythingElse: string;
  contactPreference: string;
  howDidYouHear: string;
  howDidYouHearOther: string;
  createdAt: string;
}

export interface Vote {
  voteId: string;
  applicantId: string;
  boardMemberEmail: string;
  boardMemberName: string;
  score: number;
  votedAt: string;
}

export interface Note {
  noteId: string;
  applicantId: string;
  boardMemberEmail: string;
  boardMemberName: string;
  content: string;
  createdAt: string;
}

export interface BoardMember {
  email: string;
  name: string;
  isAdmin: boolean;
  createdAt: string;
}

export interface ApplicantWithStats {
  applicant: Applicant;
  averageScore?: number;
  totalVotes: number;
  userHasVoted: boolean;
  userVote?: Vote;
  notes: Note[];
}

export interface AdminTestingState {
  viewAsAllVotesComplete: boolean;
}

export interface VideoSubmission {
  id: string;
  email: string;
  name: string;
  videoUrl: string;
  message: string;
  uploadedAt: string;
  s3Key: string;
}
