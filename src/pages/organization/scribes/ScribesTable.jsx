import { useState } from "react";
import { Search, Eye, X, UserPlus } from "lucide-react";
import AttendeePicker from "../../../components/common/AttendeePicker";

const ALL_SCRIBES = [
  { id: 1,  name: "Sarah Henderson",  email: "sarah.h@meetingmind.com",    meetings: 142, quality: 4, status: "Active" },
  { id: 2,  name: "David Miller",     email: "d.miller@meetingmind.com",    meetings: 89,  quality: 5, status: "Active" },
  { id: 3,  name: "Elena Rodriguez",  email: "elena.rod@meetingmind.com",   meetings: 56,  quality: 3, status: "Inactive" },
  { id: 4,  name: "James Wilson",     email: "j.wilson@meetingmind.com",    meetings: 212, quality: 4, status: "Active" },
  { id: 5,  name: "Priya Sharma",     email: "p.sharma@meetingmind.com",    meetings: 98,  quality: 5, status: "Active" },
  { id: 6,  name: "Tom Nguyen",       email: "t.nguyen@meetingmind.com",    meetings: 34,  quality: 3, status: "Inactive" },
  { id: 7,  name: "Aisha Patel",      email: "a.patel@meetingmind.com",     meetings: 175, quality: 4, status: "Active" },
  { id: 8,  name: "Marcus Lee",       email: "m.lee@meetingmind.com",       meetings: 61,  quality: 4, status: "Active" },
  { id: 9,  name: "Sofia Reyes",      email: "s.reyes@meetingmind.com",     meetings: 120, quality: 5, status: "Active" },
  { id: 10, name: "Kevin Brown",      email: "k.brown@meetingmind.com",     meetings: 45,  quality: 3, status: "Inactive" },
  { id: 11, name: "Nina Johansson",   email: "n.johansson@meetingmind.com", meetings: 88,  quality: 4, status: "Active" },
  { id: 12, name: "Omar Khalid",      email: "o.khalid@meetingmind.com",    meetings: 199, quality: 5, status: "Active" },
];

const PAGE_SIZE = 4;
const STATUS_OPTIONS = ["All", "Active", "Inactive"];

function QualityDots({ score }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={`w-3 h-3 rounded-full ${i <= score ? "bg-[#2c3a4f]" : "bg-[#dde1ea]"}`} />
      ))}
    </div>
  );
}

function StatusBadge({ status }) {
  const isActive = status === "Active";
  return (
    <span className={`px-3 py-1 rounded border text-[11px] font-bold tracking-wide ${
      isActive ? "border-[#b6e0c4] text-[#2e7d52] bg-white" : "border-[#d0d7e2] text-[#8a99b0] bg-white"
    }`}>
      {status.toUpperCase()}
    </span>
  );
}

function ScribeModal({ scribe, onClose }) {
  if (!scribe) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={onClose}
    >
      <div
        className="bg-white border border-[#e2e7ef] rounded-xl w-full max-w-md mx-4 shadow-lg"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e7ef]">
          <span className="text-[11px] font-black tracking-widest text-[#2c3a4f] uppercase">
            Scribe Details
          </span>
          <button onClick={onClose} className="text-[#8a99b0] hover:text-[#2c3a4f] transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-5">
          {/* Avatar + Name */}
          <div className="flex items-center gap-4 mb-5">
            <div className="w-12 h-12 rounded-full bg-[#dde1ea] flex items-center justify-center text-[15px] font-bold text-[#4a6071] shrink-0">
              {scribe.name.split(" ").map(n => n[0]).join("")}
            </div>
            <div>
              <p className="text-[15px] font-bold text-[#2c3a4f]">{scribe.name}</p>
              <p className="text-[12px] text-[#8a99b0]">{scribe.email}</p>
            </div>
            <div className="ml-auto">
              <StatusBadge status={scribe.status} />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-[#f7f9fc] border border-[#e2e7ef] rounded-lg px-4 py-3">
              <p className="text-[10px] font-black tracking-widest text-[#7a8699] uppercase mb-1">Meetings Handled</p>
              <p className="text-[22px] font-bold text-[#2c3a4f]">{scribe.meetings}</p>
            </div>
            <div className="bg-[#f7f9fc] border border-[#e2e7ef] rounded-lg px-4 py-3">
              <p className="text-[10px] font-black tracking-widest text-[#7a8699] uppercase mb-2">Avg. Notes Quality</p>
              <QualityDots score={scribe.quality} />
            </div>
          </div>

          {/* Info Rows */}
          <div className="flex flex-col gap-2">
            {[
              { label: "Email",  value: scribe.email },
              { label: "Status", value: scribe.status },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-[#e2e7ef] last:border-0">
                <span className="text-[11px] font-bold tracking-widest text-[#7a8699] uppercase">{label}</span>
                <span className="text-[13px] text-[#2c3a4f] font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[#e2e7ef] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 border border-[#d0d7e2] rounded-lg text-[13px] font-semibold text-[#2c3a4f] hover:bg-[#f4f6fa] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ScribesTable() {
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const handleOrgPromote = (attendee) => {
    console.log("Organization promoted attendee:", attendee);
    setIsPickerOpen(false);
  };
  
  const [search, setSearch]       = useState("");
  const [status, setStatus]       = useState("All");
  const [page, setPage]           = useState(1);
  const [selected, setSelected]   = useState(null);

  const filtered = ALL_SCRIBES.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = status === "All" || s.status === status;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (v) => { setSearch(v); setPage(1); };
  const handleStatus = (v) => { setStatus(v); setPage(1); };

  return (
    <div>
      <ScribeModal scribe={selected} onClose={() => setSelected(null)} />

      {/* Filters Row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 border border-[#e2e7ef] rounded-lg px-3 py-2 bg-white w-52 focus-within:border-[#4a6fa5] transition-colors">
            <Search size={15} className="text-[#8a99b0]" />
            <input
              type="text"
              value={search}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Search by name..."
              className="flex-1 text-[13px] text-[#2c3a4f] placeholder:text-[#c5cdd8] outline-none bg-transparent"
            />
          </div>
          <select
            value={status}
            onChange={e => handleStatus(e.target.value)}
            className="border border-[#e2e7ef] rounded-lg px-4 py-2 text-[13px] text-[#2c3a4f] bg-white focus:outline-none focus:border-[#4a6fa5] transition-colors appearance-none cursor-pointer pr-8"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='%238a99b0'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" }}
          >
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>Status: {s}</option>)}
          </select>
        </div>
        <button 
          onClick={() => setIsPickerOpen(true)}
          className="flex items-center gap-2 px-4 py-2 border border-[#d0d7e2] rounded-lg text-[11px] font-bold text-[#2c3a4f] bg-white hover:bg-[#f4f6fa] transition-colors whitespace-nowrap flex-shrink-0 uppercase tracking-widest shadow-sm"
        >
          <UserPlus size={14} />
          Authorize Scribe Role
        </button>
      </div>

      <AttendeePicker 
        isOpen={isPickerOpen} 
        onClose={() => setIsPickerOpen(false)} 
        onAssign={handleOrgPromote}
        title="Authorize Attendee Scribe Role"
      />

      {/* Table */}
      <div className="bg-white border border-[#e2e7ef] rounded-xl overflow-hidden">
        <div className="grid grid-cols-[2fr_2.5fr_1.5fr_2fr_1.2fr_1fr] px-5 py-3 bg-[#f7f9fc] border-b border-[#e2e7ef]">
          {["Full Name", "Email", "Meetings Handled", "Avg. Notes Quality", "Status", "Actions"].map(h => (
            <span key={h} className="text-[10px] font-black tracking-widest text-[#8a99b0] uppercase leading-tight">{h}</span>
          ))}
        </div>

        {paginated.length === 0 ? (
          <div className="px-5 py-8 text-center text-[13px] text-[#8a99b0]">No scribes found.</div>
        ) : (
          paginated.map((s, idx) => (
            <div
              key={s.id}
              className={`grid grid-cols-[2fr_2.5fr_1.5fr_2fr_1.2fr_1fr] px-5 py-4 items-center hover:bg-[#f7f9fc] transition-colors ${
                idx !== paginated.length - 1 ? "border-b border-[#e2e7ef]" : ""
              }`}
            >
              <span className="text-[13px] font-semibold text-[#2c3a4f]">{s.name}</span>
              <span className="text-[13px] text-[#4a6071]">{s.email}</span>
              <span className="text-[13px] text-[#4a6071]">{s.meetings}</span>
              <QualityDots score={s.quality} />
              <StatusBadge status={s.status} />
              <button
                onClick={() => setSelected(s)}
                className="text-[#8a99b0] hover:text-[#4a6fa5] transition-colors"
              >
                <Eye size={17} />
              </button>
            </div>
          ))
        )}

        <div className="flex items-center justify-between px-5 py-3 border-t border-[#e2e7ef] bg-[#f7f9fc]">
          <span className="text-[12px] text-[#8a99b0]">
            Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1} to{" "}
            {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} scribes
          </span>     
          <div className="flex items-center gap-3">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="text-[13px] font-semibold text-[#4a6071] disabled:text-[#c5cdd8] hover:text-[#2c3a4f] transition-colors">
              Previous
            </button>
            {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-7 h-7 flex items-center justify-center rounded text-[13px] font-bold transition-colors ${
                  page === p ? "bg-[#2c3a4f] text-white" : "text-[#4a6071] hover:bg-[#eef0f5]"
                }`}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="text-[13px] font-semibold text-[#4a6071] disabled:text-[#c5cdd8] hover:text-[#2c3a4f] transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}