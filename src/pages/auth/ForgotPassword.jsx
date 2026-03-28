import React, { useState } from 'react';
import { Mail, ArrowRight, Brain, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../api/auth';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await forgotPassword(email);
      if (response.success) {
        setSuccess(true);
      } else {
        setError(response.message || 'Failed to send reset email.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen grid place-items-center p-4">
        <div className="w-full max-w-[420px] h-fit bg-white border border-slate-200 rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Check your email</h2>
          <p className="text-slate-500 text-sm mb-8">
            We've sent a password reset link to <span className="font-semibold text-slate-900">{email}</span>.
          </p>
          <Link
            to="/login"
            className="w-full h-11 bg-[#1E293B] hover:bg-slate-800 text-white font-bold text-sm tracking-widest uppercase transition-all flex items-center justify-center rounded-lg"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid place-items-center p-4">
      <div className="w-full max-w-[420px] h-fit bg-white border border-slate-200 rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-8">
        {/* Logo */}
        <div className="flex flex-col items-center mb-7">
          <div className="w-12 h-12 bg-[#1E293B] flex items-center justify-center rounded-xl mb-3">
            <Brain className="text-white w-6 h-6" />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900 uppercase">Meeting Mind</h1>
        </div>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-base font-bold text-slate-900">Forgot Password?</h2>
          <p className="text-slate-400 text-xs mt-1 leading-relaxed">
            Enter your email and we'll send you a link to reset your password.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-700 text-sm font-semibold">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#1E293B] focus:border-[#1E293B] text-slate-900 placeholder:text-slate-400 text-[13px] outline-none transition-all"
                placeholder="your.email@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-[11px] p-3 rounded-lg font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-[#1E293B] hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-sm tracking-widest uppercase transition-all flex items-center justify-center gap-2 rounded-lg mt-1 cursor-pointer"
          >
            <span>{loading ? 'Sending...' : 'Send Reset Link'}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>

          <Link
            to="/login"
            className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 hover:text-[#1E293B] transition-colors font-medium mt-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Login
          </Link>

          <div className="relative mt-3 flex items-center">
            <div className="flex-grow border-t border-slate-100"></div>
            <span className="flex-shrink mx-3 text-[10px] font-bold text-slate-300 uppercase tracking-widest">Restricted Access</span>
            <div className="flex-grow border-t border-slate-100"></div>
          </div>

          <p className="text-center text-[9px] text-slate-300 font-bold uppercase tracking-widest">
            © 2024 Meeting Mind Systems
          </p>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
