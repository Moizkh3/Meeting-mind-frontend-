import React, { useState } from "react";
import { 
  ChevronRight, 
  Users, 
  Zap, 
  Clock, 
  Search, 
  UserPlus, 
  Eye, 
  Edit2, 
  Ban 
} from "lucide-react";
import AttendeePicker from "../../../components/common/AttendeePicker";
import Pagination from "../../../components/common/Pagination";

const statusStyles = {
  ACTIVE: "border-emerald-500 text-emerald-600 bg-emerald-50",
  PENDING: "border-amber-400 text-amber-600 bg-amber-50",
  INACTIVE: "border-slate-300 text-slate-400 bg-slate-50",
};

function QualityDots({ rating }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`w-2 h-2 rounded-full ${
            i <= rating ? "bg-charcoal" : "bg-slate-200"
          }`}
        />
      ))}
    </div>
  );
}

const Scribes = () => {
  const [scribesData, setScribesData] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0
  });
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(stats.total / 10) || 1;
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const handlePromoteAttendee = (attendee) => {
    console.log("Promoted attendee to scribe:", attendee);
    setIsPickerOpen(false);
  };

  return (
    <div>
      <AttendeePicker 
        isOpen={isPickerOpen} 
        onClose={() => setIsPickerOpen(false)} 
        onAssign={handlePromoteAttendee}
        title="Promote Attendee to Scribe"
      />
      <div className="p-4 md:p-8 pb-0 mt-4 lg:mt-0 shadow-sm border-b border-border/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mb-3">
              <span>Personnel</span>
              <ChevronRight size={12} className="shrink-0" />
              <span className="text-primary font-bold">Scribes Registry</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-charcoal tracking-tight">
              Scribe Registry
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1 font-medium">
              Manage platform personnel and monitor scribe performance metrics.
            </p>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto">
            <span className="px-4 py-2 bg-charcoal text-white text-[10px] font-bold rounded-sm uppercase tracking-[0.2em] shadow-lg whitespace-nowrap">
              System Controller
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-8 pt-6 md:pt-8 bg-sidebar/10 min-h-screen">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="uppercase text-[10px] font-bold tracking-widest text-slate-500 opacity-70">
                Total Scribes
              </span>
              <Users size={18} className="text-slate-400" />
            </div>
            <span className="text-3xl font-bold text-charcoal tracking-tight">{stats.total}</span>
          </div>

          <div className="bg-white border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="uppercase text-[10px] font-bold tracking-widest text-slate-500 opacity-70">
                  Active Now
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              </div>
              <Zap size={18} className="text-slate-400" />
            </div>
            <span className="text-3xl font-bold text-charcoal tracking-tight">{stats.active}</span>
          </div>

          <div className="bg-white border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="uppercase text-[10px] font-bold tracking-widest text-slate-500 opacity-70">
                  Pending Approval
                </span>
                <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
              </div>
              <Clock size={18} className="text-slate-400" />
            </div>
            <span className="text-3xl font-bold text-charcoal tracking-tight">{stats.pending}</span>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-8">
          <div className="relative flex-1 max-w-none lg:max-w-sm shadow-sm">
            <Search size={18} className="text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2.5 border border-border rounded text-sm text-charcoal placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary/20 bg-white/80 backdrop-blur-sm"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select className="flex-1 lg:flex-none border border-border rounded px-3 py-2.5 text-sm text-slate-600 focus:outline-none focus:ring-1 focus:ring-primary/20 bg-white/80 shadow-sm">
              <option>Organization</option>
            </select>
            <select className="flex-1 lg:flex-none border border-border rounded px-3 py-2.5 text-sm text-slate-600 focus:outline-none focus:ring-1 focus:ring-primary/20 bg-white/80 shadow-sm">
              <option>Status</option>
            </select>
            <button 
              onClick={() => setIsPickerOpen(true)}
              className="w-full lg:w-auto flex items-center justify-center gap-2 bg-charcoal text-white px-6 py-2.5 rounded text-[11px] font-bold hover:opacity-90 transition-all whitespace-nowrap uppercase tracking-widest shadow-md"
            >
              <UserPlus size={16} />
              Promote Attendee
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white border border-border rounded-xl overflow-hidden mb-8 shadow-lg border-opacity-50">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-border">
                  <th className="w-12 px-6 py-4 text-left">
                    <input type="checkbox" className="rounded border-slate-300" />
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500 whitespace-nowrap">
                    Full Name
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500 whitespace-nowrap">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500 whitespace-nowrap">
                    Organization
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500 whitespace-nowrap">
                    Meetings
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500 whitespace-nowrap">
                    Notes Quality
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500 whitespace-nowrap">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500 whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {scribesData.length > 0 ? (
                  scribesData.map((scribe, index) => (
                    <tr
                      key={index}
                      className="hover:bg-sidebar/20 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="rounded border-slate-300"
                        />
                      </td>
                      <td className="px-6 py-4 font-bold text-charcoal whitespace-nowrap">
                        {scribe.name}
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-medium whitespace-nowrap">{scribe.email}</td>
                      <td className="px-6 py-4 text-slate-600 font-medium whitespace-nowrap">
                        {scribe.organization}
                      </td>
                      <td className="px-6 py-4 text-charcoal font-bold whitespace-nowrap">{scribe.meetings}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <QualityDots rating={scribe.quality} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border rounded-full ${
                            statusStyles[scribe.status]
                          }`}
                        >
                          {scribe.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm text-slate-500 hover:text-primary transition-all duration-200 border border-transparent hover:border-border">
                            <Eye size={18} />
                          </button>
                          <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm text-slate-500 hover:text-primary transition-all duration-200 border border-transparent hover:border-border">
                            <Edit2 size={18} />
                          </button>
                          <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-rose-50 hover:shadow-sm text-slate-400 hover:text-rose-500 transition-all duration-200 border border-transparent hover:border-rose-100">
                            <Ban size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-16 text-center text-slate-400 italic font-medium">
                      No matching scribe records identified.
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
          totalResults={stats.total}
          label="scribes"
        />
      </div>
    </div>
  );
};

export default Scribes;
