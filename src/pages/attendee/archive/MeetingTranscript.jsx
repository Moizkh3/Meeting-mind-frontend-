import { useState, useEffect } from 'react'
import {
  ArrowLeft,
  Calendar,
  Timer,
  FileEdit,
  Download,
  Menu,
  Loader2,
  AlertTriangle,
  User as UserIcon,
  Star
} from 'lucide-react'
import { Link, useSearchParams, useOutletContext } from 'react-router-dom'
import axiosInstance from '../../../api/axiosinstance'

const MeetingTranscript = () => {
  const { toggleNav } = useOutletContext() || {}
  const [searchParams] = useSearchParams();
  const meetingId = searchParams.get('meetingId');

  const [meeting, setMeeting] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTranscript = async () => {
      if (!meetingId) {
        setError("No meeting ID provided");
        setLoading(false);
        return;
      }

      try {
        const res = await axiosInstance.get(`/meetings/id/${meetingId}`);
        if (res.data?.success) {
          setMeeting(res.data.data.meeting);
          setNotes(res.data.data.notes || []);
        } else {
          setError("Failed to load meeting details");
        }
      } catch (err) {
        console.error("Fetch Transcript Error:", err);
        setError("An error occurred while fetching the transcript");
      } finally {
        setLoading(false);
      }
    };

    fetchTranscript();
  }, [meetingId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-slate-400 mb-4" size={32} />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Reconstructing Archive...</p>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-10 text-center">
        <AlertTriangle className="text-rose-400 mb-4" size={48} />
        <h2 className="text-xl font-bold text-slate-900 mb-2 uppercase tracking-tight">Access Denied</h2>
        <p className="text-sm text-slate-500 max-w-md">{error || "This transcript is not available."}</p>
        <Link to="/attendee/archive" className="mt-8 px-8 py-3 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest no-underline">
          Return to Archive
        </Link>
      </div>
    );
  }

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const formatTime = (d) => new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="bg-white min-h-screen text-[#1a1c1e]">

      {/* Header Info */}
      <div className="px-4 md:px-10 py-8 md:py-10 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={toggleNav}
              className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Menu size={20} />
            </button>
            <Link to="/attendee/archive" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-black transition-colors no-underline">
              <ArrowLeft size={16} />
              Back to Archive
            </Link>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#1a1c1e]">{meeting.agenda}</h1>

          <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">
            <span className="flex items-center gap-2">
              <Calendar size={16} />
              <span className="text-[#1a1c1e]">{formatDate(meeting.startAt)}</span>
            </span>
            <span className="flex items-center gap-2">
              <Timer size={16} />
              <span className="text-[#1a1c1e]">{formatTime(meeting.startAt)}</span>
            </span>
            <span className="flex items-center gap-2">
              <FileEdit size={16} />
              Organizer: <span className="text-[#1a1c1e]">{meeting.organizedBy?.name || 'Internal'}</span>
            </span>
          </div>
        </div>

        <button className="flex items-center gap-3 px-6 py-2.5 bg-slate-900 text-white text-[11px] font-bold uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-slate-900/10">
          <Download size={18} />
          Export Transcript
        </button>
      </div>

      {/* Content Grid */}
      <div className="px-4 md:px-10 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

        {/* Left: Transcript Feed */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#1a1c1e]">Full Transcript</h2>
            <div className="flex gap-2">
              <div className="px-3 py-1 bg-slate-100 text-[9px] font-bold text-slate-500 uppercase tracking-widest">Chronological View</div>
            </div>
          </div>

          <div className="bg-white border border-slate-100 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-100">
              {notes.length === 0 ? (
                <div className="p-20 text-center">
                   <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">No transcript entries recorded for this session.</p>
                </div>
              ) : (
                notes.map((entry, idx) => {
                  const speakerName = entry.user?.name || (entry.isScribe ? 'Scribe' : 'Attendee');
                  const initials = speakerName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                  
                  return (
                    <div key={entry._id || idx} className="p-8 flex gap-6 hover:bg-slate-50 transition-colors">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 border ${entry.isScribe ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                        {entry.isScribe ? <Star size={14} /> : initials}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-[#1a1c1e]">{speakerName}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                            {formatTime(entry.createdAt)}
                          </span>
                        </div>
                        <p className="text-slate-600 leading-relaxed text-[15px] font-medium">
                          {entry.statement}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right: Insights & Tasks */}
        <div className="lg:col-span-4 space-y-10">

          {/* Summary */}
          <section className="p-8 rounded-2xl bg-slate-50/50 border border-slate-100">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#1a1c1e] mb-6">Key Takeaways</h3>
            <div className="flex flex-col items-center justify-center py-6 py-10 opacity-40">
               <AlertTriangle size={24} className="mb-3 text-slate-400" />
               <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 text-center">Intelligence Engine currently generating summary...</p>
            </div>
          </section>

          {/* Action Items */}
          <section className="bg-white border border-slate-100 p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#1a1c1e]">My Action Items</h3>
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Locked</span>
            </div>

            <div className="flex flex-col items-center justify-center py-10 opacity-30">
               <Loader2 size={24} className="mb-3 text-slate-400" />
               <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 text-center">Parsing Transcript for Tasks</p>
            </div>

            <button disabled className="w-full mt-8 py-3 bg-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] cursor-not-allowed">
              Sync to External Tools
            </button>
          </section>

          {/* Records Metadata */}
          <div className="p-6 border-t border-slate-100 space-y-3">
            <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest">
              <span className="text-slate-400">Reference ID</span>
              <span className="text-slate-900">ID-{meeting._id.slice(-8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest">
              <span className="text-slate-400">Access Level</span>
              <span className="text-slate-900">SECURE-DATA</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}


export default MeetingTranscript;

