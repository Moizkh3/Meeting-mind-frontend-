import { useState, useEffect } from "react";
import axios from "axios";
import {
  History,
  Search,
  Filter,
  FileDown,
  FileText,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
} from "lucide-react";

const PAGE_SIZE = 4;

const formatDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

const getScribe = (attendees) => {
  const scribe = attendees?.find((a) => a.isScriber);
  return scribe?.nameForUnregisteredAttendee || scribe?.name || "—";
};

export default function MeetingHistory() {
  const [search, setSearch] = useState("");
  const [expanded, setExpand] = useState({});
  const [page, setPage] = useState(1);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/meeting/getAllMeetings`,
            { withCredentials: true } 
        );
        setMeetings(res.data.data); // ← res.data.data kyunki response mein "data" key hai
      } catch (err) {
        setError("Failed to load meetings.");
      } finally {
        setLoading(false);
      }
    };
    fetchMeetings();
  }, []);

  const toggle = (id) => setExpand((p) => ({ ...p, [id]: !p[id] }));

  const visible = meetings.filter((m) =>
    m.agenda?.toLowerCase().includes(search.toLowerCase())
  );

  const TOTAL = visible.length;
  const TOTAL_PGS = Math.ceil(TOTAL / PAGE_SIZE);
  const paginated = visible.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pages = Array.from({ length: Math.min(TOTAL_PGS, 3) }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-[#f4f6fa]">

      {/* Top Nav Bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-[#e2e7ef]">
        <div className="flex items-center gap-2 text-[#2c3a4f]">
          <History size={18} className="text-[#4a6071]" />
          <span className="text-[12px] font-black tracking-widest uppercase">Past Meeting Archive</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 border border-[#e2e7ef] rounded-lg px-3 py-2 bg-white w-52 focus-within:border-[#4a6fa5] transition-colors">
            <Search size={15} className="text-[#8a99b0]" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search archive..."
              className="flex-1 text-[13px] text-[#2c3a4f] placeholder:text-[#c5cdd8] outline-none bg-transparent"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-[24px] font-bold text-[#2c3a4f] mb-1">Meeting History</h1>
            <p className="text-[13px] text-[#8a99b0]">
              Comprehensive log of all organizational proceedings and decisions.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 border border-[#d0d7e2] rounded-lg text-[13px] font-semibold text-[#2c3a4f] bg-white hover:bg-[#f4f6fa] transition-colors">
              <Filter size={16} />
              Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-[#2c3a4f] text-white text-[13px] font-semibold rounded-lg hover:bg-[#3d4f66] transition-colors">
              <FileDown size={16} />
              Export All
            </button>
          </div>
        </div>

        {/* Loading / Error */}
        {loading && (
          <div className="text-center py-10 text-[13px] text-[#8a99b0]">Loading meetings...</div>
        )}
        {error && (
          <div className="text-center py-10 text-[13px] text-red-400">{error}</div>
        )}

        {/* Table */}
        {!loading && !error && (
          <div className="bg-white border border-[#e2e7ef] rounded-xl overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-[2.5rem_3fr_1.5fr_2fr_1.5fr] px-5 py-3 bg-[#f7f9fc] border-b border-[#e2e7ef]">
              <div />
              {["Meeting Title", "Date", "Scribe", "Actions"].map((h) => (
                <span key={h} className="text-[10px] font-black tracking-widest text-[#8a99b0] uppercase">
                  {h}
                </span>
              ))}
            </div>

            {/* Rows */}
            {paginated.length === 0 ? (
              <div className="px-5 py-10 text-center text-[13px] text-[#8a99b0]">No records found.</div>
            ) : (
              paginated.map((m, idx) => {
                const isOpen = !!expanded[m._id];
                return (
                  <div key={m._id} className={idx !== paginated.length - 1 ? "border-b border-[#e2e7ef]" : ""}>
                    <div
                      className="grid grid-cols-[2.5rem_3fr_1.5fr_2fr_1.5fr] px-5 py-4 items-center hover:bg-[#f7f9fc] transition-colors cursor-pointer"
                      onClick={() => toggle(m._id)}
                    >
                      <div className="flex items-center">
                        {isOpen
                          ? <ChevronDown size={18} className="text-[#4a6071]" />
                          : <ChevronRight size={18} className="text-[#4a6071]" />
                        }
                      </div>
                      <span className="text-[14px] font-semibold text-[#2c3a4f]">{m.agenda}</span>
                      <span className="text-[13px] text-[#4a6071]">{formatDate(m.startAt)}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#c5cdd8] shrink-0" />
                        <span className="text-[13px] text-[#4a6071]">{getScribe(m.attendees)}</span>
                      </div>
                      <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
                        <button className="flex items-center gap-1 text-[12px] font-semibold text-[#4a6071] hover:text-[#2c3a4f] transition-colors">
                          <FileText size={15} />
                          PDF
                        </button>
                        <button className="flex items-center gap-1 text-[12px] font-semibold text-[#4a6071] hover:text-[#2c3a4f] transition-colors">
                          <FileDown size={15} />
                          Export
                        </button>
                      </div>
                    </div>

                    {/* Expanded Panel */}
                    {isOpen && (
                      <div className="mx-5 mb-4 border border-[#e2e7ef] rounded-lg p-4 bg-[#f7f9fc]">
                        <p className="text-[10px] font-black tracking-widest text-[#8a99b0] uppercase mb-3">
                          Meeting Details
                        </p>
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <p className="text-[11px] font-bold text-[#8a99b0] uppercase mb-1">Description</p>
                            <p className="text-[13px] text-[#4a6071]">{m.description || "—"}</p>
                          </div>
                          <div>
                            <p className="text-[11px] font-bold text-[#8a99b0] uppercase mb-1">Details</p>
                            <p className="text-[13px] text-[#4a6071]">
                              <span className="font-semibold">Type:</span> {m.meetingType}
                            </p>
                            <p className="text-[13px] text-[#4a6071]">
                              <span className="font-semibold">Location:</span> {m.location || m.meetingLink || "—"}
                            </p>
                            <p className="text-[13px] text-[#4a6071]">
                              <span className="font-semibold">Status:</span> {m.meetingStatus}
                            </p>
                            <p className="text-[13px] text-[#4a6071]">
                              <span className="font-semibold">Recurring:</span> {m.isRecurring ? "Yes" : "No"}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {/* Pagination Footer */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-[#e2e7ef] bg-[#f7f9fc]">
              <span className="text-[12px] text-[#4a6071] font-semibold uppercase tracking-wide">
                Showing {TOTAL === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, TOTAL)} of {TOTAL} Entries
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#e2e7ef] text-[#4a6071] disabled:text-[#c5cdd8] hover:bg-[#eef0f5] transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                {pages.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-[13px] font-bold border transition-colors ${page === p
                        ? "bg-[#2c3a4f] text-white border-[#2c3a4f]"
                        : "border-[#e2e7ef] text-[#4a6071] hover:bg-[#eef0f5]"
                      }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(TOTAL_PGS, p + 1))}
                  disabled={page === TOTAL_PGS}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#e2e7ef] text-[#4a6071] disabled:text-[#c5cdd8] hover:bg-[#eef0f5] transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}