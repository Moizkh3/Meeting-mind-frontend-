import { useState } from "react";
import { X, Calendar, Clock, User, ArrowRight } from "lucide-react";

function MeetingModal({ meeting, onClose }) {
  if (!meeting) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all"
      onClick={onClose}
    >
      <div
        className="bg-white border border-[#e2e7ef] rounded-2xl w-full max-w-md mx-4 shadow-2xl overflow-hidden scale-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#eef2f6]">
          <span className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">
            Meeting Dossier
          </span>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-50 text-slate-400 hover:text-[#2c3a4f] transition-all">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-8 py-6">
          {/* Title */}
          <h3 className="text-xl font-bold text-[#2c3a4f] mb-6 leading-tight">{meeting.title}</h3>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-50 border border-slate-100 rounded-xl px-5 py-4">
              <div className="flex items-center gap-2 mb-2 text-slate-400">
                <Calendar size={12} />
                <p className="text-[9px] font-black tracking-widest uppercase">Date</p>
              </div>
              <p className="text-[14px] font-bold text-[#2c3a4f]">{meeting.date}</p>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-xl px-5 py-4">
              <div className="flex items-center gap-2 mb-2 text-slate-400">
                <Clock size={12} />
                <p className="text-[9px] font-black tracking-widest uppercase">Duration</p>
              </div>
              <p className="text-[14px] font-bold text-[#2c3a4f]">{meeting.duration}</p>
            </div>
          </div>

          {/* Scribe */}
          <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[12px] font-bold text-primary">
                {meeting.scribe.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase()}
              </div>
              <div>
                <p className="text-[9px] font-black tracking-widest text-slate-400 uppercase mb-0.5">Scribe</p>
                <p className="text-[14px] font-bold text-[#2c3a4f]">{meeting.scribe}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 bg-slate-50/50 border-t border-[#eef2f6] flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-[13px] font-bold text-slate-500 hover:text-slate-700 transition-colors uppercase tracking-widest"
          >
            Dismiss
          </button>
          <button
            className="px-6 py-2.5 bg-primary text-white rounded-xl text-[13px] font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all uppercase tracking-widest"
          >
            Action Items
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RecentMeetingSummary({ recentMeetings }) {
  const [selected, setSelected] = useState(null);

  return (
    <div className="bg-white border border-[#e2e7ef] rounded-xl p-6 shadow-sm">
      <MeetingModal meeting={selected} onClose={() => setSelected(null)} />

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[14px] font-bold text-[#2c3a4f] uppercase tracking-wider">Recent Meeting Summary</h2>
        <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-1 rounded">Latest 5 Sessions</span>
      </div>

      {/* Table Area */}
      <div className="overflow-x-auto -mx-2 px-2">
        <div className="min-w-[600px]">
          {/* Table Header */}
          <div className="grid grid-cols-[2.5fr_1.5fr_1.5fr_1fr_0.5fr] pb-3 border-b border-[#f1f5f9] mb-2 px-2">
            {["Title", "Date", "Scribe", "Duration", ""].map((h, i) => (
              <span key={i} className="text-[10px] font-bold tracking-[0.1em] text-slate-400 uppercase">{h}</span>
            ))}
          </div>

          {/* Rows */}
          {recentMeetings.length > 0 ? (
            recentMeetings.map((m, idx) => (
              <div
                key={idx}
                className={`grid grid-cols-[2.5fr_1.5fr_1.5fr_1fr_0.5fr] py-4 items-center px-2 hover:bg-slate-50/50 transition-colors rounded-lg group ${
                  idx !== recentMeetings.length - 1 ? "border-b border-[#f8fafc]" : ""
                }`}
              >
                <div className="flex flex-col pr-2">
                  <span className="text-[13px] font-bold text-[#2c3a4f] truncate">{m.title}</span>
                </div>
                <span className="text-[12px] text-slate-500 font-medium">{m.date}</span>
                <div className="flex items-center gap-2">
                   <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-500">
                    {m.scribe?.[0]}
                  </div>
                  <span className="text-[12px] text-slate-500 font-medium truncate">{m.scribe}</span>
                </div>
                <span className="text-[12px] text-slate-500 font-mono font-bold bg-slate-50 px-2 py-0.5 rounded border border-slate-100 w-fit">{m.duration}</span>
                <button
                  onClick={() => setSelected(m)}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-slate-300 hover:text-primary hover:bg-primary/5 transition-all group-hover:translate-x-1"
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            ))
          ) : (
            <div className="py-20 text-center">
              <p className="text-sm text-slate-400 italic">No historical session data available.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}