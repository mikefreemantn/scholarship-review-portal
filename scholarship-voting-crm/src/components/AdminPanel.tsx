import React, { useState, useEffect } from 'react';
import { UserPlus, Trash2, Shield, RefreshCw, Eye, EyeOff, Users, Mail, ShieldCheck, Download, FileText, Send } from 'lucide-react';
import { BoardMember, ApplicantWithStats } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  getAllBoardMembers,
  createBoardMember,
  getAllVotes,
} from '../services/dynamodb';
import {
  inviteBoardMember,
  resetBoardMemberPassword,
  adminSetUserPassword,
} from '../services/cognito';
import {
  deleteVote,
  deleteNote,
  deleteApplicant,
  deleteVotesByApplicant,
  deleteNotesByApplicant,
  updateBoardMemberAdminStatus,
} from '../services/dynamodb';
import { EmailManagement } from './EmailManagement';
import { sendVotingDigest, sendWelcomeEmail } from '../services/sendgrid';

interface AdminPanelProps {
  currentUserEmail: string;
  applicantsWithStats: ApplicantWithStats[];
  onRefresh: () => void;
  testingState: {
    viewAsAllVotesComplete: boolean;
  };
  onToggleTestingState: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  currentUserEmail,
  applicantsWithStats,
  onRefresh,
  testingState,
  onToggleTestingState,
}) => {
  const [boardMembers, setBoardMembers] = useState<BoardMember[]>([]);
  const [allVotes, setAllVotes] = useState<any[]>([]);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [sendingDigestTo, setSendingDigestTo] = useState<string | null>(null);
  const [updatingAdminFor, setUpdatingAdminFor] = useState<string | null>(null);
  const [resendingInviteTo, setResendingInviteTo] = useState<string | null>(null);
  const [resetPasswordFor, setResetPasswordFor] = useState<BoardMember | null>(null);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    loadBoardMembers();
    loadVotes();
  }, []);

  const loadBoardMembers = async () => {
    try {
      const members = await getAllBoardMembers();
      setBoardMembers(members);
    } catch (err: any) {
      console.error('Error loading board members:', err);
    }
  };

  const loadVotes = async () => {
    try {
      const votes = await getAllVotes();
      setAllVotes(votes);
    } catch (err: any) {
      console.error('Error loading votes:', err);
    }
  };

  const handleAddBoardMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      // Check if user already exists in Cognito
      const { getCognitoUser } = await import('../services/cognito');
      const existingUser = await getCognitoUser(newMemberEmail);
      
      let tempPassword: string;
      
      if (existingUser) {
        // User exists in Cognito, just add to DynamoDB and reset password
        const { resetBoardMemberPassword } = await import('../services/cognito');
        tempPassword = await resetBoardMemberPassword(newMemberEmail);
        
        // Get name from Cognito if available
        const nameAttr = existingUser.UserAttributes?.find((attr: any) => attr.Name === 'name');
        const cognitoName = nameAttr?.Value || newMemberName;
        
        // Add to DynamoDB
        await createBoardMember({
          email: newMemberEmail,
          name: cognitoName,
          isAdmin: false,
        });
        
        setSuccess(`User ${cognitoName} already existed in Cognito. Added to board members and sent new credentials.`);
      } else {
        // Create new user in Cognito with temp password (FORCE_CHANGE_PASSWORD state)
        tempPassword = await inviteBoardMember(newMemberEmail, newMemberName);
        
        // Add to DynamoDB
        await createBoardMember({
          email: newMemberEmail,
          name: newMemberName,
          isAdmin: false,
        });
        
        setSuccess(`Invited ${newMemberName} successfully!`);
      }

      // Send welcome email with temp password
      const emailSent = await sendWelcomeEmail(newMemberEmail, newMemberName, tempPassword);
      
      if (!emailSent) {
        setSuccess(prev => prev + ' (Email failed to send - they can use "Forgot Password")');
      }
      
      setNewMemberEmail('');
      setNewMemberName('');
      await loadBoardMembers();
    } catch (err: any) {
      setError(err.message || 'Failed to add board member');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendInvite = async (member: BoardMember) => {
    setError(null);
    setSuccess(null);
    setResendingInviteTo(member.email);

    try {
      // Reset password for existing user
      const tempPassword = await resetBoardMemberPassword(member.email);
      
      // Send welcome email with temp password
      const emailSent = await sendWelcomeEmail(member.email, member.name, tempPassword);
      
      if (emailSent) {
        setSuccess(`Resent invitation to ${member.name} successfully!`);
      } else {
        setSuccess(`Triggered password reset for ${member.name}, but failed to send email. They can use 'Forgot Password' to set up their account.`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to resend invitation');
    } finally {
      setResendingInviteTo(null);
    }
  };

  const handleSetPassword = async () => {
    if (!resetPasswordFor || !newPassword) return;

    setError(null);
    setSuccess(null);

    try {
      // Use the admin set password function from Cognito
      await adminSetUserPassword(resetPasswordFor.email, newPassword);
      
      setSuccess(`Password set for ${resetPasswordFor.name}! They can now log in with the new password.`);
      setResetPasswordFor(null);
      setNewPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to set password');
    }
  };

  const handleRemoveBoardMember = async (email: string) => {
    if (!window.confirm(`Are you sure you want to remove ${email}?`)) {
      return;
    }

    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      // Call Lambda to remove from both Cognito and DynamoDB
      const response = await fetch('https://9i79qw9g89.execute-api.us-east-2.amazonaws.com/delete-board-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to remove board member');
      }

      setSuccess(`Removed ${email} successfully!`);
      await loadBoardMembers();
    } catch (err: any) {
      setError(err.message || 'Failed to remove board member');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetVotes = async (applicantId: string) => {
    if (!window.confirm('Are you sure you want to reset all votes for this applicant?')) {
      return;
    }

    try {
      await deleteVotesByApplicant(applicantId);
      setSuccess('Votes reset successfully!');
      await loadVotes();
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Failed to reset votes');
    }
  };

  const handleResetNotes = async (applicantId: string) => {
    if (!window.confirm('Are you sure you want to delete all notes for this applicant?')) {
      return;
    }

    try {
      await deleteNotesByApplicant(applicantId);
      setSuccess('Notes deleted successfully!');
      await loadVotes();
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Failed to delete notes');
    }
  };

  const handleDeleteApplicant = async (applicantId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete ${name}? This will also delete all votes and notes.`)) {
      return;
    }

    try {
      await deleteVotesByApplicant(applicantId);
      await deleteNotesByApplicant(applicantId);
      await deleteApplicant(applicantId);
      setSuccess('Applicant deleted successfully!');
      await loadVotes();
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Failed to delete applicant');
    }
  };

  // Calculate pending votes for a board member
  const getPendingVotesCount = (memberEmail: string): number => {
    const memberVotes = allVotes.filter(v => v.boardMemberEmail === memberEmail);
    const votedApplicantIds = new Set(memberVotes.map(v => v.applicantId));
    return applicantsWithStats.filter(app => !votedApplicantIds.has(app.applicant.applicantId)).length;
  };

  // Export voting results to CSV
  const handleExportResults = () => {
    // Create CSV header with applicant name, then each board member, then total
    const headers = ['Applicant', ...boardMembers.map(m => m.name), 'Total'];
    
    // Create rows for each applicant
    const rows = applicantsWithStats.map(({ applicant, averageScore }) => {
      const applicantName = `${applicant.firstName} ${applicant.lastName}`;
      
      // Get scores for each board member
      const scores = boardMembers.map(member => {
        const vote = allVotes.find(
          v => v.applicantId === applicant.applicantId && v.boardMemberEmail === member.email
        );
        return vote?.score !== undefined ? vote.score.toString() : '-';
      });
      
      // Calculate total (average score or -)
      const total = averageScore !== undefined ? averageScore.toFixed(2) : '-';
      
      return [applicantName, ...scores, total];
    });
    
    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `voting-results-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export ranked applicants to PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Add title page
    doc.setFontSize(18);
    doc.text('Scholarship Applicant Rankings', 14, 20);
    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28);
    
    // Sort applicants by average score (highest to lowest)
    const rankedApplicants = [...applicantsWithStats]
      .filter(a => a.averageScore !== undefined)
      .sort((a, b) => (b.averageScore || 0) - (a.averageScore || 0));
    
    // Add unranked applicants at the end
    const unrankedApplicants = applicantsWithStats.filter(a => a.averageScore === undefined);
    const allApplicants = [...rankedApplicants, ...unrankedApplicants];
    
    // Prepare summary table data (without notes column)
    const summaryTableData = allApplicants.map((appWithStats, index) => {
      const { applicant, averageScore } = appWithStats;
      const rank = averageScore !== undefined ? index + 1 : '-';
      const score = averageScore !== undefined ? averageScore.toFixed(2) : '-';
      
      return [
        rank.toString(),
        `${applicant.firstName} ${applicant.lastName}`,
        applicant.email || '-',
        applicant.phone || '-',
        score
      ];
    });
    
    // Add summary table
    autoTable(doc, {
      startY: 35,
      head: [['Rank', 'Name', 'Email', 'Phone', 'Score']],
      body: summaryTableData,
      styles: { fontSize: 10, cellPadding: 4 },
      headStyles: { fillColor: [45, 74, 62], textColor: 255 },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 45 },
        2: { cellWidth: 55 },
        3: { cellWidth: 35 },
        4: { cellWidth: 25 }
      },
      margin: { left: 14, right: 14 }
    });
    
    // Add a page for each applicant with their notes
    allApplicants.forEach((appWithStats, index) => {
      const { applicant, averageScore, notes } = appWithStats;
      const rank = averageScore !== undefined ? index + 1 : '-';
      const score = averageScore !== undefined ? averageScore.toFixed(2) : '-';
      
      // Add new page for each applicant
      doc.addPage();
      
      // Applicant header
      doc.setFontSize(16);
      doc.setTextColor(45, 74, 62);
      doc.text(`${rank !== '-' ? `#${rank} - ` : ''}${applicant.firstName} ${applicant.lastName}`, 14, 20);
      
      // Contact info and score
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`Email: ${applicant.email || 'N/A'}`, 14, 30);
      doc.text(`Phone: ${applicant.phone || 'N/A'}`, 14, 36);
      doc.text(`Average Score: ${score}`, 14, 42);
      
      // Individual board member scores
      doc.setFontSize(11);
      doc.setTextColor(45, 74, 62);
      doc.text('Individual Scores:', 14, 52);
      
      let yPosition = 58;
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      
      boardMembers.forEach((member) => {
        const vote = allVotes.find(
          v => v.applicantId === applicant.applicantId && v.boardMemberEmail === member.email
        );
        const memberScore = vote?.score !== undefined ? vote.score.toString() : '-';
        doc.text(`${member.name}: ${memberScore}`, 20, yPosition);
        yPosition += 5;
      });
      
      // Notes section
      yPosition += 5;
      doc.setFontSize(12);
      doc.setTextColor(45, 74, 62);
      doc.text('Board Member Notes:', 14, yPosition);
      
      yPosition += 8;
      
      if (notes.length === 0) {
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text('No notes available', 14, yPosition);
      } else {
        notes.forEach((note) => {
          // Check if we need a new page
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
          
          // Board member name
          doc.setFontSize(11);
          doc.setTextColor(45, 74, 62);
          doc.setFont('helvetica', 'bold');
          doc.text(`${note.boardMemberName}:`, 14, yPosition);
          
          // Note content (wrapped text)
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(0, 0, 0);
          doc.setFontSize(10);
          const splitNote = doc.splitTextToSize(note.content, 180);
          doc.text(splitNote, 14, yPosition + 6);
          
          // Calculate height of wrapped text and add spacing
          const noteHeight = splitNote.length * 5 + 10;
          yPosition += noteHeight;
        });
      }
    });
    
    // Save the PDF
    doc.save(`applicant-rankings-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Send voting digest to a specific board member
  const handleSendDigest = async (member: BoardMember) => {
    setSendingDigestTo(member.email);
    setError(null);
    setSuccess(null);

    try {
      // Find applicants this member hasn't voted on
      const memberVotes = allVotes.filter(v => v.boardMemberEmail === member.email);
      const votedApplicantIds = new Set(memberVotes.map(v => v.applicantId));
      const unvotedApplicants = applicantsWithStats
        .filter(app => !votedApplicantIds.has(app.applicant.applicantId))
        .map(app => ({
          firstName: app.applicant.firstName,
          lastName: app.applicant.lastName,
          email: app.applicant.email,
        }));

      if (unvotedApplicants.length === 0) {
        setSuccess(`${member.name} has already voted on all applicants!`);
        setSendingDigestTo(null);
        return;
      }

      const success = await sendVotingDigest(
        member.email,
        member.name,
        unvotedApplicants
      );

      if (success) {
        setSuccess(`Voting digest sent to ${member.name}!`);
      } else {
        setError(`Failed to send digest to ${member.name}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send digest');
    } finally {
      setSendingDigestTo(null);
    }
  };

  // Toggle admin status for a board member
  const handleToggleAdmin = async (member: BoardMember) => {
    const newAdminStatus = !member.isAdmin;
    const action = newAdminStatus ? 'grant admin access to' : 'remove admin access from';
    
    if (!window.confirm(`Are you sure you want to ${action} ${member.name}?`)) {
      return;
    }

    setUpdatingAdminFor(member.email);
    setError(null);
    setSuccess(null);

    try {
      await updateBoardMemberAdminStatus(member.email, newAdminStatus);
      setSuccess(`${member.name} is now ${newAdminStatus ? 'an admin' : 'a regular board member'}`);
      await loadBoardMembers();
    } catch (err: any) {
      setError(err.message || 'Failed to update admin status');
    } finally {
      setUpdatingAdminFor(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#d4c5a0] to-[#c4b590] rounded-lg shadow-lg p-6 border-2 border-[#2d4a3e]">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-[#2d4a3e]">
          <Shield size={28} />
          Admin Panel
        </h2>
        <p className="text-[#1f3329] mt-1">Manage board members and testing controls</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4">
          {success}
        </div>
      )}

      {/* Email Management */}
      <EmailManagement
        boardMembers={boardMembers}
        applicantsWithStats={applicantsWithStats}
        currentUserEmail={currentUserEmail}
      />

      {/* Testing Controls */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Eye size={20} />
          Testing Controls
        </h3>
        <div className="space-y-3">
          <button
            onClick={onToggleTestingState}
            className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
              testingState.viewAsAllVotesComplete
                ? 'bg-green-50 border-green-500'
                : 'bg-gray-50 border-gray-300'
            }`}
          >
            <span className="font-medium">
              {testingState.viewAsAllVotesComplete ? (
                <>
                  <EyeOff className="inline mr-2" size={18} />
                  Viewing as: All Votes Complete
                </>
              ) : (
                <>
                  <Eye className="inline mr-2" size={18} />
                  Viewing as: Normal (Some Votes Pending)
                </>
              )}
            </span>
            <span className="text-sm text-gray-600">Click to toggle</span>
          </button>
        </div>
      </div>

      {/* Board Members */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users size={20} />
          Board Members ({boardMembers.length})
        </h3>

        {/* Add Board Member Form */}
        <form onSubmit={handleAddBoardMember} className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <UserPlus size={18} />
            Add New Board Member
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <input
              type="email"
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
              placeholder="Email address"
              required
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <input
              type="text"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              placeholder="Full name"
              required
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Adding...' : 'Invite Board Member'}
          </button>
        </form>

        {/* Board Members List */}
        <div className="space-y-2">
          {boardMembers.map((member) => {
            const pendingCount = getPendingVotesCount(member.email);
            const isSending = sendingDigestTo === member.email;
            
            return (
              <div
                key={member.email}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-gray-600">{member.email}</p>
                    </div>
                  </div>
                  
                  {/* Pending Votes Count */}
                  <div className="mt-2 flex items-center gap-2">
                    {pendingCount > 0 ? (
                      <span className="text-sm bg-orange-100 text-orange-800 px-3 py-1 rounded-full font-medium">
                        {pendingCount} pending vote{pendingCount !== 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                        ✓ All votes complete
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Send Digest Button */}
                  {pendingCount > 0 && (
                    <button
                      onClick={() => handleSendDigest(member)}
                      disabled={isSending}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
                      title="Send voting reminder"
                    >
                      {isSending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Mail size={16} />
                          Send Digest
                        </>
                      )}
                    </button>
                  )}
                  
                  {/* Resend Invite Button */}
                  <button
                    onClick={() => handleResendInvite(member)}
                    disabled={resendingInviteTo === member.email}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Resend invitation email"
                  >
                    {resendingInviteTo === member.email ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Resend Invite
                      </>
                    )}
                  </button>
                  
                  {/* Set Password Button */}
                  <button
                    onClick={() => setResetPasswordFor(member)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors text-sm font-medium"
                    title="Set a specific password for this user"
                  >
                    <Shield size={16} />
                    Set Password
                  </button>
                  
                  {/* Admin Toggle Button */}
                  {member.email !== currentUserEmail && (
                    <button
                      onClick={() => handleToggleAdmin(member)}
                      disabled={updatingAdminFor === member.email}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                        member.isAdmin
                          ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                      title={member.isAdmin ? 'Remove admin access' : 'Grant admin access'}
                    >
                      {updatingAdminFor === member.email ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                      ) : (
                        <ShieldCheck size={16} />
                      )}
                      {member.isAdmin ? 'Admin' : 'Make Admin'}
                    </button>
                  )}
                  
                  {/* Delete Button */}
                  {!member.isAdmin && member.email !== currentUserEmail && (
                    <button
                      onClick={() => handleRemoveBoardMember(member.email)}
                      disabled={isLoading}
                      className="text-red-500 hover:text-red-700 transition-colors disabled:opacity-50 p-2"
                      title="Remove board member"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Applicant Management */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <RefreshCw size={20} />
            Applicant Management
          </h3>
          <div className="flex gap-2">
            <button
              onClick={handleExportResults}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
            >
              <Download size={18} />
              Export CSV
            </button>
            <button
              onClick={handleExportPDF}
              className="bg-accent-600 text-white px-4 py-2 rounded-lg hover:bg-accent-700 transition-colors flex items-center gap-2"
            >
              <FileText size={18} />
              Export PDF
            </button>
          </div>
        </div>
        <div className="space-y-2">
          {applicantsWithStats.map(({ applicant, totalVotes, notes }) => (
            <div
              key={applicant.applicantId}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex-1">
                <p className="font-medium">
                  {applicant.firstName} {applicant.lastName}
                </p>
                <p className="text-sm text-gray-600">
                  {totalVotes} vote{totalVotes !== 1 ? 's' : ''} • {notes.length} note{notes.length !== 1 ? 's' : ''}
                </p>
                
                {/* Board Member Voting Status */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {boardMembers.map((member) => {
                    const vote = allVotes.find(
                      (v) => v.applicantId === applicant.applicantId && v.boardMemberEmail === member.email
                    );
                    const hasVoted = !!vote;
                    const score = vote?.score;
                    
                    return (
                      <span
                        key={member.email}
                        className={`pl-3 ${hasVoted && score !== undefined ? 'pr-1.5' : 'pr-3'} py-1 rounded-full text-xs font-medium transition-colors inline-flex items-center gap-1.5 ${
                          hasVoted
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        <span>{member.name}</span>
                        {hasVoted && score !== undefined && (
                          <span className="flex items-center justify-center w-5 h-5 bg-white text-primary-600 rounded-full font-bold text-[10px] leading-none">
                            {score}
                          </span>
                        )}
                      </span>
                    );
                  })}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleResetVotes(applicant.applicantId)}
                  className="text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded hover:bg-yellow-200 transition-colors"
                >
                  Reset Votes
                </button>
                <button
                  onClick={() => handleResetNotes(applicant.applicantId)}
                  className="text-sm bg-orange-100 text-orange-800 px-3 py-1 rounded hover:bg-orange-200 transition-colors"
                >
                  Delete Notes
                </button>
                <button
                  onClick={() => handleDeleteApplicant(applicant.applicantId, `${applicant.firstName} ${applicant.lastName}`)}
                  className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Set Password Modal */}
      {resetPasswordFor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">
              Set Password for {resetPasswordFor.name}
            </h3>
            
            <p className="text-sm text-gray-600 mb-4">
              Enter a new password for <strong>{resetPasswordFor.email}</strong>. They will be able to log in immediately with this password.
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter password (min 8 characters)"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-1">
                Password must be at least 8 characters
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleSetPassword}
                disabled={!newPassword || newPassword.length < 8}
                className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Set Password
              </button>
              <button
                onClick={() => {
                  setResetPasswordFor(null);
                  setNewPassword('');
                }}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
