import React, { useState } from 'react';
import { X, ChevronRight, Wand2, Send, MessageSquare, StickyNote as NoteIcon, List } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Scribe.css';

const IntelligenceSidebar = ({ canvasNotes, onNavigateToNote, isOpen, onToggle, onTopicChange, participants = [], transcriptNotes = [] }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('topic'); // 'topic' | 'notes'

  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (!input.trim()) return;

    if (activeTab === 'topic') {
      if (onTopicChange) {
        onTopicChange(input);
      }
    } else if (activeTab === 'chat') {
      setMessages([...messages, {
        id: Date.now(),
        sender: 'You',
        text: input,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }

    setInput('');
  };

  const allNotes = canvasNotes.map(n => {
    const participant = participants.find(p => p.id === n.participantId);
    return {
      time: n.time,
      title: n.title || n.tag,
      content: n.text || n.title,
      id: n.id,
      isCanvasNote: true,
      isTopic: n.tag === '#TOPIC',
      authorName: participant ? participant.name : (n.participantId === 'general' ? 'Meeting Mind' : 'Unknown')
    };
  });

  const topicNotes = allNotes.filter(n => n.isTopic);
  const generalNotes = allNotes.filter(n => !n.isTopic);

  return (
    <aside
      className={`h-full bg-white flex flex-col z-[100] transition-all duration-500 ease-in-out origin-right ${isOpen ? 'w-[25%] opacity-100 min-w-[340px] border-l border-slate-200 shadow-2xl' : 'w-0 opacity-0 overflow-hidden pointer-events-none'}`}
    >
      {/* Header */}
      <div className="h-16 border-b border-slate-100 flex items-center justify-between px-5 bg-white shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
            <Wand2 size={14} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-800 tracking-tight leading-none mb-0.5">Meeting Scribe</h2>
            <p className="text-[10px] text-slate-400 font-medium leading-none m-0">Live Transcripts</p>
          </div>
        </div>
        <button
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
          onClick={onToggle}
        >
          <X size={18} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex p-2 gap-2 border-b border-slate-100 bg-white shrink-0">
        <button
          className={`flex-1 py-2.5 px-2 text-[12px] font-bold border-none cursor-pointer rounded-lg flex justify-center items-center gap-1.5 transition-colors duration-200 ${activeTab === 'topic' ? 'bg-[#FFEC5B] text-slate-800 shadow-sm' : 'bg-transparent text-slate-500 hover:bg-slate-50'}`}
          onClick={() => setActiveTab('topic')}
        >
          <List size={14} /> Topic
        </button>
        <button
          className={`flex-1 py-2.5 px-2 text-[12px] font-bold border-none cursor-pointer rounded-lg flex justify-center items-center gap-1.5 transition-colors duration-200 ${activeTab === 'notes' ? 'bg-[#FFEC5B] text-slate-800 shadow-sm' : 'bg-transparent text-slate-500 hover:bg-slate-50'}`}
          onClick={() => setActiveTab('notes')}
        >
          <NoteIcon size={14} /> Notes
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-5 bg-white flex flex-col gap-4 custom-scrollbar">

        {/* TOPIC TAB */}
        {activeTab === 'topic' && (
          <div className="flex flex-col gap-4">
            {topicNotes.length === 0 ? (
              <p className="text-[11px] text-slate-400 text-center mt-10">No topics discussed yet.</p>
            ) : topicNotes.map((note, index) => (
              <div key={index} className="bg-slate-50 px-5 py-2.5 rounded-2xl border border-slate-200/60 shadow-sm transition-all hover:shadow-md">
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-[10px] font-extrabold text-[#F97316] uppercase tracking-widest bg-orange-50 px-2.5 py-1 rounded-full">Topic</span>
                  <span className="text-[10px] font-bold text-slate-400">{note.time}</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center text-[10px] font-bold text-orange-600">
                    {note.authorName.charAt(0)}
                  </div>
                  <span className="text-[11px] font-bold text-slate-600 italic tracking-tight">{note.authorName}</span>
                </div>
                <p className="text-[14px] text-slate-800 leading-relaxed m-0 font-bold tracking-tight truncate">{note.content}</p>
              </div>
            ))}
          </div>
        )}

        {/* NOTES TAB */}
        {activeTab === 'notes' && (
          <div className="flex flex-col gap-4">
            {generalNotes.length === 0 ? (
              <p className="text-[11px] text-slate-400 text-center mt-10">No notes captured.</p>
            ) : generalNotes.map((note, index) => (
              <div
                key={index}
                className="transition-all duration-300 group cursor-pointer bg-white px-5 py-1 rounded-xl border border-slate-200 shadow-sm hover:border-blue-200 hover:shadow-md hover:-translate-y-0.5"
                onClick={() => note.isCanvasNote && onNavigateToNote && onNavigateToNote(note.id)}
              >
                <div className="flex justify-between items-center mb-2.5 border-b border-slate-100 pb-3">
                  <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest bg-blue-50 px-2.5 py-1 rounded-full">{note.title}</span>
                  <span className="text-[10px] font-bold text-slate-400">{note.time}</span>
                </div>
                <div className="flex items-center gap-2 mb-2 px-0.5">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">
                    {note.authorName.charAt(0)}
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 italic tracking-tight">{note.authorName}</span>
                </div>
                <p className="text-[14px] text-slate-900 leading-relaxed m-0 font-medium tracking-tight truncate">{note.content}</p>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Chat Input - Only visible in Topic tab */}
      {(activeTab === 'topic') && (
        <div className="p-4 border-t border-slate-100 bg-white flex gap-2 shrink-0">
          <input
            type="text"
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] font-medium outline-none focus:border-[#FFEC5B] focus:bg-white transition-colors"
            placeholder={activeTab === 'topic' ? "Propose a new topic..." : "Send message..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button
            className="w-[42px] h-[42px] shrink-0 bg-slate-800 hover:bg-slate-900 text-white rounded-xl flex items-center justify-center transition-all hover:shadow-lg hover:-translate-y-0.5"
            onClick={sendMessage}
          >
            <Send size={16} className="-ml-0.5 text-[#FFEC5B]" />
          </button>
        </div>
      )}
    </aside>
  );
};

export default IntelligenceSidebar;
