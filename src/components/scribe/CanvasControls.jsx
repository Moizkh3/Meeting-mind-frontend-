import React from 'react';
import { Minus, Plus, RotateCcw, Hand, BarChart3, PlusSquare, Sparkles } from 'lucide-react';

const CanvasControls = ({ onAddNote, zoom, onZoomIn, onZoomOut, onRecenter, isPanningMode, onTogglePan, onAutoTidy, readOnly = false }) => {
  return (
    <div className="fixed bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 md:gap-4 z-[1000] canvas-controls-wrapper w-auto max-w-[95vw]">
      <div className="bg-white p-1 rounded-[12px] md:p-1.5 md:rounded-[14px] shadow-lg border border-slate-100 flex items-center">
        <div className="flex items-center gap-0.5 md:gap-1 px-1 md:px-2">
          <button className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-lg md:rounded-xl border-none bg-transparent text-slate-400 cursor-pointer transition-all duration-200 hover:bg-slate-50 hover:text-slate-800" onClick={onZoomOut}>
            <Minus size={14} />
          </button>
          <span className="text-[11px] md:text-[13px] font-bold text-slate-800 min-w-[36px] md:min-w-[44px] text-center">{Math.round(zoom * 100)}%</span>
          <button className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-lg md:rounded-xl border-none bg-transparent text-slate-400 cursor-pointer transition-all duration-200 hover:bg-slate-50 hover:text-slate-800" onClick={onZoomIn}>
            <Plus size={14} />
          </button>
        </div>

        <div className="w-px h-5 md:h-6 bg-slate-100 mx-1" />

        <button className="bg-transparent border-none text-slate-500 text-[11px] md:text-[13px] font-semibold flex items-center gap-1 md:gap-2 px-2 md:px-3 h-8 md:h-9 rounded-lg md:rounded-xl cursor-pointer transition-all duration-200 hover:bg-slate-50 hover:text-slate-800" onClick={onRecenter}>
          <RotateCcw size={14} />
          <span className="hidden sm:inline">Recenter</span>
        </button>

        <div className="w-px h-5 md:h-6 bg-slate-100 mx-1" />

        <button
          className={`w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-lg md:rounded-xl border-none bg-transparent cursor-pointer transition-all duration-200 hover:bg-slate-50 ${isPanningMode ? 'bg-slate-100 text-blue-600' : 'text-slate-400 hover:text-slate-800'}`}
          onClick={onTogglePan}
        >
          <Hand size={16} />
        </button>
      </div>

      {!readOnly && (
        <div className="bg-white p-1 rounded-[12px] md:p-1.5 md:rounded-[14px] shadow-lg border border-slate-100 flex items-center">
          <button className="w-9 h-9 md:w-11 md:h-11 bg-transparent border-none text-orange-500 flex items-center justify-center cursor-pointer" onClick={onAutoTidy} title="Auto Tidy">
            <Sparkles size={18} />
          </button>
          <button className="bg-blue-600 text-white border-none h-9 md:h-11 px-3 md:px-5 rounded-lg md:rounded-[10px] font-bold text-xs md:text-sm flex items-center gap-2 md:gap-3 cursor-pointer transition-all duration-200 shadow-[0_4px_12px_rgba(37,99,235,0.2)] hover:bg-blue-700 hover:-translate-y-px" onClick={onAddNote}>
            <PlusSquare size={16} />
            <span className="hidden sm:inline">Add General Notes</span>
          </button>
        </div>
      )}

    </div>
  );
};

export default CanvasControls;
