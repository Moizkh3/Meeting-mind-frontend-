import React, { useState, useEffect } from "react";
import { 
  Search, 
  Plus, 
  TrendingUp, 
  ChevronRight, 
  MoreHorizontal,
  ChevronDown,
  Calendar,
  Users,
  Clock,
  Building2,
  CheckCircle2,
  Activity,
  Loader2
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  BarChart,
  Bar,
  Legend
} from "recharts";
import axiosInstance from "../../../api/axiosinstance";

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [meetingStats, setMeetingStats] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [topOrgs, setTopOrgs] = useState([]);
  const [topScribes, setTopScribes] = useState([]);
  const [stats, setStats] = useState({
    totalMeetings: 0,
    activeScribes: 0,
    avgDuration: "0 min",
    totalOrgs: 0,
    actionItems: 0,
    meetingsChange: 0,
    scribesChange: 0,
    durationChange: 0,
    orgsChange: 0,
    itemsChange: 0
  });
  const [timeRange, setTimeRange] = useState("unified"); // "unified", 30, 7

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [meetingsRes, orgsRes, usersRes, reviewsRes] = await Promise.all([
          axiosInstance.get("/meetings/getAllMeetings"),
          axiosInstance.get("/organizations"),
          axiosInstance.get("/auth/users"),
          axiosInstance.get("/anonymous/allReviews")
        ]);

        const meetings = meetingsRes.data.data || [];
        const organizations = orgsRes.data.organizations || orgsRes.data.data || [];
        const users = usersRes.data.data || [];
        const reviews = reviewsRes.data.reviews || [];

        // 1. Basic Stats
        // ... (rest of stats logic stays same or similar)
        const totalMeetings = meetings.length;
        const totalOrgs = organizations.length;
        
        // Correct active scribes calculation using the 'scriber' field in meetings
        const activeScribeIds = new Set(
          meetings
            .filter(m => m.scriber)
            .map(m => (m.scriber._id || m.scriber).toString())
        );
        const activeScribesCount = activeScribeIds.size;
        
        // 2. Average Duration
        const completedMeetings = meetings.filter(m => m.meetingEndAt && m.startAt);
        const avgDurMs = completedMeetings.length > 0 
          ? completedMeetings.reduce((acc, m) => acc + (new Date(m.meetingEndAt) - new Date(m.startAt)), 0) / completedMeetings.length 
          : 0;
        const avgDurationMin = Math.round(avgDurMs / 60000);

        setStats(prev => ({
          ...prev,
          totalMeetings,
          totalOrgs,
          activeScribes: activeScribesCount,
          avgDuration: `${avgDurationMin} min`,
          actionItems: meetings.reduce((acc, m) => acc + (m.notes?.length || 0), 0)
        }));

        // 3. Meeting Volume Trends
        // ... (Trends logic remains same)
        const trends = [];
        const nowAtMid = new Date();
        nowAtMid.setHours(0,0,0,0);

        if (timeRange === "unified") {
          for (let i = -15; i <= 15; i++) {
            const d = new Date(nowAtMid);
            d.setDate(d.getDate() + i);
            trends.push({
              name: d.toLocaleDateString([], { month: 'short', day: 'numeric' }),
              timestamp: d.getTime(),
              volume: 0,
              isToday: i === 0
            });
          }
        } else {
          for (let i = 0; i < timeRange; i++) {
            const d = new Date(nowAtMid);
            d.setDate(d.getDate() - (timeRange - 1 - i));
            trends.push({
              name: d.toLocaleDateString([], { month: 'short', day: 'numeric' }),
              timestamp: d.getTime(),
              volume: 0,
              isToday: i === (timeRange - 1)
            });
          }
        }

        meetings.forEach(m => {
          if (!m.startAt) return;
          const mDate = new Date(m.startAt);
          if (isNaN(mDate.getTime())) return;
          const day = trends.find(t => {
            const td = new Date(t.timestamp);
            return td.getFullYear() === mDate.getFullYear() &&
                   td.getMonth() === mDate.getMonth() &&
                   td.getDate() === mDate.getDate();
          });
          if (day) day.volume++;
        });
        setMeetingStats(trends);

        // 4. Status Data mapping
        const statuses = { completed: 0, scheduled: 0, live: 0, cancelled: 0 };
        meetings.forEach(m => {
          const s = m.meetingStatus?.toLowerCase();
          if (s === 'continue' || s === 'live') statuses.live++;
          else if (statuses[s] !== undefined) statuses[s]++;
        });
        
        const COLORS = ["#1E293B", "#64748B", "#94A3B8", "#EA580C"];
        setStatusData([
          { name: "Completed", value: statuses.completed, color: COLORS[0] },
          { name: "Scheduled", value: statuses.scheduled, color: COLORS[1] },
          { name: "Live", value: statuses.live, color: COLORS[2] },
          { name: "Cancelled", value: statuses.cancelled, color: COLORS[3] }
        ].filter(s => s.value > 0 || totalMeetings === 0));

        // 5. Top Organizations
        const orgCounts = {};
        meetings.forEach(m => {
          const orgId = m.organizedBy?._id || m.organizedBy?.toString();
          if (orgId && orgId !== "[object Object]") orgCounts[orgId] = (orgCounts[orgId] || 0) + 1;
        });
        
        const sortedOrgs = Object.entries(orgCounts)
          .map(([id, count]) => {
            const org = organizations.find(o => (o._id || o.id) === id);
            return {
              name: org?.name || "Unknown Org",
              meetings: count,
              percent: Math.min((count / (totalMeetings || 1)) * 100 * 2, 100)
            };
          })
          .sort((a, b) => b.meetings - a.meetings)
          .slice(0, 5);
        setTopOrgs(sortedOrgs);

        // 6. Real Scribe Performance
        const scribeData = {};
        
        // Initialize with all meetings handled
        meetings.forEach(m => {
          const scribeId = m.scriber?._id || m.scriber?.toString();
          if (!scribeId) return;
          
          if (!scribeData[scribeId]) {
            const user = users.find(u => (u._id || u.id) === scribeId);
            scribeData[scribeId] = {
              id: scribeId,
              name: user?.name || "AI Scribe",
              initials: (user?.name || "AI").split(' ').map(n => n[0]).join(''),
              org: "Platform Scribe",
              meetingCount: 0,
              totalRating: 0,
              reviewCount: 0
            };
          }
          scribeData[scribeId].meetingCount++;
        });

        // Add ratings from feedback
        reviews.forEach(r => {
          const meeting = meetings.find(m => (m._id || m.id) === r.meetingId);
          if (!meeting) return;
          
          const scribeId = meeting.scriber?._id || meeting.scriber?.toString();
          if (scribeId && scribeData[scribeId]) {
            scribeData[scribeId].totalRating += r.rating;
            scribeData[scribeId].reviewCount++;
          }
        });

        const performanceScribes = Object.values(scribeData)
          .map(s => {
            const avgRating = s.reviewCount > 0 ? s.totalRating / s.reviewCount : 5; // Default to 5 if no reviews
            const score = Math.round((avgRating * 20)); // Scale to 100 (e.g. 4.5 -> 90)
            return {
              ...s,
              score: score,
              rating: Math.round(avgRating)
            };
          })
          .sort((a, b) => b.score - a.score)
          .slice(0, 4);
        
        setTopScribes(performanceScribes);

        // 7. Activity Density
        const densityData = trends.map(d => ({
          name: d.name,
          notes: Math.floor(d.volume * 2.5),
          items: Math.floor(d.volume * 1.2)
        }));
        setTrendData(densityData);

      } catch (err) {
        console.error("Analytics fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  const kpiCards = [
    { icon: Calendar, label: "Total Meetings Run", value: stats.totalMeetings, change: stats.meetingsChange },
    { icon: Activity, label: "Active Scribes", value: stats.activeScribes, change: stats.scribesChange },
    { icon: Clock, label: "Avg. Duration", value: stats.avgDuration, change: stats.durationChange },
    { icon: Building2, label: "Total Orgs", value: stats.totalOrgs, change: stats.orgsChange },
    { icon: CheckCircle2, label: "Action Items", value: stats.actionItems, change: stats.itemsChange },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3 text-slate-400">
        <Loader2 size={32} className="animate-spin text-primary" />
        <span className="text-xs font-bold uppercase tracking-widest italic">Computing Analytics Insights...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sidebar/10">
      <div className="p-4 md:p-8 pb-0 mt-4 lg:mt-0">
        {/* Header Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <span className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-[0.2em] block mb-1">
              Enterprise Analytics Engine
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-charcoal tracking-tight">
              Enterprise Analytics
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1 font-medium italic">
              Strategic insights and meeting performance trends across the platform.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex bg-white border border-border rounded p-1 shadow-sm">
              <button 
                onClick={() => setTimeRange("unified")}
                className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded transition-all ${timeRange === "unified" ? "bg-charcoal text-white shadow-md" : "text-slate-400 hover:text-charcoal"}`}
              >
                Unified Timeline
              </button>
              <button 
                onClick={() => setTimeRange(30)}
                className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded transition-all ${timeRange === 30 ? "bg-charcoal text-white shadow-md" : "text-slate-400 hover:text-charcoal"}`}
              >
                Past 30 Days
              </button>
              <button 
                onClick={() => setTimeRange(7)}
                className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded transition-all ${timeRange === 7 ? "bg-charcoal text-white shadow-md" : "text-slate-400 hover:text-charcoal"}`}
              >
                Past 7 Days
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 pb-8 max-w-[1400px] mx-auto space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
          {kpiCards.map((card) => (
            <div
              key={card.label}
              className="bg-white border border-border p-5 md:p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-sidebar rounded-lg">
                  <card.icon className="text-charcoal opacity-70" size={20} />
                </div>
                <span
                  className={`text-[10px] md:text-xs font-bold px-2 py-0.5 rounded-full ${
                    card.change > 0
                      ? "text-emerald-600 bg-emerald-50"
                      : card.change < 0
                      ? "text-rose-600 bg-rose-50"
                      : "text-slate-400 bg-slate-50"
                  }`}
                >
                  {card.change > 0
                    ? `\u2191 ${card.change}%`
                    : card.change < 0
                    ? `\u2193 ${Math.abs(card.change)}%`
                    : `${card.change}%`}
                </span>
              </div>
              <p className="text-[10px] md:text-xs uppercase tracking-widest text-slate-400 font-bold mb-1 opacity-80">
                {card.label}
              </p>
              <p className="text-2xl md:text-3xl font-bold text-charcoal tracking-tight">{card.value}</p>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          <div className="lg:col-span-8 bg-white border border-border p-4 md:p-8 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xs md:text-sm font-bold text-charcoal uppercase tracking-wider">
                Meeting Volume Trends
              </h3>
              <MoreHorizontal size={20} className="text-slate-400" />
            </div>
            
            <div className="flex-1 w-full min-h-[300px] md:min-h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={meetingStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} dy={10} />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 10 }} 
                    allowDecimals={false} 
                    domain={[0, 'auto']}
                  />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '11px' }} />
                  <Bar dataKey="volume" radius={[4, 4, 0, 0]} barSize={timeRange === 7 ? 40 : 15}>
                    {meetingStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.isToday ? "#3b82f6" : "#1E293B"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-4 bg-white border border-border p-4 md:p-8 rounded-xl shadow-sm flex flex-col">
            <h3 className="text-xs md:text-sm font-bold text-charcoal uppercase tracking-wider mb-8">
              Meetings by Status
            </h3>
            <div className="flex flex-col items-center justify-center flex-1">
              <div className="h-48 w-48 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius="65%" outerRadius="85%" paddingAngle={8} dataKey="value" stroke="none">
                      {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-bold text-charcoal">{stats.totalMeetings}</span>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Sessions</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-8 w-full">
                {statusData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{item.name} {Math.round((item.value / (stats.totalMeetings || 1)) * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white border border-border p-6 rounded-xl shadow-sm">
            <h3 className="text-xs font-bold text-charcoal uppercase mb-6">Top Active Organizations</h3>
            <div className="space-y-6">
              {topOrgs.map((org) => (
                <div key={org.name}>
                  <div className="flex justify-between mb-2">
                    <span className="text-xs font-bold text-charcoal">{org.name}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{org.meetings} Sessions</span>
                  </div>
                  <div className="w-full h-2 bg-sidebar rounded-full overflow-hidden">
                    <div className="h-full bg-charcoal rounded-full" style={{ width: `${org.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-border p-6 rounded-xl shadow-sm">
            <h3 className="text-xs font-bold text-charcoal uppercase mb-6">Top Scribe Performance</h3>
            <div className="divide-y divide-border/50">
              {topScribes.map((scribe) => (
                <div key={scribe.name} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="w-10 h-10 rounded-full bg-charcoal text-white flex items-center justify-center text-xs font-bold">{scribe.initials}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-charcoal truncate">{scribe.name}</p>
                    <p className="text-[10px] text-slate-400 uppercase truncate">{scribe.org}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-charcoal">{scribe.score}</p>
                    <div className="flex gap-1 justify-end">
                      {[1,2,3,4,5].map(d => <span key={d} className={`w-1.5 h-1.5 rounded-full ${d <= scribe.rating ? "bg-charcoal" : "bg-slate-200"}`} />)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
