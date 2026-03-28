import React from 'react';

const CanvasConnectors = ({ notes, participants }) => {
  return (
    <svg className="connectors-layer">
      {notes.map(note => {
        const participant = participants.find(p => p.id === note.participantId);
        if (!participant) return null;
        
        const pX = parseInt(participant.position.left) + 144; // w-72 center
        const pY = parseInt(participant.position.top) + 40;   // upper part of card
        const nX = parseInt(note.position.left) + 110;        // sticky note center roughly
        const nY = parseInt(note.position.top) + 110;
        
        return (
          <line 
            key={`line-${note.id}`}
            x1={pX} y1={pY} x2={nX} y2={nY}
            stroke={participant.id === 'p1' ? '#F97316' : '#2563EB'}
            strokeWidth="2"
            strokeDasharray="6 6"
            opacity="0.3"
          />
        );
      })}
    </svg>
  );
};

export default CanvasConnectors;
