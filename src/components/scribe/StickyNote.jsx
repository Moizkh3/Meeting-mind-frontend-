import React, { useState, useRef, useEffect } from 'react';

const StickyNote = ({ note, onUpdatePos, onUpdateText, onDelete, zoom = 1, readOnly = false }) => {
  const { text, tag, time, position, id, zIndex } = note;
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    if (readOnly || e.target.closest('button')) return;
    if (e.button !== 0) return;
    
    setIsDragging(true);
    const top = parseInt(position.top);
    const left = parseInt(position.left);
    dragStart.current = { x: e.clientX / zoom - left, y: e.clientY / zoom - top };
    
    e.stopPropagation();
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const newLeft = e.clientX / zoom - dragStart.current.x;
      const newTop = e.clientY / zoom - dragStart.current.y;
      onUpdatePos({ top: `${newTop}px`, left: `${newLeft}px` });
    };

    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, onUpdatePos, zoom]);

  return (
    <div 
      className={`sticky-note glow-note absolute w-[240px] min-h-[240px] bg-[#FFEC5B] px-8 py-7 flex flex-col transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] select-none group ${isDragging ? '!z-[999] scale-105 -rotate-1 shadow-[10px_25px_50px_rgba(0,0,0,0.25)]' : 'hover:-translate-y-1 hover:rotate-1'}`}
      style={{ 
        top: position.top, 
        left: position.left,
        zIndex: zIndex || 5,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onMouseDown={handleMouseDown}
    >
      {!readOnly && (
        <button 
          className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-red-500 text-white opacity-0 flex items-center justify-center cursor-pointer transition-all duration-200 shadow-lg z-[100] group-hover:opacity-100 hover:scale-110 hover:bg-red-600 active:scale-95" 
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          onMouseDown={(e) => e.stopPropagation()}
          title="Delete Note"
        >
          <span className="text-xl leading-none">×</span>
        </button>
      )}

      {note.title && (
        <h4 className="font-extrabold text-slate-900 text-[13px] leading-tight mb-3 pb-2 border-b border-black/10 uppercase tracking-tight line-clamp-2">{note.title}</h4>
      )}

      <textarea 
        className={`flex-1 w-full bg-transparent border-none resize-none font-[Inter,system-ui,sans-serif] text-sm leading-relaxed text-slate-800 outline-none font-medium placeholder:text-black/30 ${note.title ? 'mt-1' : 'mt-2'}`}
        value={text}
        onChange={(e) => onUpdateText(e.target.value)}
        placeholder="Type your notes here..."
        onMouseDown={(e) => e.stopPropagation()} 
        readOnly={readOnly}
      />

      <div className="flex justify-between items-center mt-4 pt-3 border-t border-black/5">
        <span className="text-[9px] font-black text-black opacity-30 tracking-[0.05em] uppercase">{tag.startsWith('#') ? tag : `#${tag}`}</span>
        <span className="text-[9px] font-bold text-black opacity-30">{time}</span>
      </div>
    </div>
  );
};

export default StickyNote;
