import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import axiosInstance from '../../../api/axiosinstance'
import { getMeetingById } from '../../../api/meetings'
import { getAllNotes } from '../../../api/notes'
import { getAllDisputes } from '../../../api/disputes'
import {
  LayoutGrid,
  PlusCircle,
  Star,
  AlertTriangle,
  CheckCircle2,
  X,
  Loader2
} from 'lucide-react'
import LiveCanvas from '../../scribe/live-canvas/LiveCanvas'

const TABS = ['Live Feed', 'Live Canvas']

const LiveSession = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const searchParams = new URLSearchParams(location.search)
  const meetingId = searchParams.get('meetingId')
  const [isScribe, setIsScribe] = useState(searchParams.get('role') === 'scribe')
  const initialTab = searchParams.get('tab') || (isScribe ? 'Live Canvas' : 'Live Feed')

  const [activeTab, setActiveTab] = useState(initialTab)
  const [noteInput, setNoteInput] = useState('')
  const [showInput, setShowInput] = useState(false)
  const [editMode, setEditMode] = useState('NOTE')
  const [isEnding, setIsEnding] = useState(false)

  // Real Data States
  const [meeting, setMeeting] = useState(null)
  const [notes, setNotes] = useState([])
  const [disputes, setDisputes] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedNote, setSelectedNote] = useState(null)

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: 'confirm',
    title: "",
    message: ""
  });

  // Ref to avoid stale closures in polling
  const meetingEndedRef = useRef(false);

  const closeModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }));

  const handleEndMeetingClick = () => {
    setModalConfig({
      isOpen: true,
      type: 'confirm',
      title: 'End Meeting?',
      message: 'Are you sure you want to end this session? This will finalize the meeting for all participants.'
    });
  };

  const confirmEndMeeting = async () => {
    if (!meetingId) return;
    try {
      setIsEnding(true);
      closeModal();
      await axiosInstance.put(`/meetings/endMeeting/${meetingId}`);

      meetingEndedRef.current = true;
      setModalConfig({
        isOpen: true,
        type: 'success',
        title: 'Meeting Ended',
        message: 'The session has been successfully closed. Redirecting you to the dashboard...'
      });

      setTimeout(() => {
        navigate('/organization/meetings');
      }, 2500);
    } catch (err) {
      console.error("Failed to end meeting:", err);
      setModalConfig({
        isOpen: true,
        type: 'error',
        title: 'Action Failed',
        message: err.response?.data?.message || err.message || 'An error occurred while ending the meeting.'
      });
    } finally {
      setIsEnding(false);
    }
  };

  // Fetch meeting data ONCE on mount
  const fetchData = async () => {
    if (!meetingId) return;
    try {
      const [meetingRes, notesRes, disputesRes] = await Promise.all([
        getMeetingById(meetingId),
        getAllNotes({ meetingId }),
        getAllDisputes({ meetingId })
      ]);

      if (meetingRes.success) {
        setMeeting(meetingRes.data.meeting);
        if (meetingRes.data.meeting.meetingStatus === 'completed') {
          meetingEndedRef.current = true;
        }
      }
      if (notesRes.success) setNotes(notesRes.data);
      if (disputesRes.success) setDisputes(disputesRes.data);
    } catch (err) {
      console.error('Failed to fetch live data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Lightweight status-only poll
  const pollMeetingStatus = async () => {
    if (!meetingId || meetingEndedRef.current) return;
    try {
      const res = await getMeetingById(meetingId);
      if (res.success) {
        setMeeting(res.data.meeting);
        if (res.data.meeting.meetingStatus === 'completed') {
          meetingEndedRef.current = true;
        }
      }
    } catch (err) {
      console.error('Status polling failed:', err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(pollMeetingStatus, 3000);
    return () => clearInterval(interval);
  }, [meetingId]);

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && TABS.includes(tab)) {
      setActiveTab(tab)
    }
  }, [location.search])

  return (
    <div className="flex flex-col h-full bg-white">

      {/* Top bar */}
      <div className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0">
        <div className="flex items-center gap-4">

          <div className="flex items-center gap-2">
            <LayoutGrid className="text-slate-900" size={18} />
            <span className="font-extrabold text-sm text-slate-900 tracking-tight">MeetingminD</span>
          </div>

          <div className="h-6 w-px bg-gray-100 mx-1" />

          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider">Topic:</span>
            <span className="text-[13px] font-bold text-slate-900 uppercase tracking-tight">
              [{meeting?.agenda || 'Loading...'}]
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-[13px] font-semibold text-gray-600 uppercase tracking-wider">LIVE RECORDING</span>
          </div>

          {!isScribe && (
            <button
              onClick={handleEndMeetingClick}
              disabled={isEnding || (modalConfig.isOpen && modalConfig.type === 'success')}
              className="px-4 py-1.5 bg-rose-50 text-rose-600 border border-rose-200 rounded text-[11px] font-bold uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all disabled:opacity-50"
            >
              {isEnding ? "ENDING..." : "END MEETING"}
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">

        {/* Main feed panel */}
        <div className="flex-1 flex flex-col border-r border-gray-100">

          {/* Tabs */}
          <div className="flex border-b border-gray-100 px-4">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3.5 mr-6 text-[14px] transition-all ${activeTab === tab
                  ? 'text-[#1e2d47] font-semibold border-b-2 border-[#1e2d47]'
                  : 'text-gray-400 hover:text-gray-600'
                  }`}
                style={activeTab === tab ? { marginBottom: '-1px' } : {}}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Live Feed */}
          {activeTab === 'Live Feed' && (
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loading && notes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-40">
                  <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin mb-4" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Syncing Feed...</p>
                </div>
              ) : notes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-100 rounded-lg mx-4">
                  <p className="text-xs font-bold text-slate-300 uppercase tracking-widest text-center px-10">Waiting for session notes... Notes will appear here as they are captured by the scribe.</p>
                </div>
              ) : (
                notes.map((note) => {
                  const dispute = disputes.find(d => d.note?._id === note._id);
                  const isScribeNote = !note.user || note.isScribe;
                  const userInitial = note.user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'S';
                  return (
                    <div key={note._id} className={`rounded-sm p-4 border transition-all ${dispute ? 'border-amber-200 bg-amber-50/30' : 'bg-white border-gray-200'}`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-0.5 ${dispute ? 'bg-amber-100 text-amber-700 border-amber-200' :
                            isScribeNote ? 'bg-gray-100 text-gray-600' :
                              'bg-slate-100 text-slate-700'
                          }`}>
                          {dispute ? '!' : isScribeNote ? <Star size={14} /> : userInitial}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-3">
                              <span className="text-[13px] font-semibold text-gray-700">{note.user?.name || 'Scribe (Live Note)'}</span>
                              <span className="text-[11px] text-gray-400">
                                {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {note.topic && (
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded">
                                  {note.topic}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="relative">
                            <p className="text-[14px] text-gray-700 leading-relaxed font-medium">
                              {note.statement}
                            </p>
                            {dispute && (
                              <div className="mt-3 pt-3 border-t border-amber-100/50">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest">Attendee Correction:</span>
                                </div>
                                <p className="text-[13px] text-amber-700 leading-relaxed italic bg-white/50 p-2 rounded-sm border border-amber-50">
                                  "{dispute.statement}"
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Live Canvas Tab */}
          {activeTab === 'Live Canvas' && (
            <div className="flex-1 bg-slate-50 relative overflow-hidden">
              <LiveCanvas readOnly={!isScribe} embedded={true} suppressEndModal={true} />
            </div>
          )}
        </div>

        {/* Custom Modal */}
        {modalConfig.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
              <div className="p-6 text-center">
                <div className="mb-4 flex justify-center">
                  {modalConfig.type === 'confirm' && (
                    <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
                      <AlertTriangle size={24} />
                    </div>
                  )}
                  {modalConfig.type === 'success' && (
                    <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                      <CheckCircle2 size={24} />
                    </div>
                  )}
                  {modalConfig.type === 'error' && (
                    <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
                      <X size={24} />
                    </div>
                  )}
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2">{modalConfig.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed px-2">{modalConfig.message}</p>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
                {modalConfig.type === 'confirm' ? (
                  <>
                    <button
                      onClick={closeModal}
                      className="flex-1 px-4 py-2 text-[11px] font-bold text-slate-500 bg-white border border-slate-200 rounded hover:bg-slate-100 transition-all uppercase tracking-widest shadow-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmEndMeeting}
                      disabled={isEnding}
                      className="flex-1 px-4 py-2 text-[11px] font-bold text-white bg-charcoal rounded hover:opacity-90 transition-all uppercase tracking-widest shadow-sm flex items-center justify-center gap-2"
                    >
                      {isEnding ? "Processing..." : "End Session"}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={closeModal}
                    className={`w-full px-4 py-2 text-[11px] font-bold text-white rounded transition-all uppercase tracking-widest shadow-sm ${modalConfig.type === 'success' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-rose-500 hover:bg-rose-600'
                      }`}
                  >
                    {modalConfig.type === 'success' ? 'Understood' : 'Close'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LiveSession
