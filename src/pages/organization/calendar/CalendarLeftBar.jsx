import { MoreVertical, Clock, Radio, CheckCircle, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_NAMES   = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

const STATUS_CONFIG = {
  "in-progress": { icon: Radio,         color: "text-emerald-500", bg: "bg-emerald-50",  border: "border-emerald-200", label: "Live Now" },
  "scheduled":   { icon: Calendar,      color: "text-sky-500",     bg: "bg-sky-50",      border: "border-sky-200",     label: "Scheduled" },
  "completed":   { icon: CheckCircle,   color: "text-slate-400",   bg: "bg-slate-50",    border: "border-slate-200",   label: "Completed" },
};

function formatTime(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return isNaN(d) ? "—" : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function CalendarLeftBar({ selectedDate, meetings = [] }) {
  const navigate = useNavigate();
  const { day = new Date().getDate(), month = new Date().getMonth() + 1, year = new Date().getFullYear() } = selectedDate || {};

  const dateObj  = new Date(year, month - 1, day);
  const dayName  = DAY_NAMES[dateObj.getDay()];
  const monthName = MONTH_NAMES[month - 1];

  // Filter meetings that fall on the selected date
  const dayMeetings = meetings.filter(m => {
    if (!m.startAt) return false;
    const d = new Date(m.startAt);
    return !isNaN(d) &&
      d.getDate() === day &&
      d.getMonth() + 1 === month &&
      d.getFullYear() === year;
  }).sort((a, b) => new Date(a.startAt) - new Date(b.startAt));

  return (
    <div className="flex flex-col h-full">
      {/* Date Header */}
      <div className="px-5 pt-5 pb-4 border-b border-[#e2e7ef] bg-[#f7f9fc]">
        <h2 className="text-[17px] font-bold text-[#2c3a4f]">
          {monthName} {day}, {year}
        </h2>
        <p className="text-[12px] text-[#8a99b0] mt-0.5">
          {dayName} &bull; {dayMeetings.length} Meeting{dayMeetings.length !== 1 ? "s" : ""} Scheduled
        </p>
      </div>

      {/* Meeting List */}
      <div className="flex-1 overflow-y-auto">
        {dayMeetings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-5 text-center">
            <Calendar size={32} className="text-[#d0d7e2] mb-3" />
            <p className="text-[12px] text-[#8a99b0] font-medium">No meetings on this day.</p>
            <button
              onClick={() => navigate("/organization/create-meeting")}
              className="mt-4 px-4 py-2 text-[11px] font-bold uppercase tracking-widest bg-[#2c3a4f] text-white rounded-lg hover:bg-[#3d4f66] transition-colors"
            >
              + Schedule One
            </button>
          </div>
        ) : (
          dayMeetings.map((meeting, idx) => {
            const status  = meeting.meetingStatus || "scheduled";
            const config  = STATUS_CONFIG[status] || STATUS_CONFIG["scheduled"];
            const Icon    = config.icon;
            const startFmt = formatTime(meeting.startAt);
            const endFmt   = formatTime(meeting.meetingEndAt);
            const timeLabel = endFmt !== "—" ? `${startFmt} – ${endFmt}` : `Starts ${startFmt}`;
            const attendeeCount = (meeting.attendees || []).length;

            return (
              <div
                key={meeting._id || idx}
                className={`px-5 py-4 ${idx !== dayMeetings.length - 1 ? "border-b border-[#e2e7ef]" : ""} hover:bg-[#f7f9fc] transition-colors`}
              >
                {/* Status badge */}
                <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${config.bg} ${config.color} border ${config.border} mb-2`}>
                  <Icon size={9} className={status === "in-progress" ? "animate-pulse" : ""} />
                  {config.label}
                </div>

                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[#2c3a4f] truncate">
                      {meeting.agenda || "Untitled Meeting"}
                    </p>
                    <div className="flex items-center gap-1 mt-1 text-[#8a99b0]">
                      <Clock size={10} />
                      <p className="text-[11px]">{timeLabel}</p>
                    </div>
                    {attendeeCount > 0 && (
                      <p className="text-[10px] text-[#8a99b0] mt-0.5">{attendeeCount} attendee{attendeeCount !== 1 ? "s" : ""}</p>
                    )}
                  </div>
                  <button className="text-[#8a99b0] hover:text-[#2c3a4f] transition-colors mt-0.5 shrink-0">
                    <MoreVertical size={16} />
                  </button>
                </div>

                <div className="flex items-center gap-4 mt-3">
                  <button
                    onClick={() => navigate(`/organization/meetings`)}
                    className="text-[11px] font-bold tracking-widest text-[#4a6fa5] hover:text-[#2c3a4f] transition-colors uppercase"
                  >
                    Manage
                  </button>
                  {status === "in-progress" && (
                    <span className="text-[10px] font-bold text-emerald-500 animate-pulse uppercase tracking-widest">● Live</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-[#e2e7ef]">
        <button
          onClick={() => navigate("/organization/create-meeting")}
          className="w-full py-3 border border-[#d0d7e2] rounded-lg text-[11px] font-bold tracking-widest text-[#2c3a4f] uppercase hover:bg-[#f4f6fa] transition-colors"
        >
          + New Meeting
        </button>
      </div>
    </div>
  );
}