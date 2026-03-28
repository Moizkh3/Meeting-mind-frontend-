import React from "react";
import { Calendar, Users, Clock, Star } from "lucide-react";

const Cards = ({ meetings = [] }) => {
  const now = new Date();
  
  const upcomingToday = meetings.filter(m => {
    const start = new Date(m.startAt);
    const isSameDay = 
      start.getDate() === now.getDate() &&
      start.getMonth() === now.getMonth() &&
      start.getFullYear() === now.getFullYear();
    
    return isSameDay && start > now;
  }).length;

  const activeAttendees = meetings.reduce((acc, m) => acc + (m.attendees?.length || 0), 0);
  const completedMeetings = meetings.filter(m => m.meetingStatus === "completed" || m.meetingStatus === "Completed").length;

  const cardsData = [
    {
      title: "UPCOMING TODAY",
      value: upcomingToday,
      subtitle: "Scheduled for today",
      icon: <Calendar size={24} />,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "TOTAL PARTICIPANTS",
      value: activeAttendees,
      subtitle: "Across all meetings",
      icon: <Users size={24} />,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "COMPLETED SESSIONS",
      value: completedMeetings,
      subtitle: "Historical record",
      icon: <Clock size={24} />,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "TOTAL MEETINGS",
      value: meetings.length,
      subtitle: "Organization volume",
      icon: <Star size={24} />,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cardsData.map((card, index) => (
        <div
          key={index}
          className="bg-white border border-slate-100 rounded-xl p-6 flex justify-between items-start hover:shadow-lg hover:border-slate-200 transition-all group"
        >
          <div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
              {card.title}
            </p>
            <h2 className="text-3xl font-bold text-slate-900 mt-3 tracking-tight">
              {card.value}
            </h2>
            {card.subtitle && (
              <p className="text-xs font-medium text-slate-500 mt-2 flex items-center gap-1">
                {card.subtitle}
              </p>
            )}
          </div>

          <div
            className={`p-3 rounded-xl transition-transform group-hover:scale-110 ${card.bg} ${card.color}`}
          >
            {card.icon}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Cards;