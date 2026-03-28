import React from "react";
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
  Cell 
} from "recharts";

/* ── Line Chart ── */
function CustomLineChart({ data }) {
  return (
    <div className="w-full h-44">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1E293B" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#1E293B" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: "#8a99b0", fontSize: 9, fontWeight: 600 }}
            dy={10}
          />
          <YAxis hide domain={['dataMin', 'dataMax + 2']} />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#1E293B" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorValue)" 
            isAnimationActive={true}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ── Donut Chart ── */
function CustomDonutChart({ data, total }) {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <div className="relative w-40 h-40">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={70}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-bold text-[#1E293B]">{total}</span>
          <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Total</span>
        </div>
      </div>
      <div className="flex items-center gap-4 mt-2">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
            <span className="text-[11px] text-[#8a99b0] font-medium">{item.name} {item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main Export ── */
export default function ReportsCharts({ stats }) {
  const topScribes = stats?.topScribes || [];
  const maxCount = topScribes.length > 0 ? topScribes[0].count : 1;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Line Chart */}
      <div className="bg-white border border-[#e2e7ef] rounded-xl p-5 shadow-sm">
        <p className="text-[13px] font-bold text-[#2c3a4f] mb-3 uppercase tracking-tight">Meeting Activity Over Time</p>
        <CustomLineChart data={stats?.activityData || []} />
      </div>

      {/* Donut Chart */}
      <div className="bg-white border border-[#e2e7ef] rounded-xl p-5 shadow-sm flex flex-col">
        <p className="text-[13px] font-bold text-[#2c3a4f] mb-2 uppercase tracking-tight">Meeting Status Breakdown</p>
        <div className="flex-1 flex items-center justify-center">
          <CustomDonutChart data={stats?.statusData || []} total={stats?.totalMeetings || 0} />
        </div>
      </div>

      {/* Top Scribes Bar */}
      <div className="md:col-span-2 bg-white border border-[#e2e7ef] rounded-xl p-5 shadow-sm">
        <p className="text-[13px] font-bold text-[#2c3a4f] mb-4 uppercase tracking-tight">Top Scribes by Meetings Handled</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
          {topScribes.length > 0 ? (
            topScribes.map(({name, count})=>(
              <div key={name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[12px] text-[#4a6071]">{name}</span>
                  <span className="text-[12px] font-semibold text-[#2c3a4f]">{count}</span>
                </div>
                <div className="w-full h-1.5 bg-[#eef0f5] rounded-full overflow-hidden">
                  <div className="h-full bg-[#1E293B] rounded-full transition-all duration-500"
                    style={{width:`${(count/maxCount)*100}%`}}/>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 py-8 text-center text-slate-400 text-xs italic">
              No scribe activity identified yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
