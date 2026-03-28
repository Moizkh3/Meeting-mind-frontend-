import React from "react";
import { 
  ChevronRight, 
  MessageSquare, 
  Star, 
  Calendar, 
  User as UserIcon,
  LayoutGrid,
  ChevronLeft,
  Loader2,
  Clock,
  ArrowLeft
} from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axiosinstance";

const MeetingFeedback = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reviews, setReviews] = React.useState([]);
  const [meeting, setMeeting] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      // Fetch reviews
      const reviewRes = await axiosInstance.get(`/anonymous/reviews/${id}`);
      setReviews(reviewRes.data.reviews || []);

      // Fetch meeting details for context
      const meetingRes = await axiosInstance.get(`/meetings/id/${id}`);
      setMeeting(meetingRes.data.data.meeting);
    } catch (err) {
      console.error("Failed to fetch feedback:", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchFeedback();
  }, [id]);

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 size={32} className="animate-spin text-primary" />
        <span className="text-xs font-bold uppercase tracking-widest">Retrieving Anonymous Insights...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sidebar/10 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-8">
        <div className="flex flex-wrap items-center gap-2 text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mb-4">
          <LayoutGrid size={14} className="shrink-0" />
          <span>Organization</span>
          <ChevronRight size={12} className="shrink-0" />
          <Link to="/organization/meetings" className="hover:text-primary transition-colors no-underline">Meetings</Link>
          <ChevronRight size={12} className="shrink-0" />
          <span className="text-primary font-bold">Meeting Feedback</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
             <button 
              onClick={() => navigate(-1)}
              className="group flex items-center gap-2 text-slate-400 hover:text-charcoal transition-colors mb-4"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-xs font-bold uppercase tracking-widest">Back to Workspace</span>
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-charcoal tracking-tight">
              {meeting?.agenda || "Meeting Feedback"}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-2">
              <div className="flex items-center gap-1.5 text-slate-500 font-medium text-sm">
                <Calendar size={14} className="text-slate-400" />
                {meeting ? new Date(meeting.startAt).toLocaleDateString([], { dateStyle: 'medium' }) : "N/A"}
              </div>
              <div className="flex items-center gap-1.5 text-slate-500 font-medium text-sm">
                <Clock size={14} className="text-slate-400" />
                {meeting ? new Date(meeting.startAt).toLocaleTimeString([], { timeStyle: 'short' }) : "N/A"}
              </div>
            </div>
          </div>

          <div className="bg-white px-6 py-4 rounded-2xl border border-border shadow-sm flex items-center gap-6">
            <div className="text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Average Response</p>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-charcoal">{averageRating}</span>
                <Star size={20} className="text-amber-400 fill-amber-400" />
              </div>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Signals</p>
              <p className="text-3xl font-bold text-charcoal">{reviews.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 gap-4">
          {reviews.length > 0 ? (
            reviews.map((rev, idx) => (
              <div 
                key={rev._id || idx}
                className="bg-white border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group border-opacity-60"
              >
                {/* Anonymous Badge */}
                <div className="absolute top-0 right-0 px-3 py-1 bg-slate-50 border-b border-l border-border rounded-bl-lg">
                   <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Anonymous Attendee</span>
                   </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                  {/* Rating Signal */}
                  <div className="shrink-0 flex md:flex-col items-center gap-2 md:pt-1">
                    <div className="w-12 h-12 bg-sidebar rounded-xl flex items-center justify-center text-charcoal font-bold text-lg border border-border/50">
                      {rev.rating}
                    </div>
                    <div className="flex md:flex-row">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={12} 
                          className={i < rev.rating ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"} 
                        />
                      ))}
                    </div>
                  </div>

                  {/* Feedback Text */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <MessageSquare size={16} className="text-slate-300" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Qualitative Review</span>
                    </div>
                    <p className="text-charcoal text-sm md:text-base leading-relaxed font-serif italic">
                      &ldquo;{rev.review || "No written review provided."}&rdquo;
                    </p>
                    <div className="flex items-center gap-2 mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                      <span>Submitted at</span>
                      <span>{new Date(rev.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-24 text-center bg-white border border-border border-dashed rounded-2xl flex flex-col items-center justify-center gap-4">
              <div className="w-20 h-20 bg-sidebar/50 rounded-full flex items-center justify-center">
                <MessageSquare size={32} className="text-slate-200" />
              </div>
              <div className="max-w-xs">
                <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mb-1">Silence is Golden</p>
                <p className="text-xs text-slate-300 italic">No feedback signals have been identified for this session yet.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeetingFeedback;
