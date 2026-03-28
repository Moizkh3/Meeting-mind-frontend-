import React, { useEffect, useState } from "react";
import ReportsCards from "./ReportsCards";
import ReportsCharts from "./ReportsCharts";
import RecentMeetingSummary from "./RecentMeetingSummary";
import axiosInstance from "../../../../api/axiosinstance";
import { Loader2 } from "lucide-react";

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosInstance.get("/meetings/getAllMeetings");
        const allMeetings = res.data.data || [];

        // Calculate Stats
        const completedMeetings = allMeetings.filter(m => m.meetingStatus === "completed");
        const totalDuration = completedMeetings.reduce((acc, m) => {
          if (m.startAt && m.meetingEndAt) {
            return acc + (new Date(m.meetingEndAt) - new Date(m.startAt));
          }
          return acc;
        }, 0);

        const avgDuration = completedMeetings.length > 0 
          ? Math.round((totalDuration / completedMeetings.length) / 60000) 
          : 0;

        const uniqueScribes = new Set(
          allMeetings.flatMap(m => 
            (m.attendees || [])
              .filter(a => a.isScriber)
              .map(a => a.user?._id || a.emailForUnregisteredAttendee)
          )
        ).size;

        // Group by month for Activity Chart
        const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        const activityData = months.map((month, idx) => {
          const count = allMeetings.filter(m => new Date(m.startAt).getMonth() === idx).length;
          return { name: month, value: count };
        });

        // Top Scribes
        const scribeCounts = {};
        allMeetings.forEach(m => {
          (m.attendees || []).filter(a => a.isScriber).forEach(a => {
            const name = a.nameForUnregisteredAttendee || a.user?.name || "Scriber";
            scribeCounts[name] = (scribeCounts[name] || 0) + 1;
          });
        });
        const topScribes = Object.entries(scribeCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        // Status Breakdown
        const statusCounts = {
          completed: allMeetings.filter(m => m.meetingStatus === "completed").length,
          scheduled: allMeetings.filter(m => m.meetingStatus === "scheduled").length,
          live: allMeetings.filter(m => m.meetingStatus === "continue").length,
        };
        const total = allMeetings.length || 1;
        const statusData = [
          { name: "Completed", value: Math.round((statusCounts.completed / total) * 100), color: "#1E293B", count: statusCounts.completed },
          { name: "Scheduled", value: Math.round((statusCounts.scheduled / total) * 100), color: "#64748B", count: statusCounts.scheduled },
          { name: "Live",      value: Math.round((statusCounts.live / total) * 100), color: "#94A3B8", count: statusCounts.live },
        ];

        setStats({
          totalMeetings: allMeetings.length,
          totalScribes: uniqueScribes,
          avgDuration,
          activityData,
          statusData,
          topScribes,
          recentMeetings: completedMeetings.slice(0, 5).map(m => ({
            title: m.agenda,
            date: new Date(m.startAt).toLocaleDateString([], { dateStyle: 'medium' }),
            scribe: (m.attendees || []).find(a => a.isScriber)?.nameForUnregisteredAttendee || (m.attendees || []).find(a => a.isScriber)?.user?.name || "Scriber",
            duration: m.startAt && m.meetingEndAt ? `${Math.round((new Date(m.meetingEndAt) - new Date(m.startAt)) / 60000)}m` : "N/A"
          }))
        });

      } catch (err) {
        console.error("Failed to fetch reports data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 size={32} className="animate-spin text-primary" />
        <span className="text-xs font-bold uppercase tracking-widest">Generating Analytics...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f6fa] p-4 md:p-8">
      <h1 className="text-[22px] font-bold text-[#2c3a4f] mb-1">Reports</h1>
      <p className="text-[13px] text-[#8a99b0] mb-6">
        Insights and analytics for your organization's meeting activity
      </p>

      <ReportsCards stats={stats} />

      <div className="mb-4">
        <ReportsCharts stats={stats} />
      </div>

      <RecentMeetingSummary recentMeetings={stats?.recentMeetings || []} />
    </div>
  );
}