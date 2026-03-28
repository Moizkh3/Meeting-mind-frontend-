import React from 'react';
import CanvasConnectors from './CanvasConnectors';
import ParticipantCard from '../ParticipantCard';
import StickyNote from '../StickyNote';

const CanvasLayer = ({
  activeCanvasTab,
  localParticipants = [],
  notes = [],
  hiddenParticipantIds = new Set(),
  onToggleNotes,
  zoom,
  selectedParticipantId,
  updateParticipantPos,
  handleAddNote,
  setSelectedParticipantId,
  updateNotePos,
  updateNoteText,
  handleDeleteNote,
  readOnly = false
}) => {
  return (
    <>
      {/* SVG Connector Layer */}
      {activeCanvasTab === 'assigned' && (
        <CanvasConnectors 
          notes={notes.filter(n => n.participantId !== 'general' && !hiddenParticipantIds.has(n.participantId))} 
          participants={localParticipants} 
        />
      )}

      {/* Participants */}
      {activeCanvasTab === 'assigned' && localParticipants.map((p) => (
        <ParticipantCard 
          key={p.id} 
          participant={p} 
          onUpdatePos={(pos) => updateParticipantPos(p.id, pos)}
          onAddNote={(id) => {
            setSelectedParticipantId(id);
            handleAddNote(id);
          }}
          onToggleNotes={() => onToggleNotes(p.id)}
          onSelect={setSelectedParticipantId}
          isNotesHidden={hiddenParticipantIds.has(p.id)}
          zoom={zoom}
          isSelected={p.id === selectedParticipantId}
          readOnly={readOnly}
        />
      ))}

      {/* Sticky Notes */}
      {notes.filter(n => {
         if (hiddenParticipantIds.has(n.participantId)) return false;
         return activeCanvasTab === 'general' ? n.participantId === 'general' : n.participantId !== 'general';
      }).map((note) => (
        <StickyNote 
          key={note.id} 
          note={note} 
          onUpdatePos={(pos) => updateNotePos(note.id, pos)}
          onUpdateText={(text) => updateNoteText(note.id, text)}
          onDelete={() => handleDeleteNote(note.id)}
          zoom={zoom}
          readOnly={readOnly}
        />
      ))}
    </>
  );
};

export default CanvasLayer;
