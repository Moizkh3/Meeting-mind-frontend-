import React, { useState, useRef, useEffect } from 'react';

const MiniMap = ({ participants, notes, offset, zoom, containerSize }) => {
  // MiniMap Position Tracking
  const [mapPos, setMapPos] = useState({ bottom: 40, right: 40 });
  const [isMapDragging, setIsMapDragging] = useState(false);
  const mapDragRef = useRef({ x: 0, y: 0 });

  const MAP_SIZE = 150;
  const WORLD_SIZE = 5000;
  const ratio = MAP_SIZE / WORLD_SIZE;

  // Viewport calculation
  const viewWidth = (containerSize.width / zoom) * ratio;
  const viewHeight = (containerSize.height / zoom) * ratio;
  const viewX = (2500 - (offset.x / zoom)) * ratio - (viewWidth / 2);
  const viewY = (2500 - (offset.y / zoom)) * ratio - (viewHeight / 2);

  const startDrag = (e) => {
    setIsMapDragging(true);
    mapDragRef.current = { x: e.clientX, y: e.clientY };
    e.stopPropagation();
    e.preventDefault();
  };

  useEffect(() => {
    const onDrag = (e) => {
      if (!isMapDragging) return;
      const dx = mapDragRef.current.x - e.clientX;
      const dy = mapDragRef.current.y - e.clientY;
      setMapPos(prev => ({
        bottom: prev.bottom + dy,
        right: prev.right + dx
      }));
      mapDragRef.current = { x: e.clientX, y: e.clientY };
    };

    const stopDrag = () => setIsMapDragging(false);

    if (isMapDragging) {
      window.addEventListener('mousemove', onDrag);
      window.addEventListener('mouseup', stopDrag);
    }
    return () => {
      window.removeEventListener('mousemove', onDrag);
      window.removeEventListener('mouseup', stopDrag);
    };
  }, [isMapDragging]);

  return (
    <div 
      className={`absolute w-[150px] h-[150px] bg-white/95 backdrop-blur-md rounded-xl border-[1.5px] p-1.5 z-[9999] flex flex-col gap-1 select-none transition-shadow ${isMapDragging ? 'shadow-[0_12px_30px_rgba(0,0,0,0.15)] border-slate-400' : 'shadow-[0_4px_20px_rgba(0,0,0,0.1)] border-slate-300'}`}
      style={{ 
        bottom: `${mapPos.bottom}px`, 
        right: `${mapPos.right}px`
      }}
    >
      <div className="flex flex-col items-center gap-0.5 cursor-grab py-0.5 active:cursor-grabbing" onMouseDown={startDrag}>
        <div className="w-5 h-0.5 bg-slate-200 rounded-[1px]" />
        <span className="text-[8px] font-extrabold text-slate-400 tracking-widest">RADAR</span>
      </div>
      <div className="relative w-full flex-1 bg-slate-50 rounded-md overflow-hidden border border-slate-100">
        {/* Participants */}
        {participants.map(p => (
          <div 
            key={p.id}
            className="absolute w-[5px] h-[5px] rounded-full -translate-x-1/2 -translate-y-1/2 transition-all duration-200 z-[2] border border-white shadow-[0_1px_2px_rgba(0,0,0,0.1)]"
            style={{ 
              left: parseInt(p.position.left) * ratio, 
              top: parseInt(p.position.top) * ratio,
              background: p.color
            }}
          />
        ))}

        {/* Notes */}
        {notes.map(n => (
          <div 
            key={n.id}
            className="absolute rounded-full -translate-x-1/2 -translate-y-1/2 transition-all duration-200 bg-yellow-400 w-[3px] h-[3px] z-[1]"
            style={{ 
              left: parseInt(n.position.left) * ratio, 
              top: parseInt(n.position.top) * ratio 
            }}
          />
        ))}

        {/* Viewport Indicator */}
        <div className="absolute border-[1.5px] border-blue-500 bg-blue-500/10 pointer-events-none transition-all duration-100 ease-out" style={{
          left: viewX,
          top: viewY,
          width: viewWidth,
          height: viewHeight
        }} />
      </div>
    </div>
  );
};

export default MiniMap;
