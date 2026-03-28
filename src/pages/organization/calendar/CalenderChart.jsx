import { useState, useMemo } from "react";

const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function getCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();
  const cells = [];
  for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: prevDays - i, current: false });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, current: true });
  while (cells.length % 7 !== 0) cells.push({ day: cells.length - daysInMonth - firstDay + 1, current: false });
  return cells;
}

const STATUS_STYLES = {
  "in-progress": { bg: "bg-emerald-500", text: "text-emerald-50", label: "LIVE" },
  "scheduled":   { bg: "bg-sky-500",     text: "text-sky-50",     label: "SCHED" },
  "completed":   { bg: "bg-slate-400",   text: "text-slate-50",   label: "DONE" },
};

export default function CalendarChart({ onDateSelect, selectedDay, selectedMonth, selectedYear, meetings = [] }) {
  const [month, setMonth] = useState(selectedMonth !== undefined ? selectedMonth - 1 : new Date().getMonth());
  const [year, setYear]   = useState(selectedYear  !== undefined ? selectedYear       : new Date().getFullYear());

  const cells = getCalendarDays(year, month);
  const today = new Date();

  // Build a map: day number → list of meeting objects for this month/year
  const meetingsByDay = useMemo(() => {
    const map = {};
    meetings.forEach(m => {
      const d = new Date(m.startAt);
      if (isNaN(d)) return;
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(m);
      }
    });
    return map;
  }, [meetings, year, month]);

  const handleSelect = (day, current) => {
    if (!current) return;
    onDateSelect && onDateSelect({ day, month: month + 1, year });
  };

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const isToday = (day, current) =>
    current &&
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  return (
    <div className="bg-white border border-[#e2e7ef] rounded-xl overflow-hidden shadow-sm">
      {/* Month Nav */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#e2e7ef]">
        <button onClick={prevMonth} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[#f4f6fa] text-[#4a6071] transition-colors text-lg">‹</button>
        <span className="text-[12px] font-bold tracking-widest text-[#2c3a4f] uppercase">
          {new Date(year, month, 1).toLocaleString("default", { month: "long", year: "numeric" })}
        </span>
        <button onClick={nextMonth} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[#f4f6fa] text-[#4a6071] transition-colors text-lg">›</button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 border-b border-[#e2e7ef]">
        {DAYS.map(d => (
          <div key={d} className="py-2 text-center text-[11px] font-bold tracking-widest text-[#8a99b0] uppercase border-r border-[#e2e7ef] last:border-r-0">
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7">
        {cells.map((cell, idx) => {
          const isSelected   = cell.current && cell.day === selectedDay && selectedMonth - 1 === month && selectedYear === year;
          const isTodayCell  = isToday(cell.day, cell.current);
          const dayMeetings  = cell.current ? (meetingsByDay[cell.day] || []) : [];
          const isLastRow    = idx >= cells.length - 7;
          const isLastCol    = (idx + 1) % 7 === 0;

          return (
            <div
              key={idx}
              onClick={() => handleSelect(cell.day, cell.current)}
              className={`
                relative min-h-[100px] p-2 flex flex-col
                ${!isLastRow ? "border-b border-[#e2e7ef]" : ""}
                ${!isLastCol ? "border-r border-[#e2e7ef]" : ""}
                ${cell.current && !isSelected ? "cursor-pointer hover:bg-[#f7f9fc]" : ""}
                ${isSelected ? "bg-[#2c3a4f]" : ""}
                ${!cell.current ? "bg-[#f7f9fc]" : ""}
                transition-colors duration-150
              `}
            >
              {/* Day number */}
              <span className={`text-[13px] font-semibold leading-none mb-1.5 w-6 h-6 flex items-center justify-center rounded-full ${
                isSelected
                  ? "text-white bg-transparent"
                  : isTodayCell
                  ? "bg-[#2c3a4f] text-white rounded-full"
                  : cell.current
                  ? "text-[#2c3a4f]"
                  : "text-[#c5cdd8]"
              }`}>
                {cell.day}
              </span>

              {/* Meeting pills */}
              {dayMeetings.length > 0 && !isSelected && (
                <div className="flex flex-col gap-0.5 mt-0.5">
                  {dayMeetings.slice(0, 2).map((m, i) => {
                    const style = STATUS_STYLES[m.meetingStatus] || STATUS_STYLES["scheduled"];
                    return (
                      <span key={i} className={`text-[8px] font-bold tracking-wide ${style.bg} ${style.text} rounded px-1 py-0.5 truncate`}>
                        {m.agenda || "Meeting"}
                      </span>
                    );
                  })}
                  {dayMeetings.length > 2 && (
                    <span className="text-[8px] font-bold text-[#8a99b0]">+{dayMeetings.length - 2} more</span>
                  )}
                </div>
              )}

              {/* Selected indicator */}
              {isSelected && dayMeetings.length > 0 && (
                <span className="text-[8px] font-bold text-white/70 mt-1">{dayMeetings.length} meeting{dayMeetings.length > 1 ? 's' : ''}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}