import React, { useState, useEffect } from "react";
import Cards from "./Cards";
import ActiveSessions from "./ActiveSessions";
import Analytics from "./Analytics";
import MeetingDistribution from "./MeetingDistribution";
import RecentActivity from "./RecentActivity";
import { FileDown, Loader2, LayoutGrid, Calendar as CalendarIcon, Filter } from "lucide-react";
import axiosInstance from "../../../api/axiosinstance";

const OrganizationDashboard = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const response = await axiosInstance.get("/meetings/getAllMeetings");
        setMeetings(response.data.data || []);
      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMeetings();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-primary" size={32} />
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Compiling Intelligence...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100/50 p-4 md:p-8 space-y-6 md:space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">
            <LayoutGrid size={14} />
            <span>Organization</span>
            <span>&bull;</span>
            <span className="text-primary">Master Dashboard</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#2c3a4f] tracking-tight">
            Enterprise Overview
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Monitoring {meetings.length} sessions across your organization</p>
        </div>

        <div className="flex items-center gap-3">
           <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#e2e7ef] rounded text-[11px] font-bold text-[#4a6071] uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
            <Filter size={14} />
            Filter View
          </button>
           <button className="flex items-center gap-2 px-4 py-2.5 bg-[#2c3a4f] text-white rounded text-[11px] font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-md">
            <FileDown size={14} />
            Intelligence Report
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <Cards meetings={meetings} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2">
          <Analytics meetings={meetings} />
        </div>
        <div className="lg:col-span-1">
          <MeetingDistribution meetings={meetings} />
        </div>
      </div>

      {/* Today's Sessions - Full Width */}
      <div className="w-full">
        <ActiveSessions meetings={meetings} />
      </div>

      {/* Recent Activity - Full Width */}
      <div className="w-full">
        <RecentActivity meetings={meetings} />
      </div>
    </div>
  );
};

export default OrganizationDashboard;