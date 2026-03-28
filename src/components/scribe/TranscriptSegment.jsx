import React from 'react';

const TranscriptSegment = ({ segment }) => {
  return (
    <div className="flex flex-col gap-1 mb-6 last:mb-0">
      <span className="text-[0.75rem] font-bold text-slate-800 uppercase leading-none">{segment.speaker}:</span>
      <p className="text-[0.875rem] leading-relaxed text-slate-600 m-0">{segment.text}</p>
    </div>
  );
};

export default TranscriptSegment;
