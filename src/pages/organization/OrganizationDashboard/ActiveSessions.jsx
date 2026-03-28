import React from "react";
import {
  Video,
  // Users,
  // Cpu,
  // UserCheck,
  // Lock,
  Clock
} from "lucide-react";

function StatusBadge({ status, startTime }) {
  if (status === "live") {
    return (
      <div className="flex items-center gap-6">
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#b6e0c4] bg-[#f0faf4] text-[#2e7d52] text-[12px] font-semibold">
          <span className="w-2 h-2 rounded-full bg-[#34a85a] animate-pulse" />
          LIVE
        </span>
      </div>
    );
  }
  
  const timeStr = new Date(startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  return (
    <div className="flex items-center gap-6">
      <div className="text-right">
        <p className="text-[10px] font-semibold text-[#7a8699] tracking-widest">STARTS AT</p>
        <p className="text-[14px] font-semibold text-[#2c3a4f]">{timeStr}</p>
      </div>
      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#f5d89a] bg-[#fffbf0] text-[#b07d1a] text-[12px] font-semibold">
        <span className="w-2 h-2 rounded-full bg-[#f0a500]" />
        UPCOMING
      </span>
    </div>
  );
}

export default function ActiveSessions({ meetings = [] }) {
  const now = new Date();
  
  const todaySessions = meetings
    .filter(m => {
      const isScheduled = m.meetingStatus === "scheduled" || m.meetingStatus === "Scheduled";
      const start = new Date(m.startAt);
      const isToday = start.getDate() === now.getDate() &&
                    start.getMonth() === now.getMonth() &&
                    start.getFullYear() === now.getFullYear();
      return isToday && isScheduled;
    })
    .sort((a, b) => new Date(a.startAt) - new Date(b.startAt));

  return (
    <div className="p-6 bg-white rounded-xl border border-[#e2e7ef] shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[12px] font-bold tracking-widest text-[#2c3a4f] uppercase">
          Today's Scheduled Sessions
        </h2>
        <span className="text-[11px] text-[#4a6fa5] font-bold uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded">Real-time sync</span>
      </div>

      {/* Session Rows */}
      <div className="space-y-3">
        {todaySessions.length > 0 ? (
          todaySessions.map((session) => {
            const isLive = session.meetingStatus === "in-progress";
            const scribe = session.attendees?.find(a => a.isScriber);
            const scribeName = scribe ? (scribe.user?.name || scribe.nameForUnregisteredAttendee || "Assigned Scribe") : "AI Scribe";

            return (
              <div
                key={session._id}
                className="flex flex-col md:flex-row md:items-center gap-4 px-5 py-4 bg-slate-50/50 rounded-xl border border-transparent hover:border-slate-200 hover:bg-white transition-all duration-200 group"
              >
                {/* Left Side: Icon + Details */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-lg border border-[#e2e7ef] bg-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                    <Video size={18} className="text-[#4a6071]" />
                  </div>

                  {/* Title & Meta */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-[#2c3a4f] truncate mb-1">
                      {session.agenda || "Untitled Meeting"}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Scribe</span>
                        <span className="text-[12px] text-slate-600 font-bold truncate max-w-[150px]">{scribeName}</span>
                      </div>
                      <div className="hidden sm:block w-px h-3 bg-slate-200" />
                      <div className="flex items-center gap-1.5">
                        <span className="text-[12px] text-slate-500 font-medium">{session.attendees?.length || 0} Attendees</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side: Status Badge */}
                <div className="flex items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t border-slate-100 md:border-0">
                   <StatusBadge
                    status={isLive ? "live" : "upcoming"}
                    startTime={session.startAt}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-16 text-center bg-slate-50/30 rounded-xl border border-dashed border-slate-200">
            <Clock size={32} className="mx-auto text-slate-200 mb-2" />
            <p className="text-[13px] text-slate-400 font-medium italic">No sessions identified on today's roster.</p>
          </div>
        )}
      </div>
    </div>
  );
}