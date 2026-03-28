import { useState, useEffect } from 'react'
import {
  Users,
  Clock,
  CheckCircle2,
  Calendar,
  Loader2,
  Menu
} from 'lucide-react'
import { getAllMeetings } from '../../../api/meetings'
import { useAuth } from '../../../context/AuthContext'
import { useOutletContext, Link } from 'react-router-dom'
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
} from 'recharts'

const formatDashboardTime = (dateString) => {
  const date = new Date(dateString);
  return {
    time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }).split(' ')[0].replace(/^0/, ''),
    period: date.toLocaleTimeString('en-US', { hour12: true }).split(' ')[1]
  };
};

  const isMeetingActive = (startAt) => {
    const now = new Date();
    const meetingTime = new Date(startAt);
    const diff = now - meetingTime;
    return diff >= 0 && diff < 3600000;
  };

const formatTodayDate = () => {
  const now = new Date();
  return now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
};

const Dashboard = () => {
  const { user } = useAuth()
  const { toggleNav } = useOutletContext() || {}
  const [meetings, setMeetings] = useState([])
  const [allMeetings, setAllMeetings] = useState([])
  const [loading, setLoading] = useState(true)
  const [chartFilter, setChartFilter] = useState('All') // 'All', 'Last Month', 'Last Week'

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const response = await getAllMeetings();
        if (response.success) {
          const data = response.data || [];
          setAllMeetings(data);

          const sorted = data
            .filter(m => new Date(m.startAt) > new Date() || isMeetingActive(m.startAt))
            .sort((a, b) => new Date(a.startAt) - new Date(b.startAt));
          setMeetings(sorted.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to fetch dashboard meetings', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMeetings();
  }, []);

  // Compute KPIs from real data
  const totalMeetings = allMeetings.length;
  const completedMeetings = allMeetings.filter(m => m.meetingStatus === 'completed').length;
  const scheduledMeetings = allMeetings.filter(m => m.meetingStatus === 'scheduled').length;
  const upcomingCount = allMeetings.filter(m => new Date(m.startAt) > new Date()).length;

  const kpiData = [
    {
      label: 'Total Meetings',
      value: totalMeetings,
      icon: Users,
    },
    {
      label: 'Completed',
      value: completedMeetings,
      icon: CheckCircle2,
    },
    {
      label: 'Scheduled',
      value: scheduledMeetings,
      icon: Calendar,
    },
    {
      label: 'Upcoming',
      value: upcomingCount,
      icon: Clock,
    },
  ]

  // Compute meeting distribution based on chart filter
  const computeChartData = () => {
    if (allMeetings.length === 0) return [];

    const now = new Date();
    const sorted = [...allMeetings].sort((a, b) => new Date(a.startAt) - new Date(b.startAt));
    if (sorted.length === 0) return [];
    
    if (chartFilter === 'Last Week') {
      const daysMap = {};
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const key = `${dayNames[d.getDay()]} ${d.getDate()}`;
        daysMap[key] = { dateObj: new Date(d.setHours(0,0,0,0)), count: 0 };
      }
      
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      sevenDaysAgo.setHours(0,0,0,0);
      
      allMeetings.forEach(m => {
        const d = new Date(m.startAt);
        if (d >= sevenDaysAgo && d <= now) {
          const key = `${dayNames[d.getDay()]} ${d.getDate()}`;
          if (daysMap[key]) daysMap[key].count++;
        }
      });
      
      return Object.entries(daysMap).map(([name, ObjectVal]) => ({ name, value: ObjectVal.count }));
      
    } else if (chartFilter === 'Last Month') {
      // Create 4 weekly buckets representing the last 28 days approximately
      const weeksMap = { 'Week 1': 0, 'Week 2': 0, 'Week 3': 0, 'Week 4': 0 };
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 28);
      thirtyDaysAgo.setHours(0,0,0,0);
      
      allMeetings.forEach(m => {
        const d = new Date(m.startAt);
        if (d >= thirtyDaysAgo && d <= now) {
          const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
          if (diffDays <= 7) weeksMap['Week 4']++;
          else if (diffDays <= 14) weeksMap['Week 3']++;
          else if (diffDays <= 21) weeksMap['Week 2']++;
          else weeksMap['Week 1']++;
        }
      });
      
      return Object.entries(weeksMap).map(([name, value]) => ({ name, value }));

    } else {
      const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
      const monthMap = {};
      const firstDate = new Date(sorted[0].startAt);
      let current = new Date(firstDate.getFullYear(), firstDate.getMonth(), 1);
      
      while (current <= now) {
        const monthName = monthNames[current.getMonth()];
        const yearSuffix = current.getFullYear() !== now.getFullYear() ? ` '${current.getFullYear().toString().slice(-2)}` : '';
        const key = `${monthName}${yearSuffix}`;
        monthMap[key] = 0;
        current.setMonth(current.getMonth() + 1);
      }

      if (Object.keys(monthMap).length === 0) {
         const monthName = monthNames[now.getMonth()];
         monthMap[monthName] = 0;
      }

      allMeetings.forEach(m => {
        const date = new Date(m.startAt);
        const monthName = monthNames[date.getMonth()];
        const yearSuffix = date.getFullYear() !== now.getFullYear() ? ` '${date.getFullYear().toString().slice(-2)}` : '';
        const key = `${monthName}${yearSuffix}`;
        if (monthMap.hasOwnProperty(key)) {
          monthMap[key]++;
        } else {
          monthMap[key] = 1;
        }
      });

      return Object.entries(monthMap).map(([name, value]) => ({ name, value }));
    }
  };

  // Compute meeting status distribution for pie chart
  const totalCompleted = allMeetings.filter(m => m.meetingStatus === 'completed').length;
  const totalScheduled = allMeetings.filter(m => m.meetingStatus === 'scheduled').length;
  const totalLive = allMeetings.filter(m => isMeetingActive(m.startAt)).length;
  
  const statusData = [
    { name: 'Completed', value: totalCompleted, color: '#1E293B', percentage: totalMeetings > 0 ? Math.round((totalCompleted / totalMeetings) * 100) : 0 },
    { name: 'Scheduled', value: totalScheduled, color: '#64748b', percentage: totalMeetings > 0 ? Math.round((totalScheduled / totalMeetings) * 100) : 0 },
    { name: 'Live', value: totalLive, color: '#94a3b8', percentage: totalMeetings > 0 ? Math.round((totalLive / totalMeetings) * 100) : 0 },
  ].filter(s => s.value > 0 || s.name === 'Completed'); // Keep Completed even if 0 for layout consistency if needed, or filter.

  const weeklyData = computeChartData();

  return (
    <div className="flex flex-col min-h-screen bg-white">

      {/* Top Header Section */}
      <div className="p-4 md:p-10 pb-6">
        <div className="flex items-center gap-3 mb-2 md:mb-0">
          <button 
            onClick={toggleNav}
            className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-[#1a1c1e] tracking-tight">Attendee Activity Dashboard</h1>
        </div>
        <p className="text-slate-500 font-medium text-sm md:text-base mt-1 lg:pl-0 pl-1">Productivity overview for {formatTodayDate()}.</p>
      </div>

      {/* KPI Row */}
      <div className="px-4 md:px-10 mb-8 overflow-x-auto no-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {kpiData.map((kpi) => (
            <div key={kpi.label} className="bg-white border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-36 rounded-2xl">
              <div className="flex justify-between items-start">
                <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center">
                  <kpi.icon className="text-xl text-slate-600" size={20} />
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#1a1c1e] leading-none mb-1.5">{loading ? '...' : kpi.value}</div>
                <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">{kpi.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics Charts Section */}
      <div className="px-4 md:px-10 py-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Meetings Over Time - Area Chart (matching admin style) */}
        <div className="bg-white border border-slate-100 p-4 md:p-8 shadow-sm rounded-2xl hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-8 gap-4">
            <h3 className="text-[14px] font-bold text-[#1a1c1e]">Meeting Activity Over Time</h3>
            <select 
              value={chartFilter}
              onChange={e => setChartFilter(e.target.value)}
              className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-500 bg-slate-50 border border-slate-200 py-1.5 px-2 md:px-3 rounded-sm outline-none cursor-pointer hover:border-slate-300 transition-colors"
            >
              <option value="All">All Time</option>
              <option value="Last Month">Last Month</option>
              <option value="Last Week">Last Week</option>
            </select>
          </div>

          <div className="h-64 w-full pr-4">
            {weeklyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMeetings" x1="0" y1="0" x2="0" y2="1">
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
                    dataKey="value"
                    stroke="#1E293B"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorMeetings)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-slate-400 font-medium">No meeting data available yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Meeting Status Pie Chart */}
        <div className="bg-white border border-slate-100 p-4 md:p-8 shadow-sm relative rounded-2xl hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-[14px] font-bold text-[#1a1c1e]">Meeting Status Breakdown</h3>
          </div>

          <div className="flex flex-col items-center justify-around h-64">
            {statusData.length > 0 ? (
              <>
                <div className="relative w-48 h-48 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius="70%"
                        outerRadius="100%"
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                        startAngle={90}
                        endAngle={-270}
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-bold text-[#1a1c1e] leading-none">{totalMeetings}</span>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-[0.1em] mt-1">Total</span>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-4">
                  {statusData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <p className="text-[11px] font-semibold text-slate-600">
                        {item.name} <span className="text-slate-400 ml-1">{item.percentage}%</span>
                      </p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center w-full h-full">
                <p className="text-sm text-slate-400 font-medium">No meeting data available yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Meetings */}
      <div className="px-4 md:px-10 py-8 md:py-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#1a1c1e]">Upcoming Meetings</h2>
          <Link to="/attendee/meetings" className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 hover:text-black transition-colors no-underline">View All</Link>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="bg-white border border-slate-100 p-12 flex flex-col items-center justify-center rounded-2xl">
              <Loader2 className="animate-spin text-slate-400 mb-2" size={24} />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Loading Upcoming Meetings...</p>
            </div>
          ) : meetings.length === 0 ? (
            <div className="bg-white border border-slate-100 p-12 text-center rounded-2xl">
              <p className="text-sm font-bold text-slate-400">No upcoming meetings scheduled</p>
            </div>
          ) : (
            meetings.map((meeting, idx) => {
              const { time, period } = formatDashboardTime(meeting.startAt);
              const active = isMeetingActive(meeting.startAt);
              return (
                <div key={meeting._id || idx} className="bg-white border border-slate-100 p-6 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow rounded-2xl">
                  <div className="flex items-center gap-8">
                    <div className="text-center w-12">
                      <p className="text-sm font-bold text-slate-400 leading-none">{time}</p>
                      <p className="text-[10px] font-bold text-slate-300 mt-1 uppercase">{period}</p>
                    </div>
                    <div className={`w-2.5 h-2.5 rounded-full ${active ? 'bg-[#1a1c1e]' : 'bg-slate-200'}`}></div>
                    <div>
                      <h3 className="text-base font-bold text-[#1a1c1e] tracking-tight">{meeting.agenda}</h3>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">{meeting.location || 'Virtual'} • {meeting.meetingType?.toUpperCase() || 'ONLINE'}</p>
                    </div>
                  </div>
                  <Link
                    to={`/attendee/meetings`}
                    className="text-[10px] font-bold uppercase tracking-widest text-[#1a1c1e] hover:opacity-70 transition-colors no-underline"
                  >
                    View Details
                  </Link>
                </div>
              )
            })
          )}
        </div>
      </div>

      </div>
    )
  }

  export default Dashboard
