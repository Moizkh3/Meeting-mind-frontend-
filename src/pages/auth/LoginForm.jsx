import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Brain, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      let res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/auth/login`,
        { email, password },
        { withCredentials: true }
      );
      
      const userData = res.data.data;
      login(userData);

      // Role-based redirection
      if (userData.role === 'admin') {
        navigate('/admin');
      } else if (userData.role === 'organizer') {
        navigate('/organization/dashboard');
      } else if (userData.role === 'attendee' || userData.role === 'scribe') {
        navigate('/attendee/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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

        {/* Error Message */}
        {error && (
          <div className="mb-4 px-4 py-2.5 bg-red-50 border border-red-200 rounded-lg text-red-500 text-[12px] font-medium text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
            <div className="flex justify-between items-center">
              <label className="text-slate-700 text-sm font-semibold">Password</label>
              <Link to="/forgot-password" className="text-[11px] text-slate-400 hover:text-[#1E293B] transition-colors font-medium">
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                className="w-full h-10 pl-10 pr-10 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#1E293B] focus:border-[#1E293B] text-slate-900 placeholder:text-slate-400 text-[13px] outline-none transition-all"
                placeholder="••••••••"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              className="w-4 h-4 rounded border-slate-300 cursor-pointer accent-[#1E293B]"
              id="remember"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label className="text-xs text-slate-500 font-medium cursor-pointer select-none" htmlFor="remember">
              Keep me logged in
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-[#1E293B] hover:bg-slate-800 text-white font-bold text-sm tracking-widest uppercase transition-all flex items-center justify-center gap-2 rounded-lg mt-1 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span>{loading ? 'Logging in...' : 'Login'}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>

          <div className="text-center mt-3">
            <span className="text-xs text-slate-500">Don't have an account? </span>
            <Link to="/signup" className="text-xs text-[#1E293B] font-bold hover:underline">
              Sign up
            </Link>
          </div>

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

export default LoginForm;