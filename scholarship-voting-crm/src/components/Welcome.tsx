import React from 'react';
import { Heart, Video, FileText, ThumbsUp, Users, CheckCircle, MessageCircle, Search } from 'lucide-react';

export const Welcome: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Hero Section */}
      <div className="bg-primary-600 rounded-lg shadow-lg p-8 text-center" style={{backgroundImage: 'url(/assets/images/background.png)', backgroundSize: 'cover', backgroundPosition: 'center'}}>
        <h1 className="text-3xl font-bold text-white mb-4">
          Welcome to the Review Board (2026)
        </h1>
        <p className="text-lg text-accent-100 leading-relaxed">
          Thank you for joining us in selecting this year's <strong className="text-accent-300">One More Day on the AT</strong> scholarship recipient. 
          Your role is vital in helping us select those who are truly deserving hiker's Appalachian Trail journey.
        </p>
      </div>

      {/* How It Works */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-primary-600 mb-6 flex items-center gap-2">
          <Heart className="text-accent-500" size={28} />
          How This Works
        </h2>
        
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-bold">1</span>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <FileText size={20} className="text-primary-600" />
                Review Applications
              </h3>
              <p className="text-gray-700">
                Navigate to <strong>Review & Vote</strong> to see all applicants. Each profile includes their full application, 
                contact information, and answers to our essay questions.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-bold">2</span>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Video size={20} className="text-primary-600" />
                Watch Video Applications
              </h3>
              <p className="text-gray-700">
                Some applicants have submitted video introductions. These will appear at the top of their profile 
                if available. Videos provide additional insight into their personality and passion for the trail.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-bold">3</span>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <MessageCircle size={20} className="text-primary-600" />
                Use AI Tools to Help Review
              </h3>
              <p className="text-gray-700 mb-3">
                We provide <strong>two AI assistants</strong> to help you review applications more efficiently:
              </p>
              
              <div className="space-y-3 ml-4">
                <div className="border-l-4 border-primary-300 pl-4">
                  <p className="font-semibold text-gray-900 text-sm mb-1">
                    <MessageCircle size={16} className="inline mr-1 text-primary-600" />
                    Individual Applicant AI Chat
                  </p>
                  <p className="text-sm text-gray-700">
                    On each applicant's profile in <strong>Review & Vote</strong>, use the AI Chat to ask questions about that specific applicant. 
                    Try prompts like "Overview," "Strengths," or "Financial need" to quickly understand their application.
                  </p>
                </div>
                
                <div className="border-l-4 border-accent-400 pl-4">
                  <p className="font-semibold text-gray-900 text-sm mb-1">
                    <Search size={16} className="inline mr-1 text-accent-600" />
                    All-Applicants AI Search
                  </p>
                  <p className="text-sm text-gray-700">
                    On the <strong>Applicants</strong> page, use the AI search to find applicants across the entire pool. 
                    Ask questions like "Who has hiking experience?" or "Who mentioned financial need?" to discover relevant candidates.
                  </p>
                </div>
              </div>
              
              <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2 mt-3">
                <strong>Important:</strong> Both AI tools are designed to help you gather information quickly, but you should always read the full application 
                yourself and form your own independent opinion before voting.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-bold">4</span>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Users size={20} className="text-primary-600" />
                Share Your Thoughts
              </h3>
              <p className="text-gray-700">
                Use the <strong>Notes</strong> section to share observations with other board members. 
                Notes are visible to all reviewers and help facilitate discussion.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-bold">5</span>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <ThumbsUp size={20} className="text-primary-600" />
                Cast Your Vote
              </h3>
              <p className="text-gray-700">
                Rate each applicant on a scale of <strong>0-10</strong>. Once you submit a vote, 
                it cannot be changed, so take your time reviewing each application thoroughly.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Voting Guidelines */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-primary-600 mb-6">Voting Guidelines</h2>
        
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">What to Consider</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Their connection to the Appalachian Trail and hiking experience</li>
              <li>How they've overcome challenges or obstacles</li>
              <li>Their passion and inspiration for the journey</li>
              <li>How the scholarship would impact their ability to complete the trail</li>
              <li>Their overall story and authenticity</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg" style={{backgroundColor: 'rgb(249, 244, 235)', border: '2px solid rgb(211, 190, 146)'}}>
            <h3 className="font-semibold mb-2" style={{color: '#2d4a3e'}}>Voting Scale</h3>
            <div className="space-y-1 text-sm" style={{color: '#5a8062'}}>
              <p><strong>0-3:</strong> Does not meet criteria or lacks connection to mission</p>
              <p><strong>4-6:</strong> Good candidate with solid application</p>
              <p><strong>7-8:</strong> Strong candidate with compelling story</p>
              <p><strong>9-10:</strong> Exceptional candidate who embodies Nate's spirit</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Help */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-primary-600 mb-6">Navigating the Portal</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Applicants</h3>
            <p className="text-sm text-gray-700">
              Use the <strong>AI Search</strong> to find applicants across all applications. 
              Click on any result to view their full profile.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Review & Vote</h3>
            <p className="text-sm text-gray-700">
              Browse through applicants one at a time. Use the <strong>Previous/Next</strong> buttons 
              to navigate between profiles and the AI Chat for individual questions.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Dashboard (Old)</h3>
            <p className="text-sm text-gray-700">
              See your voting progress, view rankings, and quickly jump to any applicant. 
              Green checkmarks show who you've voted on.
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-primary-600 rounded-lg shadow-md p-8 text-center text-white" style={{backgroundImage: 'url(/assets/images/background.png)', backgroundSize: 'cover', backgroundPosition: 'center'}}>
        <CheckCircle size={48} className="mx-auto mb-4 text-accent-400" />
        <h2 className="text-2xl font-bold mb-3">Ready to Begin?</h2>
        <p className="text-accent-100 mb-6">
          Take your time, read carefully, and vote thoughtfully.
        </p>
        <a
          href="/voting"
          className="inline-block bg-accent-500 text-primary-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-accent-400 transition-colors shadow-lg mb-6"
        >
          Start Reviewing Applications
        </a>
        <p className="text-sm text-accent-200 italic mt-6">
          In memory of Nate Loftis - helping hikers achieve their dreams on the Appalachian Trail
        </p>
      </div>
    </div>
  );
};
