import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Brain, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosinstance';
import { useAuth } from '../../context/AuthContext';

const SignUpForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setError('');
    setLoading(true);

    try {
      // Step 1: Register (attendees must already be invited - backend checks this)
      await axiosInstance.post('/auth/signup', { name, email, password });

      // Step 2: Auto-login after successful registration
      const loginRes = await axiosInstance.post('/auth/login', { email, password });
      const userData = loginRes.data?.data;

      if (userData) {
        login(userData); // Update AuthContext
        // Redirect based on role
        if (userData.role === 'admin') navigate('/admin');
        else if (userData.role === 'organizer') navigate('/organization/dashboard');
        else navigate('/attendee/dashboard');
      } else {
        // Fallback: go to login if auto-login data is missing
        navigate('/login');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Sign up failed. Please check your email and try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center p-4 bg-slate-50 font-display">
      <div className="w-full max-w-[420px] h-fit bg-white border border-slate-200 rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-8">
        {/* Logo */}
        <div className="flex flex-col items-center mb-7">
          <div className="w-12 h-12 bg-[#1E293B] flex items-center justify-center rounded-xl mb-3">
            <Brain className="text-white w-6 h-6" />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900 uppercase">Meeting Mind</h1>
        </div>

        {/* Header */}
        <div className="mb-6 text-center">
          <h2 className="text-base font-bold text-slate-900">Create Account</h2>
          <p className="text-slate-400 text-xs mt-1">Sign up to access your account.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-700 text-sm font-semibold">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#1E293B] focus:border-[#1E293B] text-slate-900 placeholder:text-slate-400 text-[13px] outline-none transition-all"
                placeholder="John Doe"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-700 text-sm font-semibold">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#1E293B] focus:border-[#1E293B] text-slate-900 placeholder:text-slate-400 text-[13px] outline-none transition-all"
                placeholder="admin@meetingmind.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-700 text-sm font-semibold">Password</label>
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
                tabIndex="-1"
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
                  ${confirmPassword && password !== confirmPassword ? 'border-red-300 focus:ring-red-400 focus:border-red-400' : 'border-slate-200 focus:ring-[#1E293B] focus:border-[#1E293B]'}`}
                placeholder="Re-enter password"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                tabIndex="-1"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && <p className="text-xs text-red-500 font-medium -mt-1">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-[#1E293B] hover:bg-slate-800 text-white font-bold text-sm tracking-widest uppercase transition-all flex items-center justify-center gap-2 rounded-lg mt-2 cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Sign Up</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="text-center mt-2">
            <span className="text-xs text-slate-500">Already have an account? </span>
            <Link to="/login" className="text-xs text-[#1E293B] font-bold hover:underline">
              Log in
            </Link>
          </div>

          <div className="relative mt-2 flex items-center">
            <div className="flex-grow border-t border-slate-100"></div>
            <span className="flex-shrink mx-3 text-[10px] font-bold text-slate-300 uppercase tracking-widest">Restricted Access</span>
            <div className="flex-grow border-t border-slate-100"></div>
          </div>

          <p className="text-center text-[9px] text-slate-300 font-bold uppercase tracking-widest mt-1">
            © 2024 Meeting Mind Systems
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignUpForm;
