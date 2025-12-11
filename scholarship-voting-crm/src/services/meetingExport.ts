import { ApplicantWithStats } from '../types';

async function generateAISummary(applicant: any): Promise<string> {
  try {
    const prompt = `Summarize this scholarship applicant's profile in 3-4 concise bullet points for a board meeting presentation. Focus on their key strengths, experiences, and why they're a strong candidate:

Name: ${applicant.firstName} ${applicant.lastName}
Location: ${applicant.city}, ${applicant.state}

About: ${applicant.aboutYourself}

Why they're applying: ${applicant.whyApply}

Challenge overcome: ${applicant.challengeOrObstacle}

Inspiration: ${applicant.inspiration}

Goals: ${applicant.wishForYourself}

Keep it brief and impactful (3-4 bullet points max).`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a concise summarizer for scholarship board meetings. Create brief, impactful bullet points.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      throw new Error('AI summary failed');
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating AI summary:', error);
    return `• ${applicant.firstName} ${applicant.lastName} from ${applicant.city}, ${applicant.state}\n• Applying for the One More Day scholarship\n• See full application for details`;
  }
}

export async function generateMeetingOverviewHTML(
  applicantsWithStats: ApplicantWithStats[],
  onProgress?: (current: number, total: number) => void
): Promise<void> {
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
      background: #f4f4f4;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    .title-page {
      background: linear-gradient(135deg, #2d4a3e 0%, #1f3329 100%);
      color: #d4c5a0;
      padding: 100px 40px;
      text-align: center;
      border-radius: 12px;
      margin-bottom: 30px;
    }
    .title-page h1 {
      font-size: 48px;
      margin: 0 0 10px 0;
      letter-spacing: 2px;
    }
    .title-page h2 {
      font-size: 20px;
      margin: 0 0 40px 0;
      letter-spacing: 3px;
      text-transform: uppercase;
    }
    .title-page h3 {
      font-size: 24px;
      color: white;
      margin: 0 0 20px 0;
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
      <h1>ONE MORE DAY</h1>
      <h2>On the Appalachian Trail</h2>
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

    const aiSummary = await generateAISummary(applicant);
    const profileUrl = `https://voting.onemoredayontheatapply.com/voting/${applicant.applicantId}`;
    
    const whyApplyPreview = applicant.whyApply.substring(0, 200) + (applicant.whyApply.length > 200 ? '...' : '');
    const challengePreview = applicant.challengeOrObstacle.substring(0, 200) + (applicant.challengeOrObstacle.length > 200 ? '...' : '');

    html += `
    <div class="applicant-card ${i > 0 ? 'page-break' : ''}">
      <div class="applicant-header">
        <h2>#${rank} • ${applicant.firstName} ${applicant.lastName}</h2>
        <div class="score">Score: ${averageScore?.toFixed(1) || 'N/A'}/10 (${totalVotes} votes)</div>
      </div>
      
      <div class="info-grid">
        <div class="info-section">
          <h3>Contact Information</h3>
          <p>📧 ${applicant.email}</p>
          <p>📱 ${applicant.phone}</p>
          <p>📍 ${applicant.address}</p>
          <p>🏙️ ${applicant.city}, ${applicant.state} ${applicant.zipCode}</p>
        </div>
        
        <div class="info-section">
          <h3>Application Details</h3>
          <p><strong>Applied:</strong> ${new Date(applicant.dateApplied).toLocaleDateString()}</p>
          <p><strong>Contact Preference:</strong> ${applicant.contactPreference}</p>
          <p><strong>How they heard:</strong> ${applicant.howDidYouHear}</p>
        </div>
      </div>
      
      <div class="summary">
        <h3>🤖 AI Summary</h3>
        <div style="white-space: pre-wrap;">${aiSummary}</div>
      </div>
      
      <div class="profile-link">
        🔗 <a href="${profileUrl}" target="_blank">View Full Profile</a>
      </div>
      
      <div class="essays">
        <h3 style="color: #2d4a3e; margin-bottom: 15px;">Key Essays</h3>
        <div class="essay">
          <h4>Why applying for this scholarship:</h4>
          <p>${whyApplyPreview}</p>
        </div>
        <div class="essay">
          <h4>Challenge overcome:</h4>
          <p>${challengePreview}</p>
        </div>
      </div>
    </div>
`;
  }

  html += `
  </div>
</body>
</html>
`;

  // Create and download the HTML file
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Scholarship_Meeting_Overview_${new Date().toISOString().split('T')[0]}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
