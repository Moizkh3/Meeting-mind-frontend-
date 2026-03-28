import React from 'react';
import { useRouteError, useNavigate } from 'react-router-dom';

const RootErrorBoundary = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  console.error('Application Error:', error);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 text-slate-50 p-8 font-sans">
      <div className="max-w-[500px] text-center bg-slate-900/70 backdrop-blur-xl p-12 rounded-[24px] border border-white/10 shadow-2xl">
        <div className="text-[4rem] mb-6">⚠️</div>
        <h1 className="text-[1.8rem] font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Oops! Something went wrong</h1>
        <p className="text-slate-400 leading-relaxed mb-10 text-[1rem]">
          {error.statusText || error.message || "An unexpected error occurred."}
        </p>
        <div className="flex gap-4 justify-center sm:flex-row flex-col">
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3.5 rounded-[12px] font-semibold cursor-pointer transition-all duration-200 border-none text-[0.95rem] bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-[0_4px_12px_rgba(59,130,246,0.3)] hover:translate-y-[-2px] hover:shadow-[0_6px_20px_rgba(59,130,246,0.4)]"
          >
            Reload Page
          </button>
          <button 
            onClick={() => navigate('/scribe/dashboard')} 
            className="px-6 py-3.5 rounded-[12px] font-semibold cursor-pointer transition-all duration-200 text-[0.95rem] bg-white/5 text-slate-200 border border-white/10 hover:bg-white/10 hover:translate-y-[-2px]"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default RootErrorBoundary;
