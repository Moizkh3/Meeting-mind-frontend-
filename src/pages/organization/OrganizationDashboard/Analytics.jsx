import React from "react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

const Analytics = ({ meetings = [] }) => {
  // Generate last 7 days labels
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString([], { weekday: 'short' }).toUpperCase();
  });

  // Calculate real data from meetings
  const chartData = last7Days.map((day, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const count = meetings.filter(m => {
      const start = new Date(m.startAt);
      return start.getDate() === d.getDate() &&
             start.getMonth() === d.getMonth() &&
             start.getFullYear() === d.getFullYear();
    }).length;
    
    return { name: day, value: count };
  });

  return (
    <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-[12px] font-bold tracking-widest text-slate-400 uppercase">
            Meeting Activity
          </h3>
          <p className="text-xl font-bold text-slate-900 mt-1">7-Day Trend</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-[10px] font-bold text-slate-400 uppercase">Sessions</span>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValueOrg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1E293B" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#1E293B" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 600 }}
              dy={10}
            />
            <YAxis 
               axisLine={false} 
               tickLine={false} 
               tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 600 }}
               allowDecimals={false}
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '12px', 
                border: '1px solid #f1f5f9', 
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                fontSize: '12px',
                fontWeight: 'bold'
              }}
              cursor={{ stroke: '#f1f5f9', strokeWidth: 2 }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#1E293B" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorValueOrg)" 
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Analytics;
