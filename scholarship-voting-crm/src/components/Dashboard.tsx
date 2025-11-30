import React, { useState } from 'react';
import { Trophy, Star, Users, CheckCircle, Circle, Video, Search, Send, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ApplicantWithStats } from '../types';
import { ApplicantDetail } from './ApplicantDetail';

interface DashboardProps {
  applicantsWithStats: ApplicantWithStats[];
  onSelectApplicant: (applicantId: string) => void;
  totalApplicants: number;
  votedCount: number;
  videoEmails: Set<string>;
}

export const Dashboard: React.FC<DashboardProps> = ({
  applicantsWithStats,
  onSelectApplicant,
  totalApplicants,
  votedCount,
  videoEmails,
}) => {
  const [selectedApplicant, setSelectedApplicant] = useState<ApplicantWithStats | null>(null);
  
  // AI Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ id: string; firstName: string; lastName: string; reason: string }>>([]);
  const [lastQuery, setLastQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Sort by average score (descending), then by total votes
  const rankedApplicants = [...applicantsWithStats]
    .filter(a => a.userHasVoted && a.averageScore !== undefined)
    .sort((a, b) => {
      if (b.averageScore! !== a.averageScore!) {
        return b.averageScore! - a.averageScore!;
      }
      return b.totalVotes - a.totalVotes;
    });

  const unvotedApplicants = applicantsWithStats.filter(a => !a.userHasVoted);

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'border-2';
    if (rank === 2) return 'border-2';
    if (rank === 3) return 'border-2';
    return 'border';
  };
  
  const getRankStyle = (rank: number) => {
    if (rank === 1) return { backgroundColor: 'rgb(249, 244, 235)', borderColor: 'rgb(211, 190, 146)', color: '#2d4a3e' };
    if (rank === 2) return { backgroundColor: 'rgb(245, 247, 246)', borderColor: '#a8bfad', color: '#2d4a3e' };
    if (rank === 3) return { backgroundColor: 'rgb(250, 248, 245)', borderColor: '#d4c5a0', color: '#2d4a3e' };
    return { backgroundColor: 'white', borderColor: '#e5e7eb', color: '#1f2937' };
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="text-accent-500" size={20} fill="currentColor" />;
    if (rank === 2) return <Trophy className="text-primary-400" size={20} />;
    if (rank === 3) return <Trophy className="text-accent-400" size={20} />;
    return null;
  };

  const handleSearchApplicants = async () => {
    if (!searchQuery.trim() || isSearching) return;

    const currentQuery = searchQuery;
    setLastQuery(currentQuery);
    setSearchQuery('');
    setIsSearching(true);
    setSearchResults([]);

    try {
      const response = await fetch('https://9i79qw9g89.execute-api.us-east-2.amazonaws.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: currentQuery }),
      });

      const data = await response.json();

      if (data.success && data.matches) {
        setSearchResults(data.matches);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary-100 p-3 rounded-lg">
              <Users className="text-primary-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Applicants</p>
              <p className="text-2xl font-bold text-gray-900">{totalApplicants}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Voted</p>
              <p className="text-2xl font-bold text-gray-900">{votedCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-3 rounded-lg">
              <Circle className="text-orange-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Remaining</p>
              <p className="text-2xl font-bold text-gray-900">{totalApplicants - votedCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Search Applicants */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-semibold mb-4 text-primary-600 flex items-center gap-2">
          <Search className="flex-shrink-0" size={20} />
          <span>Search All Applicants with AI</span>
        </h3>
        
        <p className="text-gray-600 mb-4 text-sm sm:text-base">
          Ask questions like "Who has hiking experience?" or "Show me applicants studying environmental science"
        </p>
        
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => { if (e.key === 'Enter') handleSearchApplicants(); }}
            placeholder="Ask about applicants..."
            className="flex-1 border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary-500"
            disabled={isSearching}
          />
          <button
            onClick={handleSearchApplicants}
            disabled={!searchQuery.trim() || isSearching}
            className="bg-primary-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2 flex-shrink-0"
          >
            <Send size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
        </div>
        
        {isSearching && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-3">
              <Loader2 className="animate-spin text-primary-600" size={20} />
              <div className="text-sm text-gray-600">
                <p className="font-medium">Reviewing all applications...</p>
                <p className="text-xs">Lots to read... be patient.</p>
              </div>
            </div>
          </div>
        )}
        
        {lastQuery && searchResults.length > 0 && (
          <div>
            <p className="text-sm text-gray-600 mb-3">
              Found <strong>{searchResults.length}</strong> applicant{searchResults.length !== 1 ? 's' : ''} matching: "{lastQuery}"
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {searchResults.map((result) => (
                <button
                  key={result.id}
                  onClick={() => window.open(`/voting/${result.id}`, '_blank')}
                  className="bg-white border-2 border-primary-200 rounded-lg p-4 hover:border-primary-400 hover:shadow-md transition-all text-left"
                >
                  <h4 className="font-semibold text-primary-600 mb-2">
                    {result.firstName} {result.lastName}
                  </h4>
                  <p className="text-sm text-gray-700 line-clamp-3">
                    {result.reason}
                  </p>
                  <p className="text-xs text-primary-500 mt-2 font-medium">Click to view profile in new tab →</p>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {lastQuery && !isSearching && searchResults.length === 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center text-gray-600">
            <p>No applicants found matching "{lastQuery}"</p>
          </div>
        )}
      </div>

      {/* Unvoted Applicants */}
      {unvotedApplicants.length > 0 && (
        <div className="rounded-lg p-6" style={{backgroundColor: 'rgb(249, 244, 235)', border: '1px solid rgb(211, 190, 146)'}}>
          <h3 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
            <Circle size={20} />
            Applicants You Haven't Voted On ({unvotedApplicants.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {unvotedApplicants.map(({ applicant }) => (
              <button
                key={applicant.applicantId}
                onClick={() => onSelectApplicant(applicant.applicantId)}
                className="bg-white rounded-lg p-4 text-left hover:shadow-md transition-all"
                style={{border: '1px solid rgb(211, 190, 146)'}}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 flex items-center gap-2">
                      {applicant.firstName} {applicant.lastName}
                      {videoEmails.has(applicant.email) && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
                          <Video size={14} />
                          Video
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-600">{applicant.city}, {applicant.state}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Rankings */}
      {rankedApplicants.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-primary-600">
            <Star className="text-accent-500" size={24} fill="currentColor" />
            Rankings
          </h3>
          <div className="space-y-3">
            {rankedApplicants.map((applicantWithStats, index) => {
              const rank = index + 1;
              const { applicant, averageScore, totalVotes } = applicantWithStats;
              
              return (
                <div
                  key={applicant.applicantId}
                  className={`rounded-lg p-4 cursor-pointer hover:shadow-lg transition-all ${getRankColor(rank)}`}
                  style={getRankStyle(rank)}
                  onClick={() => onSelectApplicant(applicant.applicantId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex items-center gap-2 min-w-[60px]">
                        {getRankIcon(rank)}
                        <span className="text-2xl font-bold">#{rank}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-lg flex items-center gap-2">
                          {applicant.firstName} {applicant.lastName}
                          {videoEmails.has(applicant.email) && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
                              <Video size={14} />
                              Video
                            </span>
                          )}
                        </p>
                        <p className="text-sm opacity-75">
                          {applicant.city}, {applicant.state}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold">
                        {averageScore!.toFixed(1)}
                      </div>
                      <div className="text-sm opacity-75">
                        {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Applicant Detail Modal */}
      {selectedApplicant && (
        <ApplicantDetail
          applicant={selectedApplicant.applicant}
          averageScore={selectedApplicant.averageScore}
          showScore={true}
          onClose={() => setSelectedApplicant(null)}
        />
      )}
    </div>
  );
};
