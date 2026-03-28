import React from 'react';

const TranscriptionOverlay = ({ feed }) => {
  return (
    <div className="fixed right-0 top-16 w-80 h-[calc(100vh-64px)] bg-white border-l border-slate-200 flex flex-col z-20">
      <div className="p-4 border-b border-slate-100">
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest m-0">Live Transcription</h4>
      </div>
      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-6 custom-scrollbar">
        {feed.map((entry) => (
          <div key={entry.id} className="flex flex-col gap-1">
            <div className="flex justify-between text-[10px] font-bold text-slate-800">
              <span>{entry.speaker}</span>
              <span className="text-slate-400 font-normal">{entry.time}</span>
            </div>
            <p className="text-[0.75rem] leading-relaxed text-slate-600">{entry.text}</p>
          </div>
        ))}
      </div>
      <div className="p-4 bg-slate-50 border-t border-slate-200">
        <label className="text-[10px] font-bold uppercase text-slate-400 block mb-2">Scribe Input</label>
        <textarea 
          placeholder="Add internal notes..."
          className="w-full h-[100px] p-3 text-[0.75rem] border border-slate-200 rounded-sm resize-none outline-none focus:border-slate-800 transition-colors"
        ></textarea>
        <button className="w-full bg-slate-800 text-white text-[10px] font-bold py-2.5 mt-3 uppercase tracking-widest rounded-sm hover:bg-slate-700 transition-colors">
          Push to Canvas
        </button>
      </div>
    </div>
  );
};

export default TranscriptionOverlay;
