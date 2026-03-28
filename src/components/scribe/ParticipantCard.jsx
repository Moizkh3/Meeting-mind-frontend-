import React, { useState, useRef, useEffect } from 'react';
import { Plus, Eye, EyeOff } from 'lucide-react';

const ParticipantCard = ({ participant, onUpdatePos, onAddNote, onToggleNotes, onSelect, isNotesHidden, zoom = 1, isSelected, readOnly = false }) => {
  const { name, avatar, isSpeaking, isLive, lastTranscript, position, id, zIndex } = participant;
  const [isDragging, setIsDragging] = useState(false);
  const [imgError, setImgError] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false);

  const getInitials = (n) =>
    n?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

  const handleMouseDown = (e) => {
    if (readOnly || e.button !== 0 || e.target.closest('.action-btn')) return;
    setIsDragging(true);
    hasMoved.current = false;

    const top = parseInt(position.top);
    const left = parseInt(position.left);
    dragStart.current = { x: e.clientX / zoom - left, y: e.clientY / zoom - top };

    e.stopPropagation();
    e.preventDefault();
  };

  const handleMouseUp = (e) => {
    if (isDragging) setIsDragging(false);
    if (!readOnly && !hasMoved.current && !e.target.closest('.action-btn')) {
      if (onSelect) onSelect(id);
      if (onToggleNotes) onToggleNotes();
    }
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      hasMoved.current = true;
      const newLeft = e.clientX / zoom - dragStart.current.x;
      const newTop = e.clientY / zoom - dragStart.current.y;
      onUpdatePos({ top: `${newTop}px`, left: `${newLeft}px` });
    };

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
    <>
      <div
        className={`participant-card absolute bg-white rounded-xl border-solid shadow-[0_4px_12px_rgba(0,0,0,0.05)] p-3 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] select-none hover:shadow-lg w-72 
          ${isSpeaking ? 'border-2 border-orange-500 glow-speaking' : 'border border-slate-200'} 
          ${isSelected ? 'glow-active' : ''}
          ${isNotesHidden ? 'glow-hidden' : ''}
        `}
        style={{
          top: position.top,
          left: position.left,
          zIndex: zIndex || 10,
          cursor: readOnly ? 'default' : (isDragging ? 'grabbing' : 'pointer')
        }}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 shrink-0">
            {avatar && !imgError ? (
              <img
                src={avatar}
                alt={name}
                className="w-full h-full rounded-lg object-cover bg-slate-100"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full rounded-lg bg-slate-800 flex items-center justify-center text-white text-xs font-bold">
                {getInitials(name)}
              </div>
            )}
            {isLive && <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm tracking-wider">LIVE</span>}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-slate-800 m-0 mb-0.5 truncate">{name}</h3>
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isSpeaking ? 'bg-orange-500 animate-pulse' : 'bg-slate-300'}`} />
              <span className={`text-[10px] tracking-wide uppercase font-extrabold ${isSpeaking ? 'text-orange-500' : 'text-slate-400'}`}>
                {isSpeaking ? 'Speaking' : 'Listening'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {!readOnly && (
              <>
                <button
                  className="action-btn w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 hover:bg-blue-100 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddNote(id);
                  }}
                  title="Add Note"
                >
                  <Plus size={16} />
                </button>
                <button
                  className={`action-btn w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isNotesHidden ? 'bg-rose-50 text-rose-500 hover:bg-rose-100' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onToggleNotes) onToggleNotes();
                  }}
                  title={isNotesHidden ? "Show Notes" : "Hide Notes"}
                >
                  {isNotesHidden ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

    </>
  );
};

export default ParticipantCard;
