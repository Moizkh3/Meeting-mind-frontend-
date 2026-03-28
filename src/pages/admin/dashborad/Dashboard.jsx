import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Search, 
  Plus, 
  TrendingUp, 
  PlusCircle, 
  CheckCheck, 
  AlertCircle, 
  UserPlus, 
  FileText,
  Activity,
  Calendar,
  Layers,
  Building2,
  Video,
  Users
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from "recharts";
import axiosInstance from "../../../api/axiosinstance";

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [orgStats, setOrgStats] = useState([]);
  const [stats, setStats] = useState({
    totalOrganizations: 0,
    activeMeetings: 0,
    totalAttendees: 0,
    generatedReports: 0
  });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartView, setChartView] = useState('weekly'); // 'weekly' or 'monthly'

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        axiosInstance.get("/organizations"),
        axiosInstance.get("/meetings/getAllMeetings"),
        axiosInstance.get("/auth/users")
      ]);

      // Extract results with fallback to empty arrays
      const orgsRes = results[0];
      const meetingsRes = results[1];
      const usersRes = results[2];

      // Backend response formats: 
      // Organizations: { success, organizations: [...] }
      // Meetings: { success, data: [...] }
      // Users: { success, data: [...] }
      
      const orgs = orgsRes.status === 'fulfilled' ? 
        (orgsRes.value.data?.organizations || orgsRes.value.data?.data || []) : [];
      
      const meetings = meetingsRes.status === 'fulfilled' ? (meetingsRes.value.data?.data || []) : [];
      const users = usersRes.status === 'fulfilled' ? (usersRes.value.data?.data || []) : [];

      const attendeesCount = users.filter(u => u.role === 'attendee').length;
      const now = new Date();
      // Assuming 'meetings' array contains objects with 'status' and 'startAt' (or similar for rawDate)
      // For the purpose of this edit, 'meetings' is used as 'mapped'
      const mapped = meetings.map(m => ({
        ...m,
        rawDate: m.startAt, // Assuming 'startAt' is the date field for meetings
        status: m.status || "Scheduled" // Assuming 'status' field exists or default
      }));

      setStats({
        totalOrganizations: orgs.length,
        activeMeetings: meetings.length,
        totalAttendees: attendeesCount,
        scheduledToday: mapped.filter(m => {
          const start = new Date(m.rawDate);
          return start.getDate() === now.getDate() &&
                 start.getMonth() === now.getMonth() &&
                 start.getFullYear() === now.getFullYear();
        }).length
      });

      // Map recent activities with actual data
      const allActivities = [
        ...(orgs || []).map(org => ({
          text: `New organization "${org.name}" joined the platform.`,
          time: new Date(org.createdAt || Date.now()),
          displayTime: new Date(org.createdAt || Date.now()).toLocaleDateString(),
          icon: Building2,
          type: 'org'
        })),
        ...(meetings || []).map(m => ({
          text: `Meeting "${m.agenda || 'Untitled'}" scheduled.`,
          time: new Date(m.createdAt || m.startAt || Date.now()),
          displayTime: new Date(m.createdAt || m.startAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          icon: Activity,
          type: 'meeting'
        })),
        ...(users || []).filter(u => u.role === 'attendee').slice(0, 10).map(u => ({
          text: `Individual user "${u.name}" registered.`,
          time: new Date(u.createdAt || Date.now()),
          displayTime: "Just now",
          icon: UserPlus,
          type: 'user'
        }))
      ]
      .filter(act => !isNaN(act.time.getTime())) // Remove invalid dates
      .sort((a, b) => b.time - a.time)
      .slice(0, 8);
      
      setActivities(allActivities);

      // Generate meeting trends based on view
      const days = chartView === 'weekly' ? 7 : 30;
      const trends = [...Array(days)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (days - 1 - i));
        d.setHours(0, 0, 0, 0);
        return {
          date: chartView === 'weekly' ? d.toLocaleDateString([], { weekday: 'short' }) : d.toLocaleDateString([], { month: 'short', day: 'numeric' }),
          timestamp: d.getTime(),
          count: 0
        };
      });

      const previousTrends = [...Array(days)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (days * 2 - 1 - i));
        d.setHours(0, 0, 0, 0);
        return { timestamp: d.getTime(), count: 0 };
      });

      (meetings || []).forEach(m => {
        if (!m.startAt) return;
        const mDate = new Date(m.startAt);
        if (isNaN(mDate.getTime())) return;
        mDate.setHours(0, 0, 0, 0);
        const mTimestamp = mDate.getTime();
        
        const dayIdx = trends.findIndex(day => day.timestamp === mTimestamp);
        if (dayIdx !== -1) {
          trends[dayIdx].count++;
        } else {
          const prevIdx = previousTrends.findIndex(day => day.timestamp === mTimestamp);
          if (prevIdx !== -1) previousTrends[prevIdx].count++;
        }
      });

      const currentTotal = trends.reduce((acc, curr) => acc + curr.count, 0);
      const previousTotal = previousTrends.reduce((acc, curr) => acc + curr.count, 0);
      const growthVal = previousTotal === 0 ? (currentTotal > 0 ? 100 : 0) : Math.round(((currentTotal - previousTotal) / previousTotal) * 100);

      setStats({
        totalOrganizations: orgs.length,
        activeMeetings: meetings.length,
        totalAttendees: attendeesCount,
        growth: growthVal >= 0 ? `+${growthVal}%` : `${growthVal}%`,
        isGrowthPositive: growthVal >= 0,
        scheduledToday: mapped.filter(m => {
          const start = new Date(m.rawDate);
          return start.getDate() === now.getDate() &&
                 start.getMonth() === now.getMonth() &&
                 start.getFullYear() === now.getFullYear();
        }).length
      });

      // Calculate Org Distribution for second chart
      const orgCounts = {};
      meetings.forEach(m => {
        const orgName = m.organizedBy?.name || 'Global Platform';
        orgCounts[orgName] = (orgCounts[orgName] || 0) + 1;
      });

      const formattedOrgStats = Object.keys(orgCounts).map(name => ({
        name: name.length > 15 ? name.substring(0, 12) + '...' : name,
        value: orgCounts[name]
      })).sort((a, b) => b.value - a.value).slice(0, 5);

      setOrgStats(formattedOrgStats);
      setData(trends.map(d => ({ name: d.date, sessions: d.count })));

    } catch (err) {
      console.error("Dashboard critical load error:", err);
      setData([]);
      setOrgStats([]);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchDashboardData();
  }, [chartView]);

  return (
    <>
      <div className="p-4 md:p-8 pb-0 mt-4 lg:mt-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-charcoal tracking-tight">
              Global Master Dashboard
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1 italic font-medium">
              Global meeting activity, organization trends, and scribe performance oversight.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search platform activity..."
                className="pl-9 pr-4 py-2 bg-white border border-border rounded text-sm w-full md:w-64 focus:outline-none focus:ring-1 focus:ring-primary/20 placeholder:text-slate-400 font-medium shadow-sm transition-all focus:bg-white"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 pb-8 max-w-[1400px] mx-auto space-y-8">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Total Organizations */}
          <div className="group relative flex items-center gap-5 p-6 bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 group-hover:scale-110 transition-transform duration-300">
              <Building2 size={24} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                Total Organizations
              </p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                  {stats.totalOrganizations}
                </h3>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${stats.isGrowthPositive ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
                  {stats.growth || '+0%'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Active Meetings */}
          <div className="group relative flex items-center gap-5 p-6 bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 group-hover:scale-110 transition-transform duration-300">
              <Video size={24} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                Active Meetings
              </p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                  {stats.activeMeetings}
                </h3>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${stats.isGrowthPositive ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
                  {stats.growth || '+0%'}
                </span>
              </div>
            </div>
          </div>

          {/* Global Attendees */}
          <div className="group relative flex items-center gap-5 p-6 bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 group-hover:scale-110 transition-transform duration-300">
              <Users size={24} className="text-amber-600" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                Global Attendees
              </p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                  {stats.totalAttendees}
                </h3>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded-full">
                  Users
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Platform Growth Chart */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs md:text-sm font-semibold text-charcoal uppercase tracking-wider">
                Platform Growth
              </h4>
              <div className="flex gap-2">
                <button 
                  onClick={() => setChartView('monthly')}
                  className={`px-2 md:px-3 py-1 text-[10px] md:text-xs font-medium rounded border border-border shadow-sm transition-all ${chartView === 'monthly' ? 'bg-sidebar text-charcoal' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Monthly
                </button>
                <button 
                  onClick={() => setChartView('weekly')}
                  className={`px-2 md:px-3 py-1 text-[10px] md:text-xs font-medium rounded border border-border shadow-sm transition-all ${chartView === 'weekly' ? 'bg-sidebar text-charcoal' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Weekly
                </button>
              </div>
            </div>
            <div className="p-4 md:p-8 border border-border rounded bg-white shadow-sm">
              <div className="flex items-baseline gap-4 mb-4 md:mb-8">
                <span className="text-3xl md:text-4xl font-bold text-charcoal">
                  {data.reduce((acc, curr) => acc + curr.sessions, 0)}
                </span>
                <div className="flex items-center gap-1.5 text-slate-400 font-medium text-xs md:text-sm">
                  <TrendingUp size={16} />
                  Total Sessions ({chartView === 'weekly' ? '7 Days' : '30 Days'})
                </div>
              </div>
              
              <div className="h-64 w-full pr-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPlatformGrowth" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1E293B" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#1E293B" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 500 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 500 }} 
                      allowDecimals={false}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '8px', 
                        border: 'none', 
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                        fontSize: '11px'
                      }} 
                    />
                    <Area 
                      type="monotone"
                      dataKey="sessions" 
                      stroke="#1E293B" 
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorPlatformGrowth)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Right Column: Recent Activity Feed */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs md:text-sm font-semibold text-charcoal uppercase tracking-wider">
                Recent Activity
              </h4>
              <Link to="/admin/recent-activity" className="text-[10px] md:text-xs font-medium text-primary hover:underline uppercase tracking-wide">
                View All
              </Link>
            </div>
            <div className="border border-border rounded bg-white overflow-hidden shadow-sm">
              <div className="divide-y divide-border">
                {activities && activities.length > 0 ? (
                  activities.map((activity, index) => (
                    <div key={index} className="p-3 md:p-4 hover:bg-sidebar/50 transition-colors">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                          {activity.icon ? <activity.icon className="text-slate-500" size={14} /> : <PlusCircle className="text-slate-500" size={14} />}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <p className="text-xs md:text-sm text-charcoal">
                            {activity.text}
                          </p>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                            {activity.displayTime}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center bg-white">
                    <p className="text-[11px] text-slate-400 italic">No recent activity detected.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Intelligence Insights Card */}
            <div className="p-5 bg-white border border-border rounded flex flex-col gap-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-charcoal uppercase tracking-tighter">
                  Platform Insights
                </span>
                <Activity className="text-slate-400" size={16} />
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed font-medium italic">
                Platform insights will appear here as activity increases.
              </p>
              <button className="text-[10px] font-bold text-charcoal uppercase tracking-widest hover:underline text-left">
                View Detailed Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// (removed export default Dashboard; as it is now on the function itself)
