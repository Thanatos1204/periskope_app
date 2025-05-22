'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { FiMail, FiLock, FiArrowLeft, FiCheck } from 'react-icons/fi';

export default function LoginForm() {
  const { signIn, verifyOTP } = useAuth();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (!email || !emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      const { error } = await signIn(email);
      
      if (error) {
        setError(error.message);
      } else {
        setSuccess('Verification code sent to your email');
        setShowOtpInput(true);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (!otp || otp.length < 6) {
      setError('Please enter a valid 6-digit code');
      setLoading(false);
      return;
    }

    try {
      const { error, data } = await verifyOTP(email, otp);
      
      if (error) {
        setError(error.message);
      } else if (data.session) {
        setSuccess('Login successful! Redirecting...');
        // The auth context will handle the redirect via onAuthStateChange
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setShowOtpInput(false);
    setOtp('');
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="space-y-6">
      {/* Status Messages */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
          <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
            <div className="w-2 h-2 rounded-full bg-white"></div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-red-800">Error</h4>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}
      
      {success && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-green-50 border border-green-200">
          <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
            <FiCheck size={12} className="text-white" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-green-800">Success</h4>
            <p className="text-sm text-green-700 mt-1">{success}</p>
          </div>
        </div>
      )}

      {!showOtpInput ? (
        // Email Input Form
        <form onSubmit={handleSendOTP} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-foreground">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiMail className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                id="email"
                type="email"
                placeholder="Enter your business email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-foreground placeholder:text-muted-foreground"
                required
                disabled={loading}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              We'll send a 6-digit verification code to this email address
            </p>
          </div>
          
          <button
            type="submit"
            disabled={loading || !email}
            className="w-full px-4 py-3 bg-[#3ECF73] text-white rounded-lg font-medium hover:bg-[#3ECF73]/90 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Sending code...
              </>
            ) : (
              'Send verification code'
            )}
          </button>
        </form>
      ) : (
        // OTP Verification Form
        <form onSubmit={handleVerifyOTP} className="space-y-6">
          {/* Back button */}
          <button
            type="button"
            onClick={handleBack}
            disabled={loading}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <FiArrowLeft size={16} />
            Back to email
          </button>
          
          <div className="space-y-2">
            <label htmlFor="otp" className="block text-sm font-medium text-foreground">
              Verification Code
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiLock className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                id="otp"
                type="text"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-foreground placeholder:text-muted-foreground text-center text-lg font-mono tracking-widest"
                required
                disabled={loading}
                maxLength={6}
              />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Code sent to <span className="font-medium text-foreground">{email}</span>
              </p>
              <button
                type="button"
                onClick={() => handleSendOTP({ preventDefault: () => {} } as React.FormEvent)}
                disabled={loading}
                className="text-xs text-white hover:underline disabled:opacity-50"
              >
                Resend code
              </button>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading || otp.length < 6}
            className="w-full px-4 py-3 bg-[#3ECF73] text-white rounded-lg font-medium hover:bg-[#3ECF73]/90 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Verifying...
              </>
            ) : (
              'Verify and sign in'
            )}
          </button>
        </form>
      )}
      
      {/* Additional help */}
      <div className="pt-4 border-t border-border">
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-2">
            Having trouble signing in?
          </p>
          <a 
            href="#" 
            className="text-xs text-primary hover:underline font-medium"
          >
            Contact your administrator
          </a>
        </div>
      </div>
    </div>
  );
}