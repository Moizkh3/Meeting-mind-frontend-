import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, Brain, ArrowLeft, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const VerifyOTP = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const email = sessionStorage.getItem('reset_email') || 'your email';

  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer((s) => s - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (paste.length === 6) {
      setOtp(paste.split(''));
      inputRefs.current[5]?.focus();
    }
    e.preventDefault();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) {
      setError('Please enter the complete 6-digit code.');
      return;
    }
    navigate('/forgot-password/reset-password');
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

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-4 h-4 text-[#1E293B]" />
            <h2 className="text-base font-bold text-slate-900">Verify OTP</h2>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed">
            We sent a 6-digit code to <span className="font-semibold text-slate-600">{email}</span>. Enter it below to continue.
          </p>
        </div>

        {/* OTP Input */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex gap-2 justify-between" onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (inputRefs.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className={`w-11 h-12 text-center text-lg font-bold bg-slate-50 border rounded-lg outline-none transition-all
                  ${error ? 'border-red-300 focus:ring-red-400' : 'border-slate-200 focus:ring-[#1E293B] focus:border-[#1E293B]'}
                  focus:ring-1 text-slate-900`}
              />
            ))}
          </div>

          {error && <p className="text-xs text-red-500 font-medium -mt-1">{error}</p>}

          <div className="flex items-center justify-between text-[11px] mt-1">
            <span className="text-slate-400">Didn't receive the code?</span>
            {resendTimer > 0 ? (
              <span className="text-slate-400 font-medium">Resend in {resendTimer}s</span>
            ) : (
              <button
                type="button"
                onClick={() => setResendTimer(30)}
                className="text-[#1E293B] font-semibold hover:underline"
              >
                Resend OTP
              </button>
            )}
          </div>

          <button
            type="submit"
            className="w-full h-11 bg-[#1E293B] hover:bg-slate-800 text-white font-bold text-sm tracking-widest uppercase transition-all flex items-center justify-center gap-2 rounded-lg mt-1 cursor-pointer"
          >
            <span>Verify</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <Link
            to="/forgot-password"
            className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 hover:text-[#1E293B] transition-colors font-medium mt-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
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

export default VerifyOTP;
