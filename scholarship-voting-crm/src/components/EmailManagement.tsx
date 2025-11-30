import React, { useState } from 'react';
import { Mail, Send, Users, User } from 'lucide-react';
import { BoardMember, ApplicantWithStats } from '../types';
import { sendBoardMessage, sendVotingDigest } from '../services/sendgrid';

interface EmailManagementProps {
  boardMembers: BoardMember[];
  applicantsWithStats: ApplicantWithStats[];
  currentUserEmail: string;
}

export const EmailManagement: React.FC<EmailManagementProps> = ({
  boardMembers,
  applicantsWithStats,
  currentUserEmail,
}) => {
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [customMessage, setCustomMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSendBoardMessage = async (sendToAll: boolean) => {
    if (!customMessage.trim()) {
      setStatus({
        type: 'error',
        message: 'Please enter a message to send.',
      });
      return;
    }

    if (!sendToAll && selectedMembers.length === 0) {
      setStatus({
        type: 'error',
        message: 'Please select at least one recipient.',
      });
      return;
    }

    setIsSending(true);
    setStatus(null);

    try {
      const recipients = sendToAll
        ? boardMembers.map(m => m.email)
        : selectedMembers;

      const success = await sendBoardMessage(recipients, customMessage);

      if (success) {
        const recipientCount = recipients.length;
        setStatus({
          type: 'success',
          message: `Message sent successfully to ${recipientCount} member${recipientCount !== 1 ? 's' : ''}!`,
        });
        setCustomMessage('');
        setSelectedMembers([]);
      } else {
        setStatus({
          type: 'error',
          message: 'Failed to send message. Please check console for details.',
        });
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleSendVotingDigest = async (sendToAll: boolean) => {
    if (!sendToAll && selectedMembers.length === 0) {
      setStatus({
        type: 'error',
        message: 'Please select at least one recipient.',
      });
      return;
    }

    setIsSending(true);
    setStatus(null);

    try {
      const membersToEmail = sendToAll
        ? boardMembers
        : boardMembers.filter(m => selectedMembers.includes(m.email));

      let successCount = 0;
      let failCount = 0;

      for (const member of membersToEmail) {
        // Find applicants this member hasn't voted on
        const unvotedApplicants = applicantsWithStats.filter(
          app => !app.userHasVoted || app.userVote?.boardMemberEmail !== member.email
        );

        if (unvotedApplicants.length > 0) {
          const success = await sendVotingDigest(
            member.email,
            member.name,
            unvotedApplicants.map(app => ({
              firstName: app.applicant.firstName,
              lastName: app.applicant.lastName,
              email: app.applicant.email,
            })),
            customMessage || undefined
          );

          if (success) {
            successCount++;
          } else {
            failCount++;
          }
        }
      }

      if (successCount > 0) {
        setStatus({
          type: 'success',
          message: `Voting digest sent to ${successCount} board member${successCount !== 1 ? 's' : ''}!${failCount > 0 ? ` (${failCount} failed)` : ''}`,
        });
        setCustomMessage('');
        setSelectedMembers([]);
      } else {
        setStatus({
          type: 'error',
          message: failCount > 0 ? `Failed to send ${failCount} email(s)` : 'No members have pending votes',
        });
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center gap-2 mb-6">
        <Mail className="w-6 h-6 text-[#2d4a3e]" />
        <h2 className="text-2xl font-bold text-[#2d4a3e]">Email Management</h2>
      </div>

      {status && (
        <div
          className={`mb-4 p-4 rounded-lg ${
            status.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {status.message}
        </div>
      )}

      {/* Recipient Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Recipients
        </label>
        <div className="border border-gray-300 rounded-lg p-3 max-h-60 overflow-y-auto bg-white">
          {boardMembers.length === 0 ? (
            <p className="text-gray-500 text-sm">No board members available</p>
          ) : (
            <div className="space-y-2">
              {boardMembers.map((member) => (
                <label
                  key={member.email}
                  className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(member.email)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedMembers([...selectedMembers, member.email]);
                      } else {
                        setSelectedMembers(selectedMembers.filter(email => email !== member.email));
                      }
                    }}
                    className="w-4 h-4 text-[#2d4a3e] border-gray-300 rounded focus:ring-[#2d4a3e]"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{member.name}</p>
                    <p className="text-xs text-gray-500">{member.email}</p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
        {selectedMembers.length > 0 && (
          <p className="text-sm text-gray-600 mt-2">
            {selectedMembers.length} member{selectedMembers.length !== 1 ? 's' : ''} selected
          </p>
        )}
      </div>

      {/* Message Field */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          value={customMessage}
          onChange={(e) => setCustomMessage(e.target.value)}
          placeholder="Enter your message to the board members..."
          rows={5}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d4a3e] focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-1">
          This message will be sent to the selected board member(s) with professional formatting.
        </p>
      </div>

      {/* Send Email Section */}
      <div className="mb-6 p-4 bg-gradient-to-r from-[#2d4a3e] to-[#1f3329] rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <Send className="w-5 h-5" />
          Send Message to Board
        </h3>
        <p className="text-sm text-gray-200 mb-4">
          Send a message to board members. Use this for announcements, updates, or general communication.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => handleSendBoardMessage(false)}
            disabled={selectedMembers.length === 0 || isSending || !customMessage.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-white text-[#2d4a3e] rounded-lg hover:bg-gray-100 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors font-medium"
          >
            <User className="w-4 h-4" />
            Send to Selected ({selectedMembers.length})
          </button>
          <button
            onClick={() => handleSendBoardMessage(true)}
            disabled={isSending || !customMessage.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-white text-[#2d4a3e] rounded-lg hover:bg-gray-100 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors font-medium"
          >
            <Users className="w-4 h-4" />
            Send to All Members
          </button>
        </div>
      </div>

      {/* Voting Digest Section */}
      <div className="p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Send Voting Digest
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Send a reminder email with a list of applicants that need to be reviewed.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => handleSendVotingDigest(false)}
            disabled={selectedMembers.length === 0 || isSending}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <User className="w-4 h-4" />
            Send to Selected ({selectedMembers.length})
          </button>
          <button
            onClick={() => handleSendVotingDigest(true)}
            disabled={isSending}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Users className="w-4 h-4" />
            Send to All Members
          </button>
        </div>
      </div>

      {isSending && (
        <div className="mt-4 text-center text-gray-600">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#2d4a3e]"></div>
          <p className="mt-2">Sending email...</p>
        </div>
      )}
    </div>
  );
};
