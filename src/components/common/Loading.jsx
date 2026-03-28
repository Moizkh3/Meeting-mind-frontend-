import React from 'react';
import { Loader2 } from 'lucide-react';

const Loading = ({ message = "Loading...", fullScreen = true }) => {
  const containerClasses = fullScreen 
    ? "fixed inset-0 z-[999] bg-white/50 backdrop-blur-sm flex flex-col items-center justify-center p-4" 
    : "absolute inset-0 z-[10] bg-white/50 backdrop-blur-sm flex flex-col items-center justify-center p-4 rounded-xl";

  return (
    <div className={containerClasses}>
      <Loader2 className="w-10 h-10 text-slate-800 animate-spin mb-4" />
      {message && (
        <p className="text-[11px] font-bold text-slate-700 uppercase tracking-widest">{message}</p>
      )}
    </div>
  );
};

export default Loading;
