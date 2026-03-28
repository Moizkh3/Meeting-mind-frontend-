import { useState, useEffect } from 'react'
import { useLocation, useOutletContext, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import {
  LayoutGrid,
  Settings,
  LogOut,
  Search,
  User,
  Trash2,
  Edit,
  List,
  PlusCircle,
  Star,
  Monitor,
  PanelRightClose,
  PanelRightOpen,
  PanelLeftClose,
  PanelLeftOpen,
  Layout,
  Menu,
  AlertTriangle,
  ArrowRight,
  Home
} from 'lucide-react'
import LiveCanvas from '../../scribe/live-canvas/LiveCanvas'
import { getMeetingById } from '../../../api/meetings'
import { getAllNotes } from '../../../api/notes'
import { createDispute, getAllDisputes } from '../../../api/disputes'
import Modal from '../../../components/common/Modal'

const TABS = ['Live Feed', 'Live Canvas']

const LiveSession = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { toggleNav, isNavOpen } = useOutletContext() || {}
  const { user } = useAuth()
  const searchParams = new URLSearchParams(location.search)
  const [isScribe, setIsScribe] = useState(false)
  const initialTab = searchParams.get('tab') || 'Live Feed'

  const [activeTab, setActiveTab] = useState(initialTab)
  const [noteInput, setNoteInput] = useState('')
  const [showInput, setShowInput] = useState(false)
  const [editMode, setEditMode] = useState('NOTE') // 'NOTE' | 'CORRECTION'
  const [showEndModal, setShowEndModal] = useState(false)

  // Real Data States
  const [meeting, setMeeting] = useState(null)
  const [notes, setNotes] = useState([])
  const [disputes, setDisputes] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedNote, setSelectedNote] = useState(null)

  const meetingId = searchParams.get('meetingId')

  // Status-only poll (lightweight, doesn't touch notes or disputes)
  const pollMeetingStatus = async () => {
    if (!meetingId) return;
    try {
      const res = await getMeetingById(meetingId);
      if (res.success) {
        const updatedMeeting = res.data.meeting;
        setMeeting(updatedMeeting);
        if (updatedMeeting.meetingStatus === 'completed' && !showEndModal) {
          setShowEndModal(true);
        }
      }
    } catch (err) {
      console.error('Status polling failed:', err);
    }
  };

  const fetchData = async () => {
    if (!meetingId) return;
    try {
      const [meetingRes, notesRes, disputesRes] = await Promise.all([
        getMeetingById(meetingId),
        getAllNotes({ meetingId }),
        getAllDisputes({ meetingId })
      ]);

      if (meetingRes.success) {
        const updatedMeeting = meetingRes.data.meeting;
        setMeeting(updatedMeeting);

        const isScribeMatch = (updatedMeeting.scriber === (user?._id || user)) ||
          updatedMeeting.attendees?.some(a => String(a.user?._id || a.user || "") === String(user?._id || "") && a.isScriber);
        setIsScribe(isScribeMatch);

        if (isScribeMatch && !searchParams.get('tab')) {
          setActiveTab('Live Canvas');
        }

        if (updatedMeeting.meetingStatus === 'completed' && !showEndModal) {
          setShowEndModal(true);
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

  useEffect(() => {
    fetchData();
    const interval = setInterval(pollMeetingStatus, 3000); // Poll ONLY status every 3 seconds
    return () => clearInterval(interval);
  }, [meetingId]);

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && TABS.includes(tab)) {
      setActiveTab(tab)
    }
  }, [location.search])

  const handleCorrection = (note) => {
    setSelectedNote(note);
    setEditMode('CORRECTION');
    setNoteInput('');
    setShowInput(true);
  };

  const handleSubmit = async () => {
    if (!noteInput.trim()) return;

    try {
      if (editMode === 'CORRECTION' && selectedNote) {
        await createDispute({
          statement: noteInput,
          meetingId,
          noteId: selectedNote._id
        });
        const disputesRes = await getAllDisputes({ meetingId });
        if (disputesRes.success) setDisputes(disputesRes.data);
      }
      setShowInput(false);
      setNoteInput('');
    } catch (err) {
      console.error('Failed to submit correction:', err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="h-auto md:h-14 bg-white border-b border-gray-100 flex flex-col md:flex-row items-center justify-between px-4 md:px-6 py-3 md:py-0 flex-shrink-0 gap-3 md:gap-0">
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleNav}
              className="lg:hidden p-1.5 text-slate-600 hover:bg-slate-50 rounded-md transition-colors"
            >
              <Menu size={18} />
            </button>
            <LayoutGrid className="text-slate-900" size={18} />
            <span className="font-extrabold text-sm text-slate-900 tracking-tight">MeetingminD</span>
          </div>
          <div className="hidden md:block h-6 w-px bg-gray-100 mx-1" />
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-[11px] md:text-[13px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Topic:</span>
            <span className="text-[11px] md:text-[13px] font-bold text-slate-900 uppercase tracking-tight truncate max-w-[150px] md:max-w-none">
              [{meeting?.agenda || 'Strategic Q4 Growth Sync'}]
            </span>
          </div>
        </div>
        <div className="flex items-center justify-center w-full md:w-auto gap-4 py-1 md:py-0 border-t md:border-t-0 border-gray-50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-[11px] md:text-[13px] font-semibold text-gray-600 uppercase tracking-wider">LIVE RECORDING</span>
          </div>
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col border-r border-gray-100">
          <div className="flex border-b border-gray-100 px-4 overflow-x-auto no-scrollbar whitespace-nowrap scroll-smooth">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3.5 mr-6 text-[13px] md:text-[14px] transition-all flex-shrink-0 ${activeTab === tab
                  ? 'text-[#1e2d47] font-semibold border-b-2 border-[#1e2d47]'
                  : 'text-gray-400 hover:text-gray-600'
                  }`}
                style={activeTab === tab ? { marginBottom: '-1px' } : {}}
              >
                {tab}
              </button>
            ))}
          </div>
          {activeTab === 'Live Feed' && (
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loading && notes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-40">
                  <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin mb-4" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Syncing Feed...</p>
                </div>
              ) : notes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-100 rounded-lg mx-4">
                  <p className="text-xs font-bold text-slate-300 uppercase tracking-widest text-center px-10">Waiting for session nodes... Notes will appear here as they are captured.</p>
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
                            </div>
                            <div className="flex items-center gap-2">
                              {isScribeNote && !dispute && (
                                <button
                                  className="text-gray-300 hover:text-amber-500 transition-colors flex items-center gap-1 active:scale-95"
                                  onClick={() => handleCorrection(note)}
                                >
                                  <PlusCircle size={13} />
                                  <span className="text-[10px] font-bold uppercase">CORRECTION</span>
                                </button>
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
          {activeTab === 'Live Canvas' && (
            <div className="flex-1 bg-slate-50 relative overflow-hidden">
              <LiveCanvas
                readOnly={!isScribe}
                embedded={true}
                suppressEndModal={true}
              />
            </div>
          )}
          {activeTab === 'Live Feed' && showInput && (
            <div className="border-t border-gray-100 px-4 py-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-50 animate-in slide-in-from-bottom duration-300">
              <div className="flex items-center gap-3 flex-1 overflow-hidden">
                <div className="flex items-center gap-2 text-gray-400 flex-shrink-0">
                  <LayoutGrid size={16} />
                </div>
                <div className="flex-1 flex flex-col overflow-hidden">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    {editMode === 'CORRECTION' ? 'FLAGGING CORRECTION' : 'EDITING PRIVATE NOTE'}
                  </span>
                  <input
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    placeholder="Update your note or fix a mistake..."
                    className="w-full text-[13px] md:text-[14px] text-gray-600 outline-none bg-transparent placeholder-gray-300 truncate"
                    autoFocus
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                <button
                  className="px-3 py-1.5 text-[10px] md:text-[11px] font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
                  onClick={() => setShowInput(false)}
                >
                  CANCEL
                </button>
                <button
                  className="px-6 py-2 bg-slate-900 text-white text-[10px] md:text-[11px] font-bold hover:bg-black transition-colors uppercase tracking-widest shadow-sm"
                  onClick={handleSubmit}
                >
                  SUBMIT
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Modal
        isOpen={showEndModal}
        onClose={() => { }}
        title="Session Terminated"
      >
        <div className="flex flex-col items-center py-6 text-center">
          <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-6 animate-bounce">
            <AlertTriangle size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2 uppercase tracking-tight">The Meeting Has Ended</h3>
          <p className="text-sm text-slate-500 leading-relaxed mb-8 px-4 font-medium">
            The organizer has concluded this session. Please provide your anonymous feedback to help improve future meetings.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full px-2">
            <button
              onClick={() => navigate('/attendee/dashboard')}
              className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-sm text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
            >
              <Home size={14} />
              Skip
            </button>
            <button
              onClick={() => navigate(`/attendee/feedback/${meetingId}`)}
              className="px-6 py-3 bg-slate-900 text-white rounded-sm text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-2"
            >
              Feedback
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default LiveSession
