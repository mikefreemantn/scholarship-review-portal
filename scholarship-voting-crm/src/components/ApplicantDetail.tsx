import React, { useState, useEffect } from 'react';
import { X, ExternalLink, MapPin, Phone, Mail, Calendar, Video, MessageCircle, Send, Loader2 } from 'lucide-react';
import { Applicant, VideoSubmission } from '../types';
import { getVideoSubmissionByEmail } from '../services/dynamodb';

interface ApplicantDetailProps {
  applicant: Applicant;
  onClose: () => void;
  averageScore?: number;
  showScore: boolean;
}

export const ApplicantDetail: React.FC<ApplicantDetailProps> = ({
  applicant,
  onClose,
  averageScore,
  showScore,
}) => {
  const [videoSubmission, setVideoSubmission] = useState<VideoSubmission | null>(null);
  const [loadingVideo, setLoadingVideo] = useState(true);

  useEffect(() => {
    const fetchVideo = async () => {
      setLoadingVideo(true);
      const video = await getVideoSubmissionByEmail(applicant.email);
      setVideoSubmission(video);
      setLoadingVideo(false);
    };
    fetchVideo();
  }, [applicant.email]);
  const DetailSection: React.FC<{ title: string; content: string }> = ({ title, content }) => (
    <div className="mb-6">
      <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>
      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{content}</p>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-primary-600 text-white p-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">
              {applicant.firstName} {applicant.lastName}
            </h2>
            {showScore && averageScore !== undefined && (
              <div className="mt-2 inline-block bg-white text-primary-600 px-3 py-1 rounded-full font-semibold">
                Average Score: {averageScore.toFixed(1)}/10
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-primary-700 rounded-lg p-2 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 flex-1">
          {/* Contact Information */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-gray-400" />
                <a href={`mailto:${applicant.email}`} className="text-primary-600 hover:underline">
                  {applicant.email}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-gray-400" />
                <span className="text-gray-700">{applicant.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-gray-400" />
                <span className="text-gray-700">
                  {applicant.city}, {applicant.state}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-400" />
                <span className="text-gray-700">Applied: {applicant.dateApplied}</span>
              </div>
            </div>
            {applicant.applicationUrl && (
              <div className="mt-3">
                <a
                  href={applicant.applicationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
                >
                  <ExternalLink size={16} />
                  View Full Application
                </a>
              </div>
            )}
          </div>

          {/* Video Application */}
          {!loadingVideo && videoSubmission && (
            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Video size={20} className="text-primary-600" />
                Video Application
              </h4>
              <div className="aspect-video bg-black rounded-lg overflow-hidden mb-3">
                <video
                  controls
                  className="w-full h-full"
                  src={videoSubmission.videoUrl}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
              {videoSubmission.message && (
                <div className="text-sm text-gray-700 italic">
                  "{videoSubmission.message}"
                </div>
              )}
              <div className="text-xs text-gray-500 mt-2">
                Submitted: {new Date(videoSubmission.uploadedAt).toLocaleDateString()}
              </div>
            </div>
          )}

          {/* About */}
          <DetailSection title="About" content={applicant.aboutYourself} />

          {/* Why Apply */}
          <DetailSection
            title="What drew you to apply for this scholarship?"
            content={applicant.whyApply}
          />

          {/* Challenge or Obstacle */}
          <DetailSection
            title="Challenge or Obstacle"
            content={applicant.challengeOrObstacle}
          />

          {/* Inspiration */}
          <DetailSection
            title="Where do you find inspiration?"
            content={applicant.inspiration}
          />

          {/* Wish for Yourself */}
          <DetailSection
            title="What do you wish for yourself?"
            content={applicant.wishForYourself}
          />

          {/* Anything Else */}
          {applicant.anythingElse && (
            <DetailSection
              title="Anything else to share?"
              content={applicant.anythingElse}
            />
          )}

          {/* Additional Info */}
          <div className="bg-gray-50 rounded-lg p-4 mt-6">
            <h4 className="font-semibold text-gray-900 mb-2">Additional Information</h4>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Preferred Contact:</span>{' '}
                {applicant.contactPreference}
              </p>
              <p>
                <span className="font-medium">How they heard about us:</span>{' '}
                {applicant.howDidYouHear}
                {applicant.howDidYouHearOther && ` - ${applicant.howDidYouHearOther}`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
