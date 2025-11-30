import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { fetchUserAttributes, getCurrentUser } from 'aws-amplify/auth';
import { LayoutDashboard, Vote, Shield, LogOut, Mountain, Home } from 'lucide-react';
import './aws-config';
import { Dashboard } from './components/Dashboard';
import { VotingReview } from './components/VotingReview';
import { AdminPanel } from './components/AdminPanel';
import { Welcome } from './components/Welcome';
import { ForgotPassword } from './components/ForgotPassword';
import { SetPassword } from './components/SetPassword';
import { ApplicantWithStats, AdminTestingState } from './types';
import {
  getAllApplicants,
  getAllVotes,
  getNotesByApplicant,
  getBoardMember,
  getAllVideoSubmissions,
} from './services/dynamodb';
import { signOut, signIn } from 'aws-amplify/auth';

type View = 'welcome' | 'dashboard' | 'voting' | 'admin';

function App() {
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  return (
    <BrowserRouter>
      <div style={{
        backgroundImage: 'url(/assets/images/background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        minHeight: '100vh'
      }}>
        <Routes>
          <Route path="/forgot-password" element={
            <ForgotPassword onBack={() => window.location.href = '/'} />
          } />
          <Route path="/set-password" element={
            <SetPassword />
          } />
          <Route path="/*" element={
            <Authenticator 
              hideSignUp={true}
              services={{
                async handleSignIn(formData) {
                  const { username, password } = formData;
                  try {
                    // Convert username to lowercase for case-insensitive login
                    return await signIn({ username: username.toLowerCase(), password });
                  } catch (error: any) {
                    // Provide clearer error messages
                    if (error.name === 'UserNotFoundException') {
                      throw new Error('Account not found. Please contact an administrator.');
                    } else if (error.name === 'NotAuthorizedException') {
                      throw new Error('Incorrect username or password.');
                    }
                    throw error;
                  }
                },
              }}
              components={{
                SignIn: {
                  Footer() {
                    return (
                      <div className="text-center mt-4">
                        <a 
                          href="/forgot-password"
                          className="text-sm text-green-800 hover:text-green-900 font-medium"
                        >
                          Forgot your password?
                        </a>
                      </div>
                    );
                  },
                },
              }}
            >
            {({ signOut, user }) => (
              <Routes>
                <Route path="/" element={<MainApp user={user} onSignOut={signOut} />} />
                <Route path="/voting" element={<MainApp user={user} onSignOut={signOut} />} />
                <Route path="/voting/:applicantId" element={<MainApp user={user} onSignOut={signOut} />} />
                <Route path="/dashboard" element={<MainApp user={user} onSignOut={signOut} />} />
                <Route path="/admin" element={<MainApp user={user} onSignOut={signOut} />} />
              </Routes>
            )}
          </Authenticator>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

interface MainAppProps {
  user: any;
  onSignOut?: () => void;
}

function MainApp({ user, onSignOut }: MainAppProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { applicantId } = useParams();
  const currentPath = location.pathname;
  let currentView: View = 'welcome';
  const [applicantsWithStats, setApplicantsWithStats] = useState<ApplicantWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [currentUserName, setCurrentUserName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [videoEmails, setVideoEmails] = useState<Set<string>>(new Set());
  const [adminTestingState, setAdminTestingState] = useState<AdminTestingState>({
    viewAsAllVotesComplete: false,
  });

  useEffect(() => {
    loadUserInfo();
  }, []);

  useEffect(() => {
    if (currentUserEmail) {
      loadData();
    }
  }, [currentUserEmail]);

  const loadUserInfo = async () => {
    try {
      const attributes = await fetchUserAttributes();
      const email = attributes.email || '';
      const name = attributes.name || attributes.email || '';
      
      setCurrentUserEmail(email);
      setCurrentUserName(name);

      // Check if admin
      const boardMember = await getBoardMember(email);
      setIsAdmin(boardMember?.isAdmin || false);
    } catch (error) {
      console.error('Error loading user info:', error);
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [applicants, allVotes, videoSubmissions] = await Promise.all([
        getAllApplicants(),
        getAllVotes(),
        getAllVideoSubmissions(),
      ]);

      // Create a set of emails that have video submissions
      const emailsWithVideos = new Set(videoSubmissions.map(v => v.email));
      setVideoEmails(emailsWithVideos);

      // Build applicants with stats
      const applicantsWithStatsData: ApplicantWithStats[] = await Promise.all(
        applicants.map(async (applicant) => {
          const applicantVotes = allVotes.filter(v => v.applicantId === applicant.applicantId);
          const userVote = applicantVotes.find(v => v.boardMemberEmail === currentUserEmail);
          const notes = await getNotesByApplicant(applicant.applicantId);

          const averageScore = applicantVotes.length > 0
            ? applicantVotes.reduce((sum, v) => sum + v.score, 0) / applicantVotes.length
            : undefined;

          return {
            applicant,
            averageScore,
            totalVotes: applicantVotes.length,
            userHasVoted: !!userVote,
            userVote,
            notes,
          };
        })
      );

      setApplicantsWithStats(applicantsWithStatsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      if (onSignOut) {
        onSignOut();
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleToggleTestingState = () => {
    setAdminTestingState(prev => ({
      viewAsAllVotesComplete: !prev.viewAsAllVotesComplete,
    }));
  };

  // Calculate stats
  const totalApplicants = applicantsWithStats.length;
  const votedCount = applicantsWithStats.filter(a => a.userHasVoted).length;
  const allVotesComplete = adminTestingState.viewAsAllVotesComplete || votedCount === totalApplicants;

  // Determine which view to show
  if (currentPath === '/') {
    currentView = 'welcome';
  } else if (currentPath === '/dashboard') {
    currentView = 'dashboard';
  } else if (currentPath === '/voting' || currentPath.startsWith('/voting/')) {
    currentView = 'voting';
  } else if (currentPath === '/admin') {
    currentView = 'admin';
  }

  const shouldShowDashboard = currentView === 'dashboard' || (currentView === 'voting' && allVotesComplete && !isAdmin);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{backgroundImage: 'url(/assets/images/goldback-1.png)', backgroundSize: 'cover', backgroundAttachment: 'fixed', backgroundPosition: 'center'}}>
      {/* Header */}
      <header className="bg-primary-600 shadow-lg" style={{backgroundImage: 'url(/assets/images/background.png)', backgroundSize: 'cover', backgroundPosition: 'center'}}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <img 
                src="/assets/images/toplogo_carved-2.png" 
                alt="One More Day on the AT" 
                className="h-10 sm:h-14 w-auto flex-shrink-0"
              />
              <div className="hidden sm:block">
                <p className="text-xs text-accent-400 tracking-wider uppercase mb-1">Scholarship Review Board</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-white">{currentUserName}</p>
                <p className="text-xs text-accent-300">{currentUserEmail}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-white hover:bg-primary-700 rounded-lg transition-colors border border-primary-500 text-sm sm:text-base flex-shrink-0"
              >
                <LogOut size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="hidden sm:inline">Sign Out</span>
                <span className="sm:hidden">Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-sm border-b border-primary-200 shadow-sm overflow-x-auto">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="flex gap-0.5 sm:gap-1">
            <button
              onClick={() => navigate('/')}
              className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-3 font-medium transition-colors text-sm sm:text-base whitespace-nowrap ${
                currentView === 'welcome'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Home size={18} className="sm:w-5 sm:h-5" />
              <span className="hidden xs:inline">Welcome</span>
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-3 font-medium transition-colors text-sm sm:text-base whitespace-nowrap ${
                currentView === 'dashboard'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <LayoutDashboard size={18} className="sm:w-5 sm:h-5" />
              Applicants
            </button>
            <button
              onClick={() => navigate('/voting')}
              className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-3 font-medium transition-colors text-sm sm:text-base whitespace-nowrap ${
                currentView === 'voting'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Vote size={18} className="sm:w-5 sm:h-5" />
              Vote
            </button>
            {isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-3 font-medium transition-colors text-sm sm:text-base whitespace-nowrap ${
                  currentView === 'admin'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Shield size={18} className="sm:w-5 sm:h-5" />
                Admin
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'welcome' ? (
          <Welcome />
        ) : currentView === 'admin' && isAdmin ? (
          <AdminPanel
            currentUserEmail={currentUserEmail}
            applicantsWithStats={applicantsWithStats}
            onRefresh={loadData}
            testingState={adminTestingState}
            onToggleTestingState={handleToggleTestingState}
          />
        ) : shouldShowDashboard ? (
          <Dashboard
            applicantsWithStats={applicantsWithStats}
            onSelectApplicant={(id) => {
              navigate(`/voting/${id}`);
            }}
            totalApplicants={totalApplicants}
            votedCount={votedCount}
            videoEmails={videoEmails}
          />
        ) : (
          <VotingReview
            applicantsWithStats={applicantsWithStats}
            currentUserEmail={currentUserEmail}
            currentUserName={currentUserName}
            isAdmin={isAdmin}
            onVoteSubmitted={loadData}
            initialApplicantId={applicantId}
          />
        )}
      </main>
      
      {/* Version Footer */}
      <footer className="text-center py-4 text-xs text-gray-500">
        v{process.env.REACT_APP_VERSION || '1.0.0'}
      </footer>
    </div>
  );
}

export default App;
