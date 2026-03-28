import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const MeetingDistribution = ({ meetings = [] }) => {
  const onlineCount = meetings.filter(m => m.meetingType === 'online').length;
  const onsiteCount = meetings.filter(m => m.meetingType === 'onsite').length;
  
  const data = [
    { name: "Online", value: onlineCount, color: "#1E293B" },
    { name: "Onsite", value: onsiteCount, color: "#64748B" },
  ];

  const total = onlineCount + onsiteCount || 1;

  return (
    <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm h-full flex flex-col">
      <h3 className="text-[12px] font-bold tracking-widest text-slate-400 uppercase mb-4 text-center">
        Meeting Distribution
      </h3>

      <div className="flex-1 relative min-h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold text-slate-900">{meetings.length}</span>
          <span className="text-[9px] text-slate-400 font-bold tracking-widest uppercase">Total</span>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {data.map((item) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
              <span className="text-[12px] text-slate-600 font-semibold">{item.name}</span>
            </div>
            <span className="text-[12px] text-slate-400 font-bold">
              {Math.round((item.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MeetingDistribution;
