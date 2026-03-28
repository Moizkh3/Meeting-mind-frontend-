import React from 'react';

const CanvasTabs = ({ activeCanvasTab, setActiveCanvasTab }) => {
  return (
    <div className="flex bg-slate-100/80 rounded-full p-1 border border-slate-200 gap-1 md:gap-2">
      <button 
        className={`px-3 md:px-4 py-1.5 rounded-full text-xs md:text-sm font-bold transition-all whitespace-nowrap ${activeCanvasTab === 'assigned' ? 'bg-white text-blue-600 shadow-sm' : 'bg-transparent text-slate-500 hover:text-slate-700'}`}
        onClick={() => setActiveCanvasTab && setActiveCanvasTab('assigned')}
      >
        Assigned Canvas
      </button>
      <button 
        className={`px-3 md:px-4 py-1.5 rounded-full text-xs md:text-sm font-bold transition-all whitespace-nowrap ${activeCanvasTab === 'general' ? 'bg-white text-blue-600 shadow-sm' : 'bg-transparent text-slate-500 hover:text-slate-700'}`}
        onClick={() => setActiveCanvasTab && setActiveCanvasTab('general')}
      >
        General Notes
      </button>
    </div>
  );
};

export default CanvasTabs;
