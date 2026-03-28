import { Calendar, Users, Clock, Settings2 } from "lucide-react";

export default function ReportsCards({ stats }) {
  const cards = [
    { 
      label: "Total Meetings", 
      value: stats?.totalMeetings || "0", 
      change: stats?.totalMeetings > 0 ? "+100%" : "0%", 
      positive: true, 
      icon: Calendar 
    },
    { 
      label: "Total Scribes Used", 
      value: stats?.totalScribes || "0", 
      change: "", 
      positive: true, 
      icon: Users 
    },
    { 
      label: "Avg. Meeting Duration", 
      value: stats?.avgDuration ? `${stats.avgDuration} min` : "0 min", 
      change: "", 
      positive: true, 
      icon: Clock 
    },
    { 
      label: "Completed Sessions", 
      value: stats?.statusData?.find(d => d.name === "Completed")?.count || "0", 
      change: "", 
      positive: true, 
      icon: Settings2 
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
      {cards.map(({ label, value, change, positive, icon: Icon }) => (
        <div key={label} className="bg-white border border-[#e2e7ef] rounded-xl px-5 py-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold tracking-widest text-[#7a8699] uppercase leading-tight">{label}</p>
            <Icon size={16} className="text-[#8a99b0]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[28px] font-bold text-[#2c3a4f] leading-none">{value}</span>
            {change && (
              <span className={`text-[12px] font-semibold ${positive ? "text-[#2e7d52]" : "text-[#c0392b]"}`}>
                {change}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}