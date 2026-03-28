import React, { useState } from 'react';
import { Lock, ArrowRight, Brain, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { resetPassword } from '../../api/auth';

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const response = await resetPassword(token, password);
      if (response.success) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setError(response.message || 'Failed to reset password.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired reset link.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
        <div className="w-full max-w-[420px] bg-white border border-slate-200 rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-8 flex flex-col items-center gap-4">
          <div className="w-14 h-14 bg-green-50 border border-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Password Updated!</h2>
          <p className="text-slate-400 text-xs text-center">Your password has been reset successfully. Redirecting to login…</p>
          <div className="w-full h-1 bg-slate-100 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-[#1E293B] rounded-full animate-[progress_2s_linear_forwards]" style={{ width: '0%', animation: 'none', transition: 'width 2s linear', width: '100%' }}></div>
          </div>
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
          <h2 className="text-base font-bold text-slate-900">New Password</h2>
          <p className="text-slate-400 text-xs mt-1 leading-relaxed">
            Choose a strong password for your admin account. Must be at least 8 characters.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-700 text-sm font-semibold">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                className="w-full h-10 pl-10 pr-10 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#1E293B] focus:border-[#1E293B] text-slate-900 placeholder:text-slate-400 text-[13px] outline-none transition-all"
                placeholder="Min. 8 characters"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-700 text-sm font-semibold">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                className={`w-full h-10 pl-10 pr-10 bg-slate-50 border rounded-lg focus:ring-1 text-slate-900 placeholder:text-slate-400 text-[13px] outline-none transition-all
                  ${confirm && password !== confirm ? 'border-red-300 focus:ring-red-400 focus:border-red-400' : 'border-slate-200 focus:ring-[#1E293B] focus:border-[#1E293B]'}`}
                placeholder="Re-enter password"
                type={showConfirm ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => { setConfirm(e.target.value); setError(''); }}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && <p className="text-xs text-red-500 font-medium -mt-1">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-[#1E293B] hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-sm tracking-widest uppercase transition-all flex items-center justify-center gap-2 rounded-lg mt-1 cursor-pointer"
          >
            <span>{loading ? 'Updating Password...' : 'Reset Password'}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>

          <Link
            to="/login"
            className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 hover:text-[#1E293B] transition-colors font-medium mt-1"
          >
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

export default ResetPassword;
