import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, MessageCircle, Send, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ApplicantWithStats, VideoSubmission } from '../types';
import { VotingSlider } from './VotingSlider';
import { NotesSection } from './NotesSection';
import { ApplicantDetail } from './ApplicantDetail';
import { createVote, createNote, deleteNote, getVideoSubmissionByEmail } from '../services/dynamodb';

interface VotingReviewProps {
  applicantsWithStats: ApplicantWithStats[];
  currentUserEmail: string;
  currentUserName: string;
  isAdmin: boolean;
  onVoteSubmitted: () => void;
  initialApplicantId?: string;
}

export const VotingReview: React.FC<VotingReviewProps> = ({
  applicantsWithStats,
  currentUserEmail,
  currentUserName,
  isAdmin,
  onVoteSubmitted,
  initialApplicantId,
}) => {
  const [currentApplicantId, setCurrentApplicantId] = useState<string | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [videoSubmission, setVideoSubmission] = useState<VideoSubmission | null>(null);
  
  // AI Chat state
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  
  // Starter prompts for AI chat
  const starterPrompts = [
    { label: 'Overview', prompt: 'Give me a high-level overview of this applicant.' },
    { label: 'Strengths', prompt: 'What are the key strengths of this applicant?' },
    { label: 'Challenges', prompt: 'What challenges has this person faced?' },
    { label: 'Motivation', prompt: 'Why do they want to hike the AT?' },
    { label: 'Red Flags', prompt: 'Are there any concerns or red flags I should consider?' },
    { label: 'Standout', prompt: 'What makes this applicant stand out from others?' },
  ];

  // Set current applicant from URL or default to first unvoted
  useEffect(() => {
    if (initialApplicantId) {
      setCurrentApplicantId(initialApplicantId);
    } else if (applicantsWithStats.length > 0 && !currentApplicantId) {
      const firstUnvoted = applicantsWithStats.find(a => !a.userHasVoted);
      if (firstUnvoted) {
        setCurrentApplicantId(firstUnvoted.applicant.applicantId);
      }
    }
  }, [initialApplicantId, applicantsWithStats, currentApplicantId]);

  // Get current applicant by ID
  const currentApplicantWithStats = applicantsWithStats.find(
    a => a.applicant.applicantId === currentApplicantId
  );
  
  // Fetch video submission when applicant changes
  useEffect(() => {
    const fetchVideo = async () => {
      if (currentApplicantWithStats) {
        try {
          const video = await getVideoSubmissionByEmail(currentApplicantWithStats.applicant.email);
          setVideoSubmission(video);
        } catch (error) {
          console.error('Error fetching video:', error);
          setVideoSubmission(null);
        }
      }
    };
    fetchVideo();
  }, [currentApplicantWithStats]);

  // Get current index in all applicants
  const currentIndexInAll = applicantsWithStats.findIndex(
    a => a.applicant.applicantId === currentApplicantId
  );
  
  // Filter to only unvoted applicants for progress display
  const unvotedApplicants = applicantsWithStats.filter(a => !a.userHasVoted);

  // If all voted, show first applicant
  useEffect(() => {
    if (unvotedApplicants.length === 0 && applicantsWithStats.length > 0) {
      // All voted, could show a completion message
    }
  }, [unvotedApplicants.length, applicantsWithStats.length]);

  if (!currentApplicantWithStats) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            All Votes Complete!
          </h2>
          <p className="text-gray-600">
            You've voted on all applicants. Check the Dashboard to see the rankings.
          </p>
        </div>
      </div>
    );
  }

  const { applicant, notes, averageScore } = currentApplicantWithStats;

  const handleVote = async (score: number) => {
    setIsSubmitting(true);
    try {
      await createVote({
        applicantId: applicant.applicantId,
        boardMemberEmail: currentUserEmail,
        boardMemberName: currentUserName,
        score,
      });
      
      onVoteSubmitted();
      
      // Move to next unvoted applicant if available
      const nextUnvoted = applicantsWithStats.find((a, idx) => 
        idx > currentIndexInAll && !a.userHasVoted
      );
      if (nextUnvoted) {
        setCurrentApplicantId(nextUnvoted.applicant.applicantId);
      } else if (currentIndexInAll < applicantsWithStats.length - 1) {
        // No more unvoted, just go to next applicant
        setCurrentApplicantId(applicantsWithStats[currentIndexInAll + 1].applicant.applicantId);
      }
    } catch (error) {
      console.error('Error submitting vote:', error);
      alert('Failed to submit vote. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddNote = async (content: string) => {
    try {
      await createNote({
        applicantId: applicant.applicantId,
        boardMemberEmail: currentUserEmail,
        boardMemberName: currentUserName,
        content,
      });
      onVoteSubmitted(); // Refresh data
    } catch (error) {
      console.error('Error adding note:', error);
      alert('Failed to add note. Please try again.');
    }
  };

  const handleStarterPrompt = async (prompt: string) => {
    const userMessage = prompt;
    
    const newMessages = [...chatMessages, { role: 'user' as const, content: userMessage }];
    setChatMessages(newMessages);
    setIsChatLoading(true);

    try {
      const response = await fetch('https://nyi4p209lh.execute-api.us-east-2.amazonaws.com/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicant: applicant,
          message: userMessage,
          conversationHistory: chatMessages
        }),
      });

      const data = await response.json();

      if (data.success) {
        setChatMessages([...newMessages, { role: 'assistant', content: data.response }]);
      } else {
        setChatMessages([...newMessages, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
      }
    } catch (error) {
      console.error('Error calling AI chat:', error);
      setChatMessages([...newMessages, { role: 'assistant', content: 'Sorry, I couldn\'t connect to the AI service.' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleSendChatMessage = async (messageOverride?: string) => {
    const userMessage = messageOverride || chatInput.trim();
    if (!userMessage || isChatLoading) return;

    setChatInput('');
    
    const newMessages = [...chatMessages, { role: 'user' as const, content: userMessage }];
    setChatMessages(newMessages);
    setIsChatLoading(true);

    try {
      const response = await fetch('https://nyi4p209lh.execute-api.us-east-2.amazonaws.com/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicant: applicant,
          message: userMessage,
          conversationHistory: chatMessages
        }),
      });

      const data = await response.json();

      if (data.success) {
        setChatMessages([...newMessages, { role: 'assistant', content: data.response }]);
      } else {
        setChatMessages([...newMessages, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
      }
    } catch (error) {
      console.error('Error calling AI chat:', error);
      setChatMessages([...newMessages, { role: 'assistant', content: 'Sorry, I couldn\'t connect to the AI service.' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }
    
    try {
      await deleteNote(noteId);
      onVoteSubmitted(); // Refresh data
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Failed to delete note. Please try again.');
    }
  };

  const handleNext = () => {
    if (currentIndexInAll < applicantsWithStats.length - 1) {
      setCurrentApplicantId(applicantsWithStats[currentIndexInAll + 1].applicant.applicantId);
      setChatMessages([]); // Reset chat for new applicant
      setChatInput('');
    }
  };

  const handlePrevious = () => {
    if (currentIndexInAll > 0) {
      setCurrentApplicantId(applicantsWithStats[currentIndexInAll - 1].applicant.applicantId);
      setChatMessages([]); // Reset chat for new applicant
      setChatInput('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            {currentIndexInAll >= 0 ? `Applicant ${currentIndexInAll + 1} of ${applicantsWithStats.length}` : 'Viewing Applicant'}
          </span>
          <span className="text-sm text-gray-600">
            {applicantsWithStats.filter(a => a.userHasVoted).length} voted, {unvotedApplicants.length} remaining
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-primary-600 h-3 rounded-full transition-all duration-300"
            style={{
              width: `${currentIndexInAll >= 0 ? ((currentIndexInAll + 1) / applicantsWithStats.length) * 100 : 0}%`,
            }}
          />
        </div>
      </div>

      {/* Applicant Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {applicant.firstName} {applicant.lastName}
          </h2>
          <p className="text-gray-600">
            {applicant.city}, {applicant.state}
          </p>
        </div>

        {/* Video Submission */}
        {videoSubmission && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 text-lg">Video Application</h3>
            <div className="bg-gray-900 rounded-lg overflow-hidden mb-3">
              <video
                controls
                className="w-full"
                style={{ maxHeight: '500px' }}
              >
                <source src={videoSubmission.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
            <a
              href={videoSubmission.videoUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Video not playing? Download it
            </a>
            {videoSubmission.message && (
              <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700 italic">"{videoSubmission.message}"</p>
              </div>
            )}
          </div>
        )}

        {/* Contact Information */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-3 text-lg">Contact Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Email:</span>
              <p className="font-medium text-gray-900">{applicant.email}</p>
            </div>
            <div>
              <span className="text-gray-600">Phone:</span>
              <p className="font-medium text-gray-900">{applicant.phone}</p>
            </div>
            <div>
              <span className="text-gray-600">Address:</span>
              <p className="font-medium text-gray-900">{applicant.address}</p>
            </div>
            <div>
              <span className="text-gray-600">Location:</span>
              <p className="font-medium text-gray-900">{applicant.city}, {applicant.state} {applicant.zipCode}</p>
            </div>
          </div>
        </div>

        {/* Full Profile */}
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2 text-lg">About</h3>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{applicant.aboutYourself}</p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-2 text-lg">Why They Applied</h3>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{applicant.whyApply}</p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2 text-lg">Challenge or Obstacle</h3>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{applicant.challengeOrObstacle}</p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2 text-lg">What Inspires Them</h3>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{applicant.inspiration}</p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2 text-lg">Their Wish</h3>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{applicant.wishForYourself}</p>
          </div>

          {applicant.anythingElse && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2 text-lg">Anything Else</h3>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{applicant.anythingElse}</p>
            </div>
          )}

          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              <span className="font-medium">How they heard about us:</span> {applicant.howDidYouHear}
              {applicant.howDidYouHearOther && ` - ${applicant.howDidYouHearOther}`}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              <span className="font-medium">Applied:</span> {new Date(applicant.dateApplied).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      <NotesSection
        notes={notes}
        onAddNote={handleAddNote}
        onDeleteNote={handleDeleteNote}
        currentUserEmail={currentUserEmail}
        isAdmin={isAdmin}
      />

      {/* AI Chat Section */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-semibold mb-4 text-primary-600 flex items-center gap-2">
          <MessageCircle className="flex-shrink-0" size={20} />
          <span>Ask AI About This Applicant</span>
        </h3>
        
        {chatMessages.length === 0 ? (
          <p className="text-gray-600 mb-4">
            Ask questions about {applicant.firstName}'s application. The AI will only use information from their profile.
          </p>
        ) : (
          <div className="mb-4 max-h-64 overflow-y-auto space-y-3 border rounded-lg p-2 sm:p-4 bg-gray-50">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] sm:max-w-[80%] rounded-lg p-2.5 sm:p-3 ${msg.role === 'user' ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-900'}`}>
                  {msg.role === 'user' ? (
                    <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                  ) : (
                    <div className="text-sm prose prose-sm max-w-none prose-headings:mt-2 prose-headings:mb-1 prose-p:my-1 prose-ul:my-1 prose-li:my-0">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isChatLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <Loader2 className="animate-spin text-primary-600" size={20} />
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Starter Prompts */}
        {chatMessages.length === 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5 sm:gap-2">
            {starterPrompts.map((starter, idx) => (
              <button
                key={idx}
                onClick={() => handleStarterPrompt(starter.prompt)}
                disabled={isChatLoading}
                className="px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm bg-primary-50 text-primary-700 border border-primary-200 rounded-full hover:bg-primary-100 hover:border-primary-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {starter.label}
              </button>
            ))}
          </div>
        )}
        
        <div className="flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={(e) => { if (e.key === 'Enter') handleSendChatMessage(); }}
            placeholder="Ask a question..."
            className="flex-1 border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary-500"
            disabled={isChatLoading}
          />
          <button
            onClick={() => handleSendChatMessage()}
            disabled={!chatInput.trim() || isChatLoading}
            className="bg-primary-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2 flex-shrink-0"
          >
            <Send size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
        </div>
      </div>

      {/* Voting Section */}
      {!currentApplicantWithStats.userHasVoted ? (
        <VotingSlider onVote={handleVote} disabled={isSubmitting} />
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <div className="text-green-600 font-semibold mb-2">✓ You've already voted on this applicant</div>
          {averageScore !== undefined && (
            <div className="text-gray-700">Average Score: <span className="font-bold text-lg">{averageScore.toFixed(1)}</span></div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between gap-2 sm:gap-4">
        <button
          onClick={handlePrevious}
          disabled={currentIndexInAll === 0}
          className="flex items-center gap-2 sm:gap-3 px-4 sm:px-8 py-3 sm:py-4 bg-white border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-semibold text-sm sm:text-lg shadow-md"
        >
          <ArrowLeft size={20} className="sm:w-6 sm:h-6 flex-shrink-0" />
          <span className="hidden xs:inline">Previous</span>
          <span className="xs:hidden">Prev</span>
        </button>
        <button
          onClick={handleNext}
          disabled={currentIndexInAll >= applicantsWithStats.length - 1}
          className="flex items-center gap-2 sm:gap-3 px-4 sm:px-8 py-3 sm:py-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-semibold text-sm sm:text-lg shadow-md"
          style={{backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.05) 20px, rgba(255,255,255,0.05) 40px)'}}
        >
          <span className="hidden xs:inline">Next</span>
          <span className="xs:hidden">Next</span>
          <ArrowRight size={20} className="sm:w-6 sm:h-6 flex-shrink-0" />
        </button>
      </div>

      {/* Applicant Detail Modal */}
      {showDetail && (
        <ApplicantDetail
          applicant={applicant}
          averageScore={averageScore}
          showScore={false}
          onClose={() => setShowDetail(false)}
        />
      )}
    </div>
  );
};
