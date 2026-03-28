import React, { useState, useRef, useEffect } from 'react';
import { useOutletContext, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import axiosInstance from '../../../api/axiosinstance';
import ParticipantCard from '../../../components/scribe/ParticipantCard';
import StickyNote from '../../../components/scribe/StickyNote';
import MeetingHeader from '../../../components/scribe/MeetingHeader';
import IntelligenceSidebar from '../../../components/scribe/IntelligenceSidebar';
import CanvasControls from '../../../components/scribe/CanvasControls';
import MiniMap from '../../../components/scribe/MiniMap';
import CanvasLayer from '../../../components/scribe/live-canvas/CanvasLayer';
import { participants, stickyNotes, intelligenceNotes } from '../../../data/scribe/liveCanvasData';
import Modal from '../../../components/common/Modal';
import { AlertTriangle, Home, ArrowRight } from 'lucide-react';
import './LiveCanvas.css';
import '../../../components/scribe/Scribe.css';

const LiveCanvas = ({ readOnly = false, embedded = false, suppressEndModal = false }) => {
  const { toggleNav, isNavOpen } = useOutletContext() || {};
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isPanning, setIsPanning] = useState(false);
  const [isPanningMode, setIsPanningMode] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [selectedParticipantId, setSelectedParticipantId] = useState(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [searchParams] = useSearchParams();
  const meetingId = searchParams.get('meetingId');

  const [activeCanvasTab, setActiveCanvasTab] = useState('assigned'); // 'assigned' | 'general'
  const [meetingTopic, setMeetingTopic] = useState("Strategic Q4 Growth Sync");

  // State for notes and participants
  const [notes, setNotes] = useState([]);
  const [transcriptMessages, setTranscriptMessages] = useState([]);
  const [localParticipants, setLocalParticipants] = useState([]);
  const [topZ, setTopZ] = useState(10);

  const [showEndModal, setShowEndModal] = useState(false);
  const showEndModalRef = useRef(false);
  const [isScribeRole, setIsScribeRole] = useState(false);
  const [isOrganizerRole, setIsOrganizerRole] = useState(false);
  const navigate = useNavigate();
  const meetingTopicRef = useRef(meetingTopic);

  const [hiddenParticipantIds, setHiddenParticipantIds] = useState(new Set());

  // Keep refs in sync to avoid stale closures in setInterval
  useEffect(() => { showEndModalRef.current = showEndModal; }, [showEndModal]);
  useEffect(() => { meetingTopicRef.current = meetingTopic; }, [meetingTopic]);

  // Status-only poll (lightweight, doesn't touch notes or participants)
  const pollMeetingStatus = async () => {
    if (!meetingId) return;
    if (showEndModalRef.current) return; // Already showing modal, skip
    try {
      const res = await axiosInstance.get(`/meetings/id/${meetingId}`);
      const meetingData = res.data?.data?.meeting;
      if (meetingData?.meetingStatus === 'completed' && !showEndModalRef.current && !suppressEndModal) {
        showEndModalRef.current = true;
        setShowEndModal(true);
      }
    } catch (err) {
      console.error("Status polling failed:", err);
    }
  };

  const fetchMeetingForCanvas = async () => {
    try {
      const res = await axiosInstance.get(`/meetings/id/${meetingId}`);
      const meetingData = res.data?.data?.meeting;

      if (meetingData) {
        setMeetingTopic(meetingData.agenda || "Meeting Discussion");

        const isOrg = (String(meetingData.organizedBy?._id) === String(user?._id || "")) ||
          (String(meetingData.organizedBy) === String(user?._id || ""));
        const isScribeMatch = isOrg ||
          (String(meetingData.scriber) === String(user?._id || "")) ||
          meetingData.attendees?.some(a => String(a.user?._id || a.user || "") === String(user?._id || "") && a.isScriber);

        setIsScribeRole(isScribeMatch);
        setIsOrganizerRole(isOrg);

        if (!isScribeMatch && !readOnly) {
          console.warn("Unauthorized access to Scribe Canvas. Redirecting to Live Session.");
          navigate(`/attendee/live-session?meetingId=${meetingId}`);
          return;
        }

        // Map real DB attendees to canvas participants
        const mappedParticipants = (meetingData.attendees || []).map((att, i) => {
          const displayName = att.user?.name || att.nameForUnregisteredAttendee || "Attendee";
          const uid = att.user?._id || `guest-${i}`;

          // Use stable position calculation based on index
          const topOffset = 2200 + (Math.floor(i / 2) * 200);
          const leftOffset = 2100 + ((i % 2) * 400);

          return {
            id: uid,
            name: displayName,
            avatar: (att.user?.profilePicture?.url && att.user.profilePicture.url.startsWith('http')) ? att.user.profilePicture.url : null,
            isSpeaking: false,
            isLive: att.isPresent || false,
            lastTranscript: "",
            position: { top: `${topOffset}px`, left: `${leftOffset}px` },
            color: '#E2E8F0',
            zIndex: 5
          };
        });

        setLocalParticipants(mappedParticipants);

        // FETCH NOTES / TRANSCRIPT (ONCE)
        const notesRes = await axiosInstance.get(`/notes/getAllNotes?meetingId=${meetingId}`);
        if (notesRes.data?.success) {
          const dbNotes = notesRes.data.data || [];
          setTranscriptMessages(dbNotes);

          // Convert DB notes to canvas sticky notes if they aren't topics
          const mappedStickyNotes = dbNotes.filter(n => n.topic !== '#TOPIC').map((n, index) => {
            // Preservation Logic: If note already exists in state, keep its position/zIndex
            const existingNote = notes.find(prev => prev.id === n._id);
            if (existingNote) {
              return {
                ...existingNote,
                text: n.statement,
                title: n.topic || "Note"
              };
            }

            const participant = mappedParticipants.find(p => p.id === String(n.user?._id || n.user));
            const pTop = participant ? parseInt(participant.position.top) : 2400;
            const pLeft = participant ? parseInt(participant.position.left) : 2500;

            return {
              id: n._id,
              participantId: n.user?._id || n.user,
              title: n.topic || "Note",
              text: n.statement,
              tag: n.topic === '#URGENT' ? '#URGENT' : '#NOTE',
              time: new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              position: {
                top: `${pTop + 40 + (index * 20)}px`,
                left: `${pLeft + 360 + (index * 20)}px`
              },
              zIndex: 5
            };
          });

          // Also handle topics as special notes in general tab
          const mappedTopics = dbNotes.filter(n => n.topic === '#TOPIC').map((n, index) => {
            const existingTopic = notes.find(prev => prev.id === n._id);
            if (existingTopic) {
              return {
                ...existingTopic,
                title: n.statement
              };
            }

            return {
              id: n._id,
              participantId: 'general',
              title: n.statement,
              text: '',
              tag: '#TOPIC',
              time: new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              position: { top: `${2100 + (index * 150)}px`, left: '1800px' },
              zIndex: 5
            };
          });

          setNotes([...mappedStickyNotes, ...mappedTopics]);
        }
        if (meetingData.meetingStatus === 'completed' && !showEndModal && !suppressEndModal) {
          setShowEndModal(true);
        }
      }
    } catch (err) {
      console.error("Failed to fetch meeting details for Canvas:", err);
    }
  };

  useEffect(() => {
    if (!meetingId) return;
    fetchMeetingForCanvas();
    const interval = setInterval(pollMeetingStatus, 3000); // DO NOT fetch everything in the interval
    return () => clearInterval(interval);
  }, [meetingId]);

  const containerRef = useRef(null);
  const dragStart = useRef({ x: 0, y: 0 });

  // Track container size for MiniMap viewport
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const handleZoom = (delta) => {
    setZoom(prev => {
      const newZoom = Math.min(Math.max(prev + delta, 0.2), 3);
      return parseFloat(newZoom.toFixed(2));
    });
  };

  const handleRecenter = () => {
    setOffset({ x: 0, y: 0 });
    setZoom(1);
    setSelectedParticipantId(null);
  };

  const handleAutoTidy = () => {
    const grouped = notes.reduce((acc, note) => {
      if (!note.participantId) return acc;
      if (!acc[note.participantId]) acc[note.participantId] = [];
      acc[note.participantId].push(note);
      return acc;
    }, {});

    setNotes(prevNotes => prevNotes.map(note => {
      const pId = note.participantId;
      if (!pId) return note;
      const participant = localParticipants.find(p => p.id === pId);
      if (!participant) return note;

      const pTop = parseInt(participant.position.top);
      const pLeft = parseInt(participant.position.left);

      const pNotes = grouped[pId];
      const index = pNotes.findIndex(n => n.id === note.id);
      const col = index % 2;
      const row = Math.floor(index / 2);

      return {
        ...note,
        position: {
          top: `${pTop + 40 + (row * 240)}px`,
          left: `${pLeft + 360 + (col * 240)}px` // Position to the right of the card
        }
      };
    }));
  };

  const handleNavigateToNote = (id) => {
    const note = notes.find(n => n.id === id);
    if (!note || !containerRef.current) return;
    setSelectedParticipantId(note.participantId || null);
    const top = parseInt(note.position.top);
    const left = parseInt(note.position.left);
    const containerWidth = containerRef.current.offsetWidth;
    const containerHeight = containerRef.current.offsetHeight;
    const canvasLeft = left - 2000;
    const canvasTop = top - 2000;
    const newOffsetX = (containerWidth / 2) - (canvasLeft * zoom) - (110 * zoom);
    const newOffsetY = (containerHeight / 2) - (canvasTop * zoom) - (110 * zoom);
    setOffset({ x: newOffsetX, y: newOffsetY });
  };

  const updateParticipantPos = (id, pos) => {
    setLocalParticipants(prev => prev.map(p =>
      p.id === id ? { ...p, position: pos, zIndex: topZ + 1 } : p
    ));
    setTopZ(prev => prev + 1);
  };

  const updateNotePos = (id, pos) => {
    setNotes(prev => prev.map(n =>
      n.id === id ? { ...n, position: pos, zIndex: topZ + 1 } : n
    ));
    setTopZ(prev => prev + 1);
  };

  const updateNoteText = async (id, text) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, text } : n));
    try {
      if (!id.startsWith('note-')) {
        await axiosInstance.put(`/notes/edit/${id}`, { statement: text });
      }
    } catch (err) {
      console.error("Failed to update note text:", err);
    }
  };

  const handleDeleteNote = async (id) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    try {
      if (!id.startsWith('note-')) {
        await axiosInstance.delete(`/notes/delete/${id}`);
      }
    } catch (err) {
      console.error("Failed to delete note:", err);
    }
  };

  const handleAddNote = async (pId = null) => {
    let positionObj = { top: '2500px', left: '2500px' };
    let participantId = null;

    const randomOffset = Math.floor(Math.random() * 50);

    if (activeCanvasTab === 'general') {
      participantId = 'general';
      positionObj = { top: `${2400 + randomOffset - (offset.y / zoom)}px`, left: `${2500 + randomOffset - (offset.x / zoom)}px` };
    } else {
      participantId = pId || selectedParticipantId;
      if (!participantId) {
        participantId = 'general';
        positionObj = { top: `${2400 + randomOffset - (offset.y / zoom)}px`, left: `${2500 + randomOffset - (offset.x / zoom)}px` };
        setActiveCanvasTab('general');
      } else {
        const participant = localParticipants.find(p => p.id === participantId);
        if (participant) {
          const pTop = parseInt(participant.position.top);
          const pLeft = parseInt(participant.position.left);
          positionObj = { top: `${pTop + 40 + randomOffset}px`, left: `${pLeft + 360 + randomOffset}px` };
        }
      }
    }

    const nId = `note-${Date.now()}`;
    const newNote = {
      id: nId,
      participantId: participantId,
      title: meetingTopic,
      text: '',
      tag: participantId === 'general' ? 'GENERAL NOTE' : 'ATTENDEE NOTE',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      position: positionObj,
      zIndex: topZ + 1
    };

    setNotes(prev => [...prev, newNote]);
    setTopZ(prev => prev + 1);
    if (participantId !== 'general') {
      setSelectedParticipantId(participantId);
    }

    // Persist to DB
    try {
      const currentTopic = meetingTopicRef.current;
      const res = await axiosInstance.post('/notes/create', {
        statement: "",
        topic: currentTopic || (participantId === 'general' ? 'General' : 'Attendee'),
        meetingId: meetingId,
        user: participantId === 'general' ? user?._id : participantId
      });

      if (res.data?.success && res.data.data?._id) {
        const realId = res.data.data._id;
        // Update the local note ID so that subsequent edits work!
        setNotes(prev => prev.map(n => n.id === nId ? { ...n, id: realId } : n));
      }
    } catch (err) {
      console.error("Failed to persist note:", err);
    }
  };

  const handleTopicChange = async (newTopic) => {
    setMeetingTopic(newTopic);

    let participantId = activeCanvasTab === 'general' ? 'general' : (selectedParticipantId || 'general');
    const randomOffset = Math.floor(Math.random() * 50);
    const pos = {
      top: `${2400 + randomOffset - (offset.y / zoom)}px`,
      left: `${2500 + randomOffset - (offset.x / zoom)}px`
    };

    const newNote = {
      id: `topic-${Date.now()}`,
      participantId: participantId,
      title: newTopic,
      text: '',
      tag: '#TOPIC',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      position: pos,
      zIndex: topZ + 1
    };
    setNotes(prev => [...prev, newNote]);
    setTopZ(prev => prev + 1);

    // Persist to DB
    try {
      await axiosInstance.post('/notes/create', {
        statement: newTopic,
        topic: '#TOPIC',
        meetingId: meetingId,
        user: user?._id // Scribe is the one creating the topic note
      });
    } catch (err) {
      console.error("Failed to persist topic note:", err);
    }
  };

  const handleToggleNotes = (pId) => {
    setHiddenParticipantIds(prev => {
      const next = new Set(prev);
      if (next.has(pId)) next.delete(pId);
      else next.add(pId);
      return next;
    });
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const handleMouseDown = (e) => {
    if (e.target.closest('.participant-card') || e.target.closest('.sticky-note') || e.target.closest('.canvas-controls-wrapper') || e.target.closest('.mini-map-container')) {
      return;
    }
    setSelectedParticipantId(null);
    if (isPanningMode || e.button === 1 || (e.button === 0 && (e.shiftKey || e.ctrlKey))) {
      setIsPanning(true);
      dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
      e.preventDefault();
    }
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isPanning) return;
      const newX = e.clientX - dragStart.current.x;
      const newY = e.clientY - dragStart.current.y;
      setOffset({ x: newX, y: newY });
    };
    const handleMouseUp = () => setIsPanning(false);
    if (isPanning) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isPanning]);

  const handleEndMeeting = async () => {
    if (window.confirm("Are you sure you want to end this meeting? All transcription and notes will be saved to the archive.")) {
      try {
        await axiosInstance.put(`/meetings/endMeeting/${meetingId}`);
      } catch (err) {
        console.error("Failed to end meeting from Canvas:", err);
        alert(err.response?.data?.message || err.message || "An error occurred while ending the meeting.");
      }
    }
  };

  return (
    <div className={`${embedded ? 'h-full w-full' : 'h-screen'} flex flex-col bg-[#F9FAFB] overflow-hidden`}>
      {/* HEADER */}
      {!embedded && (
        <MeetingHeader
          activeCanvasTab={activeCanvasTab}
          onTabChange={setActiveCanvasTab}
          onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          onNavToggle={toggleNav}
          isNavOpen={isNavOpen}
          attendees={localParticipants}
          meetingTopic={meetingTopic}
          onEndMeeting={handleEndMeeting}
          hideEndButton={!isOrganizerRole}
        />
      )}

      <div className="flex-1 flex overflow-hidden">
        <div
          className="flex-1 relative overflow-hidden bg-white transition-all duration-500 ease-in-out"
          ref={containerRef}
          onMouseDown={handleMouseDown}
          style={{ cursor: isPanningMode ? (isPanning ? 'grabbing' : 'grab') : 'auto' }}
        >
          <div className="canvas-wrapper dotted-grid"
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
              transition: isPanning ? 'none' : 'transform 0.1s ease-out'
            }}>

            <CanvasLayer
              activeCanvasTab={activeCanvasTab}
              localParticipants={localParticipants}
              notes={notes}
              hiddenParticipantIds={hiddenParticipantIds}
              onToggleNotes={handleToggleNotes}
              zoom={zoom}
              selectedParticipantId={selectedParticipantId}
              updateParticipantPos={updateParticipantPos}
              handleAddNote={handleAddNote}
              setSelectedParticipantId={setSelectedParticipantId}
              updateNotePos={updateNotePos}
              updateNoteText={updateNoteText}
              handleDeleteNote={handleDeleteNote}
              readOnly={readOnly}
            />
          </div>

          <CanvasControls
            onAddNote={() => handleAddNote()}
            zoom={zoom}
            onZoomIn={() => handleZoom(0.1)}
            onZoomOut={() => handleZoom(-0.1)}
            onRecenter={handleRecenter}
            isPanningMode={isPanningMode}
            onTogglePan={() => setIsPanningMode(!isPanningMode)}
            onAutoTidy={handleAutoTidy}
            readOnly={readOnly}
          />


        </div>

        <IntelligenceSidebar
          canvasNotes={notes}
          transcriptNotes={transcriptMessages}
          onNavigateToNote={handleNavigateToNote}
          selectedParticipantId={selectedParticipantId}
          participants={localParticipants}
          isOpen={!embedded && isSidebarOpen}
          onToggle={toggleSidebar}
          onTopicChange={handleTopicChange}
        />
      </div>
      {/* Meeting Ended Modal */}
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
              onClick={() => navigate(isOrganizerRole ? `/organization/meetings/feedback/${meetingId}` : `/attendee/feedback/${meetingId}`)}
              className="px-6 py-3 bg-slate-900 text-white rounded-sm text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-2"
            >
              Feedback
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LiveCanvas;
