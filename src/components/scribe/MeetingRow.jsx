import React from 'react';
import Button from '../common/Button';

const MeetingRow = ({ meeting }) => {
  return (
    <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center transition-colors duration-200 hover:bg-slate-50 last:border-b-0">
      <div className="flex flex-col">
        <span className="text-[0.75rem] font-bold text-slate-400 uppercase tracking-widest block mb-1">{meeting.day}</span>
        <h4 className="text-[1rem] font-bold text-slate-800 leading-tight mb-1">{meeting.title}</h4>
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <span>{meeting.time}</span>
          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
          <span>{meeting.company}</span>
        </div>
      </div>
      <Button variant="outline" size="sm">View Agenda</Button>
    </div>
  );
};

export default MeetingRow;
