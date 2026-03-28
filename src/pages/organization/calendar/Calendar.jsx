import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import CalendarLeftBar from "./CalendarLeftBar";
import CalendarChart from "./CalenderChart";
import axiosInstance from "../../../api/axiosinstance";

const Calendar = () => {
  const navigate = useNavigate();
  const today = new Date();

  const [selectedDate, setSelectedDate] = useState({
    day:   today.getDate(),
    month: today.getMonth() + 1,
    year:  today.getFullYear(),
  });

  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMeetings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get("/meetings/getAllMeetings");
      // API returns { success, data: [...] }
      const raw = res.data?.data || res.data?.meetings || [];
      setMeetings(raw);
    } catch (err) {
      console.error("Calendar fetch error:", err);
      setError("Could not load meetings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  // Stats for the header bar
  const now = new Date();
  const liveMeetings      = meetings.filter(m => m.meetingStatus === "in-progress").length;
  const todayMeetings     = meetings.filter(m => {
    const d = new Date(m.startAt);
    return !isNaN(d) &&
      d.getDate()     === now.getDate() &&
      d.getMonth()    === now.getMonth() &&
      d.getFullYear() === now.getFullYear();
  }).length;
  const upcomingMeetings  = meetings.filter(m => new Date(m.startAt) > now).length;

  const monthLabel = new Date(selectedDate.year, selectedDate.month - 1, 1)
    .toLocaleString("default", { month: "short", year: "numeric" });

  return (
    <div className="flex flex-col h-screen bg-[#f4f6fa]">
      {/* ── Top Header ── */}
      <div className="flex flex-wrap items-center gap-3 px-6 py-3 bg-white border-b border-[#e2e7ef] shrink-0">
        {/* Title */}
        <h1 className="text-[18px] font-bold text-[#2c3a4f] mr-1">Schedule</h1>

        {/* Month Navigator (cosmetic — actual nav is inside CalendarChart) */}
        <div className="flex items-center gap-1 border border-[#e2e7ef] rounded-lg overflow-hidden">
          <span className="px-3 py-2 text-[12px] font-semibold text-[#2c3a4f] border-x border-[#e2e7ef]">
            {monthLabel}
          </span>
        </div>

        {/* Quick stats */}
        {!loading && (
          <div className="hidden md:flex items-center gap-4 ml-2">
            {liveMeetings > 0 && (
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {liveMeetings} Live
              </span>
            )}
            <span className="text-[11px] font-semibold text-[#8a99b0]">
              {todayMeetings} today · {upcomingMeetings} upcoming
            </span>
          </div>
        )}


        <div className="flex-1" />

        {/* Refresh */}
        <button
          onClick={fetchMeetings}
          disabled={loading}
          className="p-2 rounded-lg text-[#8a99b0] hover:text-[#2c3a4f] hover:bg-[#f4f6fa] transition-colors disabled:opacity-40"
          title="Refresh meetings"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>

        {/* New Meeting */}
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2c3a4f] text-white text-[13px] font-semibold hover:bg-[#3d4f66] transition-colors"
          onClick={() => navigate("/organization/create-meeting")}
        >
          <span className="text-lg leading-none">+</span>
          New Meeting
        </button>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="flex items-center gap-3 px-6 py-3 bg-rose-50 border-b border-rose-200 text-rose-700 text-sm">
          <AlertCircle size={16} />
          <span>{error}</span>
          <button onClick={fetchMeetings} className="ml-auto text-xs font-bold underline">Retry</button>
        </div>
      )}

      {/* ── Body ── */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center text-[#8a99b0]">
          <Loader2 size={36} className="animate-spin mb-3" />
          <p className="text-sm font-medium">Loading your schedule…</p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row flex-1 overflow-y-auto bg-[#f4f6fa]">
          {/* Calendar Grid */}
          <div className="flex-1 p-4 md:p-5">
            <CalendarChart
              onDateSelect={(date) => setSelectedDate(date)}
              selectedDay={selectedDate.day}
              selectedMonth={selectedDate.month}
              selectedYear={selectedDate.year}
              meetings={meetings}
            />
          </div>

          {/* Right Sidebar: day detail */}
          <div className="w-full lg:w-72 shrink-0 border-t lg:border-t-0 lg:border-l border-[#e2e7ef] bg-white lg:overflow-y-auto">
            <CalendarLeftBar
              selectedDate={selectedDate}
              meetings={meetings}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;