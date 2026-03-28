import React from 'react';

const CanvasTopicBar = ({ meetingTopic }) => {
  return (
    <div className="bg-white/95 backdrop-blur-xl border-b border-slate-200 py-4 px-4 flex items-center gap-3 z-50 relative shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 shadow-sm">
        <span className="text-xl leading-none">📅</span>
      </div>
      <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full ml-1">Topic</span>
      <h2 className="text-base font-bold text-slate-900 ml-2 truncate tracking-tight">{meetingTopic}</h2>
    </div>
  );
};

export default CanvasTopicBar;
