import React, { useState, useEffect } from 'react';
import { confirmResetPassword } from 'aws-amplify/auth';
import { Lock, CheckCircle } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const SetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    try {
      await confirmResetPassword({
        username: email.toLowerCase(),
        confirmationCode: code,
        newPassword,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to set password');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Password Set Successfully!
          </h1>
          <p className="text-gray-600 mb-4">
            Redirecting you to login...
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-800 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-800 to-green-900 rounded-full mb-4">
            <Lock className="w-8 h-8 text-amber-100" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Set Your Password
          </h1>
          <p className="text-gray-600 text-sm">
            Welcome to the One More Day Scholarship Review Board!
            <br />
            Create your password to get started.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSetPassword} className="space-y-4">
          {/* Email (readonly if from URL) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-800 focus:border-transparent bg-gray-50"
              required
              readOnly={!!searchParams.get('email')}
            />
          </div>

          {/* Verification Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verification Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-800 focus:border-transparent"
              placeholder="Enter code from email"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Check your email for the 6-digit verification code
            </p>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-800 focus:border-transparent"
                placeholder="Create a password"
                required
                minLength={8}
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-800 focus:border-transparent"
                placeholder="Confirm your password"
                required
                minLength={8}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Must be at least 8 characters
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-800 to-green-900 text-white py-3 rounded-lg font-semibold hover:from-green-900 hover:to-green-950 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Setting Password...' : 'Set Password & Continue'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/" className="text-green-800 hover:text-green-900 font-medium">
              Log in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
