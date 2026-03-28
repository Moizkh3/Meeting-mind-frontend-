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
  ChevronRight,
  X,
  Clock,
  MapPin,
  Link2,
  LayoutGrid,
  Bell,
  User as UserIcon,
  Loader2
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Pagination from "../../../components/common/Pagination";
import axiosInstance from "../../../api/axiosinstance";
import ConfirmModal from "../../../components/common/ConfirmModal";

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
  if (status === "Completed") {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">
        Completed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-500 border border-blue-200">
      {status}
    </span>
  );
};

const Meetings = () => {
  const navigate = useNavigate();
  const [meetings, setMeetings] = React.useState([]);
  const [stats, setStats] = React.useState({
    total: 0,
    live: 0,
    scheduledToday: 0,
    completedWeek: 0
  });
  const [currentPage, setCurrentPage] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [selectedMeeting, setSelectedMeeting] = React.useState(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("All");
  
  // New States for Deletion
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [meetingToDelete, setMeetingToDelete] = React.useState(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  
  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/meetings/getAllMeetings");
      const rawData = response.data.data || [];
      
      const mapped = rawData.map(m => {
        let currentStatus = "Scheduled";
        if (m.meetingStatus === "in-progress" || m.meetingStatus === "Live" || m.meetingStatus === "continue") currentStatus = "Live";
        else if (m.meetingStatus === "completed" || m.meetingStatus === "Completed") currentStatus = "Completed";
        else if (m.meetingStatus) currentStatus = m.meetingStatus.charAt(0).toUpperCase() + m.meetingStatus.slice(1).toLowerCase();

        return {
          id: m._id,
          title: m.agenda || "Untitled Meeting",
          code: m._id.toString().slice(-6).toUpperCase(),
          date: new Date(m.startAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
          scribes: (m.attendees || [])
            .filter(a => a.isScriber)
            .map(a => a.nameForUnregisteredAttendee || a.user?.name || a.userId?.name || "Scriber"),
          status: currentStatus,
          rawDate: m.startAt,
          startAt: m.startAt,
          meetingEndAt: m.meetingEndAt
        };
      });

      setMeetings(mapped);
      
      const today = new Date().toLocaleDateString();
      setStats({
        total: mapped.length,
        live: mapped.filter(m => m.status === "Live").length,
        scheduledToday: mapped.filter(m => new Date(m.rawDate).toLocaleDateString() === today).length,
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

  const handleDeleteClick = (id) => {
    setMeetingToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!meetingToDelete) return;
    setIsDeleting(true);
    try {
      await axiosInstance.delete(`/meetings/delete/${meetingToDelete}`);
      setIsDeleteModalOpen(false);
      setMeetingToDelete(null);
      fetchMeetings();
    } catch (err) {
      alert("Failed to delete meeting: " + (err.response?.data?.message || err.message));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (id) => {
    navigate(`/organization/create-meeting/${id}`);
  };

  const handleView = (meeting) => {
    setSelectedMeeting(meeting);
  };

  const filteredMeetings = meetings.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        m.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredMeetings.length / 10) || 1;
  const paginatedMeetings = filteredMeetings.slice((currentPage - 1) * 10, currentPage * 10);

  const kpiCards = [
    { label: "Total Meetings", value: stats.total, icon: Users },
    { label: "Live Now", value: stats.live, icon: Radio, dot: true },
    { label: "Scheduled Today", value: stats.scheduledToday, icon: Calendar },
    { label: "Completed This Week", value: stats.completedWeek, icon: CheckCircle2 },
  ];

  return (
    <div className="min-h-screen bg-sidebar/10">
      {/* Header */}
      <div className="p-4 md:p-8 pb-0 mt-4 lg:mt-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mb-3">
              <LayoutGrid size={18} className="shrink-0" />
              <span>Organization</span>
              <ChevronRight size={12} className="shrink-0" />
              <span className="text-primary font-bold">Meeting Workspace</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-charcoal tracking-tight">
              Meeting Workspace
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1 font-medium italic">
              Picking system identifiers for synchronized minute-taking.
            </p>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto">
            <button className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded bg-white border border-border text-slate-500 hover:bg-sidebar transition-all shadow-sm">
              <Bell size={18} />
            </button>
            <button className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded bg-white border border-border text-slate-500 hover:bg-sidebar transition-all shadow-sm">
              <UserIcon size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-8 pt-0">
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
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-8">
          <div className="relative flex-1 max-w-none lg:max-w-xs shadow-sm">
            <Search size={18} className="text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search meetings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-sm border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary bg-white/80 backdrop-blur-sm font-medium"
            />
          </div>
          <div className="grid grid-cols-2 lg:flex items-center gap-3">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full lg:w-40 px-3 py-2.5 text-sm border border-border rounded text-slate-600 bg-white shadow-sm focus:outline-none focus:ring-1 focus:ring-primary font-medium"
            >
              <option value="All">Status: All</option>
              <option value="Live">Live</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
            </select>
            <Link
              to="/organization/create-meeting"
              className="w-full lg:w-auto px-6 py-2.5 text-[11px] font-bold bg-charcoal text-white rounded hover:opacity-90 transition-all shadow-md uppercase tracking-wider flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Calendar size={14} />
              Schedule New
            </Link>
          </div>
        </div>

        {/* Table Container */}
        <div className="border border-border rounded-xl overflow-hidden mb-8 bg-white shadow-lg border-opacity-50">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-border">
                  <th className="text-left px-6 py-4 text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500 whitespace-nowrap">
                    Meeting Title
                  </th>
                  <th className="text-left px-6 py-4 text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500 whitespace-nowrap">
                    Scheduled At
                  </th>
                  <th className="text-left px-6 py-4 text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500 whitespace-nowrap">
                   Scriber
                  </th>
                  <th className="text-left px-6 py-4 text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500 whitespace-nowrap">
                    Status
                  </th>
                  <th className="text-left px-6 py-4 text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500 whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <Loader2 size={24} className="animate-spin" />
                        <span className="text-[11px] font-bold uppercase tracking-widest">Hydrating Session Logs...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedMeetings.length > 0 ? (
                  paginatedMeetings.map((m) => (
                    <tr
                      key={m.id}
                      className="hover:bg-sidebar/20 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <p className="font-bold text-charcoal">{m.title}</p>
                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">{m.code}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium whitespace-nowrap">{m.date}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          {m.scribes.length > 0 ? (
                            m.scribes.map((name, i) => (
                              <span key={i} className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 inline-block w-fit">
                                {name}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400 uppercase italic">No Scribe</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">{statusBadge(m.status)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 transition-all">
                          {m.status === 'Completed' ? (
                            <Link
                              to={`/organization/meetings/feedback/${m.id}`}
                              className="inline-flex items-center justify-center px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] transition-all rounded shadow-sm bg-emerald-50 text-emerald-600 border border-emerald-100 no-underline hover:bg-emerald-100"
                            >
                              VIEW FEEDBACK
                            </Link>
                          ) : (
                            <Link
                              to={`/organization/live-session?meetingId=${m.id}`}
                              className={`inline-flex items-center justify-center px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] transition-all rounded shadow-sm no-underline ${
                                (m.status === 'Live')
                                  ? 'bg-charcoal text-white hover:bg-slate-800'
                                  : 'bg-slate-100 text-slate-500 cursor-not-allowed opacity-60 pointer-events-none'
                              }`}
                            >
                              JOIN MEETING
                            </Link>
                          )}
                          <button 
                            onClick={() => handleView(m)}
                            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm text-slate-400 hover:text-charcoal transition-all duration-200 border border-transparent hover:border-border"
                          >
                            <Eye size={18} />
                          </button>
                          <button 
                            onClick={() => handleEdit(m.id)}
                            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm text-slate-400 hover:text-charcoal transition-all duration-200 border border-transparent hover:border-border"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(m.id)}
                            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-rose-50 hover:shadow-sm text-slate-400 hover:text-rose-500 transition-all duration-200 border border-transparent hover:border-rose-100"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center text-slate-400 italic font-medium">
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
                    <Clock size={14} />
                    <span className="text-[9px] font-black uppercase tracking-widest">
                      {selectedMeeting.status === 'Completed' ? 'Actual Duration' : 'Local Session'}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-charcoal">
                    {(() => {
                      if (selectedMeeting.status === 'Completed' && selectedMeeting.startAt && selectedMeeting.meetingEndAt) {
                        const diff = new Date(selectedMeeting.meetingEndAt) - new Date(selectedMeeting.startAt);
                        const mins = Math.max(0, Math.floor(diff / 60000));
                        const hours = Math.floor(mins / 60);
                        const m = mins % 60;
                        return hours > 0 ? `${hours}h ${m}m` : `${m} mins`;
                      }
                      return selectedMeeting.status === 'Live' ? 'In Progress' : 'TBD';
                    })()}
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex flex-col items-end gap-1.5 pt-1">
                  <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Scriber</span>
                  <div className="flex flex-wrap justify-end gap-1.5">
                    {selectedMeeting.scribes.length > 0 ? (
                      selectedMeeting.scribes.map((name, i) => (
                        <span key={i} className="text-[11px] font-bold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                          {name}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 uppercase italic">No Scribe</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-border flex gap-3">
              <button 
                onClick={() => setSelectedMeeting(null)}
                className="flex-1 px-4 py-2.5 text-[11px] font-bold text-slate-500 bg-white border border-border rounded-lg hover:bg-slate-50 transition-all uppercase tracking-widest"
              >
                Close
              </button>
              <button 
                onClick={() => handleEdit(selectedMeeting.id)}
                className="flex-1 px-4 py-2.5 text-[11px] font-bold text-white bg-charcoal rounded-lg hover:opacity-90 transition-all shadow-md uppercase tracking-widest"
              >
                Modify Session
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Delete Meeting?"
        message="Are you sure you want to remove this meeting from the workspace? All synchronized minute-taking data for this session will be permanently deleted."
        confirmLabel="Confirm Delete"
        variant="danger"
      />
    </div>
  );
};

export default Meetings;
