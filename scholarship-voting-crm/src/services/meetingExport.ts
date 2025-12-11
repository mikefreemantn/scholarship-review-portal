import { ApplicantWithStats, Vote, BoardMember } from '../types';

interface MeetingOverviewProps {
  applicantsWithStats: ApplicantWithStats[];
  allVotes: Vote[];
  boardMembers: BoardMember[];
  onProgress?: (current: number, total: number) => void;
}

export async function generateMeetingOverviewHTML({
  applicantsWithStats,
  allVotes,
  boardMembers,
  onProgress
}: MeetingOverviewProps): Promise<void> {
  // Sort by average score (highest first)
  const rankedApplicants = [...applicantsWithStats]
    .filter(a => a.totalVotes > 0)
    .sort((a, b) => {
      const scoreA = a.averageScore || 0;
      const scoreB = b.averageScore || 0;
      if (scoreB !== scoreA) return scoreB - scoreA;
      return b.totalVotes - a.totalVotes;
    });

  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Scholarship Meeting Overview - ${new Date().toLocaleDateString()}</title>
  <style>
    @media print {
      .page-break { page-break-before: always; }
    }
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 20px;
      min-height: 100vh;
      background-color: #0f1a16;
      background-image: url('/assets/images/background.png');
      background-size: cover;
      background-position: center;
      background-attachment: fixed;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    .title-page {
      background: rgba(15, 26, 22, 0.9);
      color: #d4c5a0;
      padding: 80px 40px;
      text-align: center;
      border-radius: 12px;
      margin-bottom: 30px;
      box-shadow: 0 12px 30px rgba(0,0,0,0.4);
    }
    .title-logo {
      margin-bottom: 30px;
    }
    .title-logo img {
      max-width: 420px;
      width: 100%;
      height: auto;
      display: inline-block;
    }
    .title-page h3 {
      font-size: 24px;
      color: #ffffff;
      margin: 0 0 16px 0;
      letter-spacing: 1px;
    }
    .title-page p {
      font-size: 16px;
      margin: 0;
    }
    .applicant-card {
      background: white;
      border-radius: 12px;
      padding: 30px;
      margin-bottom: 30px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .applicant-header {
      background: linear-gradient(135deg, #2d4a3e 0%, #1f3329 100%);
      color: #d4c5a0;
      padding: 20px 30px;
      border-radius: 8px;
      margin: -30px -30px 20px -30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .applicant-header h2 {
      margin: 0;
      font-size: 28px;
    }
    .applicant-header .score {
      background: rgba(255,255,255,0.2);
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 20px;
      font-weight: bold;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin-bottom: 20px;
    }
    .info-section h3 {
      color: #2d4a3e;
      font-size: 16px;
      margin: 0 0 10px 0;
      font-weight: 600;
    }
    .info-section p {
      margin: 5px 0;
      color: #333;
      font-size: 14px;
    }
    .summary {
      background: #f9f9f9;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #2d4a3e;
      margin: 20px 0;
    }
    .summary h3 {
      color: #2d4a3e;
      margin: 0 0 10px 0;
    }
    .summary ul {
      margin: 0;
      padding-left: 20px;
    }
    .summary li {
      margin: 8px 0;
      color: #333;
    }
    .profile-link {
      background: #f4f4f4;
      padding: 15px;
      border-radius: 8px;
      text-align: center;
      margin: 20px 0;
    }
    .profile-link a {
      color: #0066cc;
      text-decoration: none;
      font-weight: 600;
    }
    .essays {
      margin-top: 20px;
    }
    .essay {
      margin: 15px 0;
      padding: 15px;
      background: #f9f9f9;
      border-radius: 8px;
    }
    .essay h4 {
      color: #2d4a3e;
      margin: 0 0 8px 0;
      font-size: 14px;
    }
    .essay p {
      margin: 0;
      color: #555;
      font-size: 13px;
      font-style: italic;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="title-page">
      <div class="title-logo">
        <img src="/assets/images/toplogo_carved-2.png" alt="One More Day on the Appalachian Trail" />
      </div>
      <h3>Scholarship Applicant Review</h3>
      <p>${rankedApplicants.length} Candidates • ${new Date().toLocaleDateString()}</p>
    </div>
`;

  // Generate cards for each applicant
  for (let i = 0; i < rankedApplicants.length; i++) {
    const { applicant, averageScore, totalVotes } = rankedApplicants[i];
    const rank = i + 1;
    
    if (onProgress) {
      onProgress(i + 1, rankedApplicants.length);
    }

    const profileUrl = `https://voting.onemoredayontheatapply.com/voting/${applicant.applicantId}`;
    
    // Get individual board member votes
    const applicantVotes = allVotes.filter(v => v.applicantId === applicant.applicantId);
    const votesList = boardMembers.map(member => {
      const vote = applicantVotes.find(v => v.boardMemberEmail === member.email);
      return `<tr>
        <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${member.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; text-align: center; font-weight: bold; color: ${vote ? '#2d4a3e' : '#999'};">
          ${vote ? vote.score + '/10' : 'Not voted'}
        </td>
      </tr>`;
    }).join('');

    html += `
    <div class="applicant-card ${i > 0 ? 'page-break' : ''}">
      <div class="applicant-header">
        <h2>#${rank} • ${applicant.firstName} ${applicant.lastName}</h2>
        <div class="score">Average: ${averageScore?.toFixed(1) || 'N/A'}/10 (${totalVotes} votes)</div>
      </div>
      
      <div class="info-grid">
        <div class="info-section">
          <h3>Contact Information</h3>
          <p>📧 ${applicant.email}</p>
          <p>📱 ${applicant.phone}</p>
          <p>📍 ${applicant.address}</p>
          <p>🏙️ ${applicant.city}, ${applicant.state} ${applicant.zipCode}</p>
          <p><strong>Applied:</strong> ${new Date(applicant.dateApplied).toLocaleDateString()}</p>
        </div>
        
        <div class="info-section">
          <h3>Board Member Votes</h3>
          <table style="width: 100%; border-collapse: collapse;">
            ${votesList}
          </table>
        </div>
      </div>
      
      <div class="profile-link">
        🔗 <a href="${profileUrl}" target="_blank">View Full Profile</a>
      </div>
      
      <div class="essays">
        <h3 style="color: #2d4a3e; margin-bottom: 15px;">Full Application</h3>
        
        <div class="essay">
          <h4>About Yourself:</h4>
          <p>${applicant.aboutYourself}</p>
        </div>
        
        <div class="essay">
          <h4>Why are you applying for this scholarship?</h4>
          <p>${applicant.whyApply}</p>
        </div>
        
        <div class="essay">
          <h4>Describe a challenge or obstacle you've overcome:</h4>
          <p>${applicant.challengeOrObstacle}</p>
        </div>
        
        <div class="essay">
          <h4>What inspires you?</h4>
          <p>${applicant.inspiration}</p>
        </div>
        
        <div class="essay">
          <h4>What do you wish for yourself?</h4>
          <p>${applicant.wishForYourself}</p>
        </div>
        
        ${applicant.anythingElse ? `
        <div class="essay">
          <h4>Anything else you'd like us to know:</h4>
          <p>${applicant.anythingElse}</p>
        </div>
        ` : ''}
      </div>
    </div>
`;
  }

  html += `
  </div>
</body>
</html>
`;

  // Open in new tab instead of downloading
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const newWindow = window.open(url, '_blank');
  
  // Clean up the URL after a delay to allow the window to load
  if (newWindow) {
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
