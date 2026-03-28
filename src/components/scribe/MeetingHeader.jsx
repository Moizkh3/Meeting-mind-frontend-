import React, { useState } from 'react';
import { LogOut, Users, MessageSquare, LayoutGrid, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import CanvasTabs from './live-canvas/CanvasTabs';

const AvatarCircle = ({ att }) => {
  const [imgError, setImgError] = useState(false);
  const initials = (att.name || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="group relative">
      {/* Hover tooltip */}
      <div className="absolute border border-gray-200 bg-white shadow-sm pointer-events-none opacity-0 group-hover:opacity-100 -top-14 right-0 transition-all duration-200 px-3 py-1.5 rounded-lg text-nowrap z-[200]">
        <p className="font-semibold text-[12px] text-slate-800">{att.name || 'Attendee'}</p>
        <div className="absolute right-3 -bottom-[6px] size-3 border-r border-b border-gray-200 bg-white rotate-45" />
      </div>
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full border-2 border-white shadow-sm overflow-hidden group-hover:-translate-x-1 transition-transform duration-200 cursor-pointer bg-slate-100 flex items-center justify-center">
        {att.avatar && !imgError ? (
          <img 
            src={att.avatar} 
            alt={att.name} 
            className="w-full h-full object-cover" 
            onError={() => setImgError(true)} 
          />
        ) : (
          <div className="w-full h-full bg-slate-800 flex items-center justify-center">
            <span className="text-white text-[9px] font-bold">
              {initials}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const MeetingHeader = ({ 
  activeCanvasTab = 'assigned', 
  onTabChange, 
  onSidebarToggle, 
  onNavToggle,
  isNavOpen,
  readOnly = false,
  attendees = [],
  hideEndButton = false,
  meetingTopic = "",
  onEndMeeting
}) => {
  const handleEndMeetingClick = () => {
    if (onEndMeeting) {
      onEndMeeting();
    } else {
      if (window.confirm("Are you sure you want to end this meeting? All transcription and notes will be saved to the archive.")) {
        alert("Meeting ended successfully. Redirecting to archive...");
      }
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-[100] w-full relative">
      <div className="flex items-center gap-3 md:gap-6">
        {/* Navigation Toggle */}
        <button 
          onClick={onNavToggle}
          className="w-8 h-8 flex items-center justify-center text-slate-900 border border-gray-200 rounded transition-colors shadow-sm bg-white hover:bg-slate-50"
          title={isNavOpen ? "Hide Navigation" : "Show Navigation"}
        >
          {isNavOpen ? <PanelLeftClose size={14} /> : <PanelLeftOpen size={14} />}
        </button>

        {/* Meeting Topic Integration */}
        {meetingTopic && (
          <div className="hidden lg:flex items-center gap-2 border-l border-slate-200 pl-6 mr-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50 px-2 py-1 rounded">Topic</span>
            <h2 className="text-sm font-bold text-slate-800 tracking-tight truncate max-w-[200px] xl:max-w-[400px]">
              {meetingTopic}
            </h2>
          </div>
        )}

        {/* Canvas Tabs */}
        {!readOnly && (
          <CanvasTabs 
            activeCanvasTab={activeCanvasTab} 
            setActiveCanvasTab={onTabChange} 
          />
        )}
      </div>
      
      <div className="flex items-center gap-3 md:gap-6">
        {/* Premium Stacked Avatars */}
        <div className="hidden md:flex items-center">
          <div className="flex -space-x-3">
            {(attendees || []).slice(0, 4).map((att, i) => (
              <AvatarCircle key={att.id || i} att={att} />
            ))}
            {(attendees || []).length > 4 && (
              <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 shadow-sm">
                +{attendees.length - 4}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-3">
          <button 
            className="bg-[#FFEC5B] text-slate-800 border border-[#FFEC5B] py-2 md:py-2.5 px-3 md:px-4 rounded-lg font-bold text-xs md:text-sm flex items-center gap-1.5 md:gap-2 cursor-pointer transition-all duration-200 hover:bg-[#F2DF4A] whitespace-nowrap shadow-sm" 
            onClick={onSidebarToggle}
          >
            <MessageSquare size={16} />
            <span className="hidden sm:inline">Notes</span>
          </button>

          {(!readOnly && !hideEndButton) && (
            <button 
              className="bg-orange-500 text-white border-none py-2 md:py-2.5 px-3 md:px-5 rounded-lg font-bold text-xs md:text-sm flex items-center gap-1.5 md:gap-2 cursor-pointer transition-all duration-200 hover:bg-orange-600 hover:-translate-y-px whitespace-nowrap shadow-sm" 
              onClick={handleEndMeetingClick}
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">End</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default MeetingHeader;
