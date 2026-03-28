import { useState } from "react";
import { Search, Calendar, Eye, Edit2, X } from "lucide-react";

const ALL_MEETINGS = [
  { id: 1,  title: "Quarterly Strategy Review",    date: "Oct 12, 2024 - 10:00 AM", duration: "60 mins",  scribes: ["JD","ML"],        status: "Live" },
  { id: 2,  title: "Design Sync: Project Phoenix", date: "Oct 14, 2024 - 02:30 PM", duration: "45 mins",  scribes: ["SH"],             status: "Scheduled" },
  { id: 3,  title: "Weekly All Hands",             date: "Oct 16, 2024 - 09:00 AM", duration: "30 mins",  scribes: ["AK","RT"], extra:2, status: "Scheduled" },
  { id: 4,  title: "Product Roadmap Review",       date: "Oct 18, 2024 - 11:00 AM", duration: "90 mins",  scribes: ["JD"],             status: "Scheduled" },
  { id: 5,  title: "Engineering Standup",          date: "Oct 19, 2024 - 09:30 AM", duration: "15 mins",  scribes: ["ML","SH"],        status: "Scheduled" },
  { id: 6,  title: "Client Demo: Acme Corp",       date: "Oct 21, 2024 - 03:00 PM", duration: "60 mins",  scribes: ["AK"],             status: "Scheduled" },
  { id: 7,  title: "Board Meeting Q4",             date: "Oct 23, 2024 - 10:00 AM", duration: "120 mins", scribes: ["RT","JD"],        status: "Scheduled" },
  { id: 8,  title: "HR Policy Review",             date: "Oct 24, 2024 - 02:00 PM", duration: "45 mins",  scribes: ["SH"],             status: "Scheduled" },
  { id: 9,  title: "Marketing Sync",               date: "Oct 25, 2024 - 11:00 AM", duration: "30 mins",  scribes: ["ML"],             status: "Scheduled" },
  { id: 10, title: "Finance Review",               date: "Oct 28, 2024 - 10:00 AM", duration: "60 mins",  scribes: ["JD","AK"],        status: "Scheduled" },
  { id: 11, title: "Security Audit Briefing",      date: "Oct 29, 2024 - 09:00 AM", duration: "45 mins",  scribes: ["RT"],             status: "Scheduled" },
  { id: 12, title: "Year End Planning",            date: "Oct 31, 2024 - 03:00 PM", duration: "90 mins",  scribes: ["JD","ML","SH"],   status: "Scheduled" },
];

const PAGE_SIZE = 3;
const STATUS_OPTIONS = ["All", "Live", "Scheduled"];

function ScribeBadge({ initials }) {
  return (
    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#eef0f5] border border-[#dde1ea] text-[10px] font-bold text-[#4a6071]">
      {initials}
    </span>
  );
}

function MeetingModal({ meeting, onClose }) {
  if (!meeting) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={onClose}
    >
      <div
        className="bg-white border border-[#e2e7ef] rounded-xl w-full max-w-md mx-4 shadow-lg"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e7ef]">
          <span className="text-[11px] font-black tracking-widest text-[#2c3a4f] uppercase">Meeting Details</span>
          <button onClick={onClose} className="text-[#8a99b0] hover:text-[#2c3a4f] transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {/* Title + Status */}
          <div className="flex items-start justify-between gap-3 mb-5">
            <p className="text-[16px] font-bold text-[#2c3a4f] leading-snug">{meeting.title}</p>
            {meeting.status === "Live" ? (
              <span className="shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#34a85a] text-white text-[11px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                LIVE
              </span>
            ) : (
              <span className="shrink-0 px-3 py-1 rounded border border-[#d0d7e2] text-[#8a99b0] text-[11px] font-bold">
                SCHEDULED
              </span>
            )}
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-[#f7f9fc] border border-[#e2e7ef] rounded-lg px-4 py-3">
              <p className="text-[10px] font-black tracking-widest text-[#7a8699] uppercase mb-1">Scheduled At</p>
              <p className="text-[13px] font-semibold text-[#2c3a4f]">{meeting.date}</p>
            </div>
            <div className="bg-[#f7f9fc] border border-[#e2e7ef] rounded-lg px-4 py-3">
              <p className="text-[10px] font-black tracking-widest text-[#7a8699] uppercase mb-1">Duration</p>
              <p className="text-[13px] font-semibold text-[#2c3a4f]">{meeting.duration}</p>
            </div>
          </div>

          {/* Scribes */}
          <div className="py-3 border-t border-[#e2e7ef]">
            <p className="text-[11px] font-black tracking-widest text-[#7a8699] uppercase mb-2">Scribes Assigned</p>
            <div className="flex items-center gap-2 flex-wrap">
              {meeting.scribes.map(s => (
                <div key={s} className="flex items-center gap-2 bg-[#eef0f5] border border-[#dde1ea] rounded-lg px-3 py-1.5">
                  <span className="w-6 h-6 rounded-full bg-[#2c3a4f] flex items-center justify-center text-[10px] font-bold text-white">
                    {s}
                  </span>
                  <span className="text-[12px] font-semibold text-[#2c3a4f]">{s}</span>
                </div>
              ))}
              {meeting.extra && (
                <span className="text-[12px] font-bold text-[#8a99b0]">+{meeting.extra} more</span>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#e2e7ef] flex justify-end gap-3">
          <button onClick={onClose}
            className="px-5 py-2 border border-[#d0d7e2] rounded-lg text-[13px] font-semibold text-[#2c3a4f] hover:bg-[#f4f6fa] transition-colors">
            Close
          </button>
          <button className="px-5 py-2 bg-[#2c3a4f] rounded-lg text-[13px] font-semibold text-white hover:bg-[#3d4f66] transition-colors">
            Edit Meeting
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UpcomingMeetings() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [page, setPage]     = useState(1);
  const [selected, setSelected] = useState(null);

  const filtered = ALL_MEETINGS.filter(m => {
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = status === "All" || m.status === status;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (val) => { setSearch(val); setPage(1); };
  const handleStatus = (val) => { setStatus(val); setPage(1); };

  return (
    <div>
      <MeetingModal meeting={selected} onClose={() => setSelected(null)} />

      <h2 className="text-[16px] font-bold text-[#2c3a4f] mb-4">Upcoming Meetings</h2>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2 flex-1 border border-[#e2e7ef] rounded-lg px-3 py-2.5 bg-white focus-within:border-[#4a6fa5] transition-colors">
          <Search size={16} className="text-[#8a99b0] shrink-0" />
          <input type="text" value={search} onChange={e => handleSearch(e.target.value)}
            placeholder="Search meetings..."
            className="flex-1 text-[13px] text-[#2c3a4f] placeholder:text-[#c5cdd8] outline-none bg-transparent" />
        </div>
        <select value={status} onChange={e => handleStatus(e.target.value)}
          className="border border-[#e2e7ef] rounded-lg px-4 py-2.5 text-[13px] text-[#2c3a4f] bg-white focus:outline-none focus:border-[#4a6fa5] transition-colors appearance-none cursor-pointer pr-8"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='%238a99b0'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" }}>
          {STATUS_OPTIONS.map(s => <option key={s}>Status: {s}</option>)}
        </select>
        <div className="flex items-center gap-2 border border-[#e2e7ef] rounded-lg px-3 py-2.5 bg-white text-[13px] text-[#2c3a4f]">
          <Calendar size={14} className="text-[#8a99b0]" />
          <span>Jan 1, 2024 - Jan 31, 2024</span>
        </div>
      </div>

      {/* Table */}
      <div className="border border-[#e2e7ef] rounded-xl overflow-hidden bg-white">
        <div className="grid grid-cols-[2fr_2fr_1fr_1.5fr_1fr_1fr] px-5 py-3 bg-[#f7f9fc] border-b border-[#e2e7ef]">
          {["Meeting Title","Scheduled At","Duration","Scribes Assigned","Status","Actions"].map(h => (
            <span key={h} className="text-[10px] font-black tracking-widest text-[#8a99b0] uppercase">{h}</span>
          ))}
        </div>

        {paginated.length === 0 ? (
          <div className="px-5 py-8 text-center text-[13px] text-[#8a99b0]">No meetings found.</div>
        ) : (
          paginated.map((m, idx) => (
            <div key={m.id}
              className={`grid grid-cols-[2fr_2fr_1fr_1.5fr_1fr_1fr] px-5 py-4 items-center hover:bg-[#f7f9fc] transition-colors ${
                idx !== paginated.length - 1 ? "border-b border-[#e2e7ef]" : ""
              }`}>
              <span className="text-[13px] font-semibold text-[#2c3a4f]">{m.title}</span>
              <span className="text-[13px] text-[#4a6071]">{m.date}</span>
              <span className="text-[13px] text-[#4a6071]">{m.duration}</span>
              <div className="flex items-center gap-1">
                {m.scribes.map(s => <ScribeBadge key={s} initials={s} />)}
                {m.extra && <span className="text-[11px] font-bold text-[#8a99b0] ml-1">+{m.extra}</span>}
              </div>
              <div>
                {m.status === "Live"
                  ? <span className="px-3 py-1 rounded-full bg-[#34a85a] text-white text-[11px] font-bold">Live</span>
                  : <span className="text-[13px] text-[#4a6071]">Scheduled</span>
                }
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setSelected(m)} className="text-[#8a99b0] hover:text-[#4a6fa5] transition-colors">
                  <Eye size={17} />
                </button>
                <button className="text-[#8a99b0] hover:text-[#4a6fa5] transition-colors">
                  <Edit2 size={17} />
                </button>
              </div>
            </div>
          ))
        )}

        <div className="flex items-center justify-between px-5 py-3 border-t border-[#e2e7ef] bg-[#f7f9fc]">
          <span className="text-[12px] text-[#8a99b0]">
            Showing {filtered.length === 0 ? 0 : (page-1)*PAGE_SIZE+1} to{" "}
            {Math.min(page*PAGE_SIZE, filtered.length)} of {filtered.length} results
          </span>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
              className="text-[13px] font-semibold text-[#4a6071] disabled:text-[#c5cdd8] hover:text-[#2c3a4f] transition-colors">
              Previous
            </button>
            <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages||filtered.length===0}
              className="text-[13px] font-semibold text-[#4a6071] disabled:text-[#c5cdd8] hover:text-[#2c3a4f] transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}