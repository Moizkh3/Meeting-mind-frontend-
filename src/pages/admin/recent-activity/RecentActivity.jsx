import React, { useState, useEffect } from "react";
import { 
  ChevronRight, 
  Search, 
  Download, 
  RefreshCcw, 
  ChevronDown, 
  Filter, 
  PlusCircle,
  Activity,
  Building2,
  UserPlus,
  CheckCircle2,
  Loader2
} from "lucide-react";
import Pagination from "../../../components/common/Pagination";
import axiosInstance from "../../../api/axiosinstance";

const RecentActivity = () => {
  const [loading, setLoading] = useState(true);
  const [allActivities, setAllActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 10;

  const riskConfig = {
    HIGH: { dotColor: "bg-rose-500", textClass: "text-rose-600 font-bold" },
    MED: { dotColor: "bg-amber-500", textClass: "text-amber-600 font-bold" },
    LOW: { dotColor: "bg-emerald-500", textClass: "text-emerald-600 font-bold" },
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [orgsRes, meetingsRes, usersRes] = await Promise.all([
        axiosInstance.get("/organizations"),
        axiosInstance.get("/meetings/getAllMeetings"),
        axiosInstance.get("/auth/users")
      ]);

      const orgs = orgsRes.data.organizations || orgsRes.data.data || [];
      const meetings = meetingsRes.data.data || [];
      const users = usersRes.data.data || [];

      const logs = [
        ...orgs.map(org => ({
          timestamp: new Date(org.createdAt).toLocaleString(),
          rawTime: new Date(org.createdAt),
          role: "SYSTEM",
          event: `New Organization "${org.name}" joined`,
          eventIcon: <Building2 size={14} />,
          ip: "127.0.0.1",
          risk: "LOW"
        })),
        ...meetings.map(m => ({
          timestamp: new Date(m.createdAt || m.startAt).toLocaleString(),
          rawTime: new Date(m.createdAt || m.startAt),
          role: "ADMIN",
          event: `Meeting "${m.agenda}" ${m.meetingStatus || 'scheduled'}`,
          eventIcon: m.meetingStatus === 'completed' ? <CheckCircle2 size={14} /> : <Activity size={14} />,
          ip: "192.168.1.1",
          risk: m.meetingStatus === 'completed' ? "MED" : "LOW"
        })),
        ...users.filter(u => u.role === 'attendee').map(u => ({
          timestamp: new Date(u.createdAt || Date.now()).toLocaleString(),
          rawTime: new Date(u.createdAt || Date.now()),
          role: "USER",
          event: `User "${u.name}" registered`,
          eventIcon: <UserPlus size={14} />,
          ip: "DYNAMIC",
          risk: "LOW"
        }))
      ].sort((a, b) => b.rawTime - a.rawTime);

      setAllActivities(logs);
      setFilteredActivities(logs);
    } catch (err) {
      console.error("Failed to fetch activity logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const filtered = allActivities.filter(act => 
      act.event.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.role.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredActivities(filtered);
    setCurrentPage(1);
  }, [searchQuery, allActivities]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredActivities.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage) || 1;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3 text-slate-400">
        <Loader2 size={32} className="animate-spin text-primary" />
        <span className="text-xs font-bold uppercase tracking-widest italic">Syncing System Logs...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sidebar/10">
      <div className="p-4 md:p-8 pb-0 mt-4 lg:mt-0 shadow-sm border-b border-border/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mb-3">
              <span>Security</span>
              <ChevronRight size={12} className="shrink-0" />
              <span className="text-primary font-bold">System Intelligence</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-charcoal tracking-tight">
              System Audit Logs
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1 font-medium italic">
              Real-time synchronization with platform infrastructure events.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button 
              onClick={fetchData}
              className="px-6 py-2.5 text-xs font-bold text-white bg-charcoal rounded hover:opacity-95 transition-all shadow-lg uppercase tracking-widest flex items-center justify-center gap-2"
            >
              <RefreshCcw size={16} />
              Sync Live
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-8 pt-6 md:pt-8">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-8">
          <div className="relative flex-1 shadow-sm">
            <Search size={18} className="text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by event, role or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-border rounded-lg bg-white/80 backdrop-blur-sm text-charcoal placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
          </div>
        </div>

        <div className="bg-white border border-border rounded-xl overflow-hidden mb-8 shadow-lg border-opacity-50">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-border">
                  <th className="px-6 py-4 text-left text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500">Timestamp</th>
                  <th className="px-6 py-4 text-left text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500">User Role</th>
                  <th className="px-6 py-4 text-left text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500">Event Type</th>
                  <th className="px-6 py-4 text-left text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500">IP Address</th>
                  <th className="px-6 py-4 text-left text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500">Risk Assessment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {currentItems.length > 0 ? (
                  currentItems.map((log, index) => {
                    const risk = riskConfig[log.risk] || riskConfig.LOW;
                    return (
                      <tr key={index} className="hover:bg-sidebar/20 transition-colors">
                        <td className="px-6 py-4 text-[12px] font-mono text-slate-600 whitespace-nowrap">{log.timestamp}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="bg-sidebar px-2.5 py-1 border border-border font-mono text-[9px] font-bold text-charcoal rounded uppercase">{log.role}</span>
                        </td>
                        <td className="px-6 py-4 text-[13px] font-semibold text-charcoal whitespace-nowrap">
                          <span className="inline-flex items-center gap-2">
                            <span className="text-slate-400">{log.eventIcon}</span>
                            {log.event}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[12px] font-mono text-slate-400 whitespace-nowrap">{log.ip}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${risk.dotColor}`} />
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${risk.textClass}`}>{log.risk}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center text-slate-400 italic">No system audit records identified in current buffer.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-slate-500 uppercase">Operational</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm" />
              <span className="text-[10px] font-bold text-slate-500 uppercase">Live Feed Active</span>
            </div>
          </div>
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalResults={filteredActivities.length}
            label="events"
          />
        </div>
      </div>
    </div>
  );
};

export default RecentActivity;
