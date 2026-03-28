import React from "react";
import { Link } from "react-router-dom";
import { Plus, CheckCircle2, Clock, AlertCircle, ArrowRight } from "lucide-react";

const RecentActivity = ({ meetings = [] }) => {
  // Sort meetings by createdAt to show latest activity
  // Note: Assuming createdAt exists, otherwise use startAt
  const activities = meetings
    .sort((a, b) => new Date(b.createdAt || b.startAt) - new Date(a.createdAt || a.startAt))
    .slice(0, 5)
    .map(m => {
      let icon = <Plus size={14} className="text-blue-500" />;
      let text = "Meeting created";
      let status = m.meetingStatus;

      if (status === "completed") {
        icon = <CheckCircle2 size={14} className="text-emerald-500" />;
        text = "Meeting completed";
      } else if (status === "continue") {
        icon = <Clock size={14} className="text-amber-500" />;
        text = "Meeting currently live";
      } else if (status === "cancelled") {
        icon = <AlertCircle size={14} className="text-rose-500" />;
        text = "Meeting cancelled";
      }

      return {
        id: m._id,
        icon,
        text,
        title: m.agenda,
        time: new Date(m.createdAt || m.startAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      };
    });

  return (
    <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm h-full flex flex-col">
       <h3 className="text-[12px] font-bold tracking-widest text-slate-400 uppercase mb-6">
        Recent Activity
      </h3>

      <div className="flex-1 space-y-6">
        {activities.length > 0 ? (
          activities.map((activity, idx) => (
            <div key={activity.id} className="relative pl-6 pb-2">
              {/* Timeline line */}
              {idx !== activities.length - 1 && (
                <div className="absolute left-[7px] top-[14px] bottom-[-24px] w-px bg-slate-100" />
              )}
              
              {/* Icon marker */}
              <div className="absolute left-0 top-0 w-[15px] h-[15px] rounded-full bg-white border-2 border-slate-100 flex items-center justify-center z-10">
                <div className="w-1 h-1 rounded-full bg-slate-300" />
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 p-2 rounded-lg bg-slate-50 border border-slate-100">
                  {activity.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">{activity.text}</p>
                    <span className="text-[9px] text-slate-300 font-bold">&bull; {activity.time}</span>
                  </div>
                  <p className="text-[14px] font-bold text-slate-800 mt-0.5">{activity.title}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
               <AlertCircle size={20} className="text-slate-300" />
            </div>
            <p className="text-xs text-slate-400 font-medium italic">No recent activity identified.</p>
          </div>
        )}
      </div>

      <div className="mt-auto pt-6 border-t border-slate-50">
        <Link 
          to="/organization/meetings"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] hover:bg-slate-100 hover:text-slate-600 transition-all no-underline"
        >
          View Full Session History
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
};

export default RecentActivity;
