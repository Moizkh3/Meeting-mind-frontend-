import React from "react";
import { 
  Search, 
  Eye, 
  Edit2, 
  Trash2, 
  Users, 
  Radio, 
  Calendar, 
  CheckCircle2, 
  ChevronRight 
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Pagination from "../../../components/common/Pagination";
import axiosInstance from "../../../api/axiosinstance";
import { X, Clock, MapPin, Link2 } from "lucide-react";

// Removed ScribeAvatars component as user requested text names

const statusBadge = (status) => {
  if (status === "Live")
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500 text-white">
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
        Live
      </span>
    );
  if (status === "Scheduled")
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border border-slate-500 text-slate-500">
        Scheduled
      </span>
    );
  if (status === "Cancelled")
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-500">
        Cancelled
      </span>
    );
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">
      Completed
    </span>
  );
};
const Meetings = () => {
  const navigate = useNavigate();
  const [meetings, setMeetings] = React.useState([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedOrg, setSelectedOrg] = React.useState("");
  const [selectedStatus, setSelectedStatus] = React.useState("");
  const [selectedDate, setSelectedDate] = React.useState("");
  const [stats, setStats] = React.useState({
    total: 0,
    live: 0,
    scheduledToday: 0,
    completedWeek: 0
  });
  const [currentPage, setCurrentPage] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [selectedMeeting, setSelectedMeeting] = React.useState(null);
  
  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const meetingsRes = await axiosInstance.get("/meetings/getAllMeetings");
      const rawData = meetingsRes.data.data || [];
      
      // Fetch details individually to get populated attendees like in OrganizationProfile
      const detailedMeetingsRes = await Promise.all(
        rawData.map((m) => axiosInstance.get(`/meetings/id/${m._id}`).catch(() => null))
      );

      const mapped = detailedMeetingsRes.map((res, i) => {
        const m = res?.data?.data?.meeting || rawData[i];
        
        let displayStatus = "Scheduled";
        const now = new Date();
        const start = new Date(m.startAt);
        const end = m.meetingEndAt ? new Date(m.meetingEndAt) : null;
        
        if (m.meetingStatus === 'cancelled') {
           displayStatus = "Cancelled";
        } else if (m.meetingStatus === 'continue' || m.meetingStatus === 'in-progress' || (now >= start && (!end || now < end))) {
           displayStatus = "Live";
        } else if (m.meetingStatus === 'completed' || (end && now >= end) || (now > start && m.meetingStatus !== 'scheduled' && !end)) {
           // fallback logic: if it's way past start and no end time is recorded, but it's not explicitly live, consider it completed. 
           // BUT the backend says start -> no end time = continue. Let's just trust the backend logic exactly:
           displayStatus = "Live"; 
           if (m.meetingStatus === 'completed' || (end && now >= end)) displayStatus = "Completed";
        }

        return {
        id: m._id,
        title: m.agenda || "Untitled Meeting",
        code: m._id.toString().slice(-6).toUpperCase(),
        org: m.organizedBy?.name || "Global Platform",
        date: new Date(m.startAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
        rawDate: m.startAt ? new Date(m.startAt).toISOString().split('T')[0] : "",
        scribes: (m.attendees || []).filter(a => a.isScriber).map(a => {
           if (a.isRegistered === false) return a.nameForUnregisteredAttendee || "Guest";
           return a.user?.name || "Unknown User";
        }),
        status: displayStatus
      };
    });

      setMeetings(mapped);
      
      const today = new Date().toLocaleDateString();
      setStats({
        total: mapped.length,
        live: mapped.filter(m => m.status === "Live").length,
        scheduledToday: mapped.filter(m => new Date(m.date).toLocaleDateString() === today).length,
        completedWeek: mapped.filter(m => m.status === "Completed").length
      });
    } catch (err) {
      console.error("Failed to load meetings:", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchMeetings();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this meeting?")) return;
    try {
      await axiosInstance.delete(`/meetings/delete/${id}`);
      fetchMeetings();
    } catch (err) {
      alert("Failed to delete meeting: " + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (id) => {
    navigate(`/admin/meetings/edit/${id}`);
  };

  const handleView = (meeting) => {
    setSelectedMeeting(meeting);
  };

  const filteredMeetings = meetings.filter((m) => {
    const matchesSearch = 
      (m.title && m.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (m.code && m.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (m.org && m.org.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesOrg = selectedOrg ? m.org === selectedOrg : true;
    const matchesStatus = selectedStatus ? m.status === selectedStatus : true;
    const matchesDate = selectedDate ? m.rawDate === selectedDate : true;

    return matchesSearch && matchesOrg && matchesStatus && matchesDate;
  });

  const uniqueOrgs = [...new Set(meetings.map(m => m.org))];

  const totalPages = Math.ceil(filteredMeetings.length / 10) || 1;

  const kpiCards = [
    { label: "Total Meetings", value: stats.total, icon: Users },
    { label: "Live Now", value: stats.live, icon: Radio, dot: true },
    { label: "Scheduled Today", value: stats.scheduledToday, icon: Calendar },
    { label: "Completed This Week", value: stats.completedWeek, icon: CheckCircle2 },
  ];

  return (
    <div>
      <div className="p-4 md:p-8 pb-0 mt-4 lg:mt-0 shadow-sm border-b border-border/10 bg-white/50 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mb-3">
              <span>Infrastructure</span>
              <ChevronRight size={12} className="shrink-0" />
              <span className="text-primary font-bold">Meeting Oversight</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-charcoal tracking-tight">
              Meeting Oversight
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1 font-medium">
              Monitor active sessions, scheduled events, and historical meeting
              data.
            </p>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Find a session..."
                className="pl-9 pr-4 py-2 bg-white border border-border rounded text-sm w-full md:w-64 focus:outline-none focus:ring-1 focus:ring-primary/20 placeholder:text-slate-400 font-medium shadow-sm transition-all focus:bg-white"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-8 pt-6 md:pt-8 min-h-[calc(100vh-64px)] bg-sidebar/10">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {kpiCards.map((card) => (
            <div
              key={card.label}
              className="p-5 border border-border rounded bg-white shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] md:text-xs uppercase tracking-wide text-slate-500 font-bold opacity-80">
                  {card.label}
                </p>
                <div className="flex items-center gap-1.5">
                  {card.dot && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  )}
                  <card.icon size={18} className="text-slate-400" />
                </div>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-charcoal tracking-tight">{card.value}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col xl:flex-row xl:items-center gap-3 mb-8">
          <div className="relative flex-1 max-w-none xl:max-w-xs shadow-sm">
            <Search size={18} className="text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search meetings..."
              className="w-full pl-9 pr-3 py-2.5 text-sm border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary bg-white/80 backdrop-blur-sm"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select 
              value={selectedOrg}
              onChange={(e) => setSelectedOrg(e.target.value)}
              className="flex-1 lg:flex-none px-3 py-2.5 text-sm border border-border rounded text-slate-600 bg-white/80 shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All Organizations</option>
              {uniqueOrgs.map(org => (
                <option key={org} value={org}>{org}</option>
              ))}
            </select>
            <select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="flex-1 lg:flex-none px-3 py-2.5 text-sm border border-border rounded text-slate-600 bg-white/80 shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All Statuses</option>
              <option value="Live">Live</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
            </select>
            <div className="flex-1 lg:flex-none relative h-[42px]">
              <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input 
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full h-full pl-9 pr-3 text-sm border border-border rounded text-slate-600 bg-white/80 shadow-sm hover:bg-white transition-colors focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <Link
              to="/admin/meetings/create"
              className="w-full lg:w-auto px-6 py-2.5 text-sm font-bold bg-charcoal text-white rounded hover:opacity-90 transition-all shadow-md uppercase tracking-wider flex items-center justify-center"
            >
              + Create Meeting
            </Link>
          </div>
        </div>

        {/* Table Container */}
        <div className="border border-border rounded-xl overflow-hidden mb-8 bg-white shadow-lg border-opacity-50 max-w-full">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-border">
                  <th className="text-left px-4 py-4 text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500 whitespace-nowrap">
                    Meeting Title
                  </th>
                  <th className="text-left px-4 py-4 text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500 whitespace-nowrap">
                    Organization
                  </th>
                  <th className="text-left px-4 py-4 text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500 whitespace-nowrap">
                    Scheduled At
                  </th>
                  <th className="text-left px-4 py-4 text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500 whitespace-nowrap">
                    Scribes
                  </th>
                  <th className="text-left px-4 py-4 text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500 whitespace-nowrap">
                    Status
                  </th>
                  <th className="text-left px-4 py-4 text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500 whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredMeetings.length > 0 ? (
                  filteredMeetings.map((m) => (
                    <tr
                      key={m.id}
                      className="hover:bg-sidebar/20 transition-colors"
                    >
                      <td className="px-4 py-4">
                        <p className="font-bold text-charcoal">{m.title}</p>
                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">{m.code}</p>
                      </td>
                      <td className="px-4 py-4 text-slate-600 font-medium whitespace-nowrap max-w-[150px] truncate">{m.org}</td>
                      <td className="px-4 py-4 text-slate-600 font-medium whitespace-nowrap">{m.date}</td>
                      <td className="px-4 py-4 text-slate-600 font-medium">
                        {m.scribes.length > 0 ? m.scribes.join(', ') : "—"}
                      </td>
                      <td className="px-4 py-4">{statusBadge(m.status)}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5">
                          <button 
                            onClick={() => handleView(m)}
                            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm text-slate-500 hover:text-primary transition-all duration-200 border border-transparent hover:border-border"
                          >
                            <Eye size={18} />
                          </button>
                          <button 
                            onClick={() => handleEdit(m.id)}
                            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm text-slate-500 hover:text-primary transition-all duration-200 border border-transparent hover:border-border"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(m.id)}
                            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-rose-50 hover:shadow-sm text-slate-500 hover:text-rose-500 transition-all duration-200 border border-transparent hover:border-rose-100"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-16 text-center text-slate-400 italic font-medium">
                      No matching meeting logs identified.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalResults={filteredMeetings.length}
          label="meetings"
        />
      </div>

      {/* View Modal */}
      {selectedMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-slate-50/50">
              <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase">Meeting Dossier</span>
              <button 
                onClick={() => setSelectedMeeting(null)}
                className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-slate-400 hover:text-charcoal transition-all"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold text-charcoal">{selectedMeeting.title}</h3>
                  {statusBadge(selectedMeeting.status)}
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedMeeting.code}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-border/50">
                  <div className="flex items-center gap-2 mb-1 text-slate-400">
                    <Calendar size={14} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Scheduled For</span>
                  </div>
                  <p className="text-xs font-bold text-charcoal">{selectedMeeting.date}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-border/50">
                  <div className="flex items-center gap-2 mb-1 text-slate-400">
                    <MapPin size={14} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Platform Node</span>
                  </div>
                  <p className="text-xs font-bold text-charcoal">{selectedMeeting.org}</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Assigned Scribes</span>
                  <span className="text-xs font-bold text-charcoal">{selectedMeeting.scribes.length > 0 ? selectedMeeting.scribes.join(', ') : "None"}</span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-border flex gap-3">
              <button 
                onClick={() => setSelectedMeeting(null)}
                className="flex-1 px-4 py-2.5 text-xs font-bold text-slate-500 bg-white border border-border rounded-lg hover:bg-slate-50 transition-all uppercase tracking-widest"
              >
                Close
              </button>
              <button 
                onClick={() => handleEdit(selectedMeeting.id)}
                className="flex-1 px-4 py-2.5 text-xs font-bold text-white bg-charcoal rounded-lg hover:opacity-90 transition-all shadow-md uppercase tracking-widest"
              >
                Modify Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Meetings;