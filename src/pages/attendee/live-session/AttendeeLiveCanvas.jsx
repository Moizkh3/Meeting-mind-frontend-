import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useOutletContext } from 'react-router-dom';
import ParticipantCard from '../../../components/scribe/ParticipantCard';
import StickyNote from '../../../components/scribe/StickyNote';
import MeetingHeader from '../../../components/scribe/MeetingHeader';
import IntelligenceSidebar from '../../../components/scribe/IntelligenceSidebar';
import CanvasControls from '../../../components/scribe/CanvasControls';
import MiniMap from '../../../components/scribe/MiniMap';
import CanvasTopicBar from '../../../components/scribe/live-canvas/CanvasTopicBar';
import CanvasLayer from '../../../components/scribe/live-canvas/CanvasLayer';
import '../../scribe/live-canvas/LiveCanvas.css';
import '../../../components/scribe/Scribe.css';

const AttendeeLiveCanvas = ({ readOnly = false, embedded = false, notes: notesProp = [], participants: participantsProp = [], organizer = null, agenda = "" }) => {
  const { toggleNav, isNavOpen } = useOutletContext() || {};
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isPanning, setIsPanning] = useState(false);
  const [isPanningMode, setIsPanningMode] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [selectedParticipantId, setSelectedParticipantId] = useState(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [activeCanvasTab, setActiveCanvasTab] = useState('assigned'); // 'assigned' | 'general'
  const [meetingTopic, setMeetingTopic] = useState(agenda || "Live Meeting Sync");

  const containerRef = useRef(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const positionsRef = useRef({}); // Internal storage for persistent positions
  const zIndexRef = useRef({}); // Internal storage for persistent zIndex

  // State for dynamic notes and participants
  const [notes, setNotes] = useState([]);
  const [localParticipants, setLocalParticipants] = useState([]);
  const [topZ, setTopZ] = useState(10);

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
          left: `${pLeft + 360 + (col * 240)}px`
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

  // SYNC PROPS TO LOCAL STATE
  useEffect(() => {
    const allParticipantsInMeeting = [];
    const processedIds = new Set();

    if (organizer) {
      allParticipantsInMeeting.push({
        id: organizer._id,
        name: organizer.name,
        isOrganizer: true,
        user: organizer
      });
      processedIds.add(organizer._id);
    }

    participantsProp.forEach(p => {
      if (p.user && !processedIds.has(p.user._id)) {
        allParticipantsInMeeting.push({
          id: p.user._id,
          name: p.user.name,
          isPresent: p.isPresent,
          isScriber: p.isScriber,
          user: p.user
        });
        processedIds.add(p.user._id);
      }
    });

    if (agenda && agenda !== meetingTopic) {
      setMeetingTopic(agenda);
    }

    setLocalParticipants(prev => {
      return allParticipantsInMeeting.map((p, index) => {
        if (!positionsRef.current[p.id]) {
          const angle = (index / (allParticipantsInMeeting.length || 1)) * Math.PI * 2;
          const radius = 600;
          positionsRef.current[p.id] = {
            top: `${2500 + Math.sin(angle) * radius}px`,
            left: `${2500 + Math.cos(angle) * radius}px`
          };
          zIndexRef.current[p.id] = 5;
        }

        return {
          id: p.id,
          name: p.name,
          avatar: p.user?.profilePicture?.url || null,
          isSpeaking: false,
          isLive: p.isPresent ?? true,
          isOrganizer: p.isOrganizer,
          isScriber: p.isScriber,
          lastTranscript: p.isOrganizer ? "Organizing..." : (p.isScriber ? "Scribing..." : "Listening..."),
          position: positionsRef.current[p.id],
          zIndex: zIndexRef.current[p.id] || 5,
          color: p.isOrganizer ? '#F97316' : '#2c3a4f'
        };
      });
    });

    setNotes(prev => {
      const updatedNotes = notesProp.map((n, index) => {
        if (!positionsRef.current[n._id]) {
          const creatorPos = positionsRef.current[n.user?._id || n.user];
          if (creatorPos) {
            const cTop = parseInt(creatorPos.top);
            const cLeft = parseInt(creatorPos.left);
            positionsRef.current[n._id] = {
              top: `${cTop + 40 + (index % 3) * 50}px`,
              left: `${cLeft + 360 + (index % 2) * 20}px`
            };
          } else {
            positionsRef.current[n._id] = {
              top: `${2200 + (index * 20) % 800}px`,
              left: `${2800 + (Math.floor(index / 5) * 250)}px`
            };
          }
          zIndexRef.current[n._id] = 5;
        }

        return {
          id: n._id,
          participantId: n.user?._id || n.user,
          text: n.statement,
          tag: n.topic || 'GENERAL',
          time: new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          position: positionsRef.current[n._id],
          zIndex: zIndexRef.current[n._id] || 5
        };
      });
      return updatedNotes;
    });

  }, [participantsProp, notesProp, organizer, agenda]);

  const updateParticipantPos = (id, pos) => {
    positionsRef.current[id] = pos;
    const newZ = Math.max(...Object.values(zIndexRef.current), 5) + 1;
    zIndexRef.current[id] = newZ;
    setTopZ(newZ);
    setLocalParticipants(prev => prev.map(p =>
      p.id === id ? { ...p, position: pos, zIndex: newZ } : p
    ));
  };

  const updateNotePos = (id, pos) => {
    positionsRef.current[id] = pos;
    const newZ = Math.max(...Object.values(zIndexRef.current), 5) + 1;
    zIndexRef.current[id] = newZ;
    setTopZ(newZ);
    setNotes(prev => prev.map(n =>
      n.id === id ? { ...n, position: pos, zIndex: newZ } : n
    ));
  };

  const updateNoteText = (id, text) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, text } : n));
  };

  const handleDeleteNote = (id) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const handleAddNote = (pId = null) => {
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

    const newId = `note-${Date.now()}`;
    const newNote = {
      id: newId,
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
  };

  const handleTopicChange = (newTopic) => {
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

  return (
    <div className={`${embedded ? 'h-full w-full' : 'h-screen'} flex flex-col bg-slate-50 overflow-hidden`}>
      {!embedded && (
        <div className="sticky top-0 z-[70] bg-white w-full border-b border-slate-200 shadow-sm">
          <MeetingHeader
            activeCanvasTab={activeCanvasTab}
            onTabChange={setActiveCanvasTab}
            onSidebarToggle={toggleSidebar}
            onNavToggle={toggleNav}
            isNavOpen={isNavOpen}
            readOnly={readOnly}
          />
          <CanvasTopicBar meetingTopic={meetingTopic} />
        </div>
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
          onNavigateToNote={handleNavigateToNote}
          selectedParticipantId={selectedParticipantId}
          participants={localParticipants}
          isOpen={!embedded && isSidebarOpen}
          onToggle={toggleSidebar}
          onTopicChange={handleTopicChange}
        />
      </div>
    </div>
  );
};

export default AttendeeLiveCanvas;
