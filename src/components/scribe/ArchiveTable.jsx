import React from 'react';

const ArchiveTable = ({ records }) => {
  return (
    <div className="-mx-6 -my-6 overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="text-left px-6 py-4 text-[0.7rem] font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-200 bg-slate-50">Record Name</th>
            <th className="text-left px-6 py-4 text-[0.7rem] font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-200 bg-slate-50">Date</th>
            <th className="text-left px-6 py-4 text-[0.7rem] font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-200 bg-slate-50">Session Time</th>
            <th className="text-left px-6 py-4 text-[0.7rem] font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-200 bg-slate-50">Organization</th>
            <th className="text-left px-6 py-4 text-[0.7rem] font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-200 bg-slate-50">Action</th>
          </tr>
        </thead>
        <tbody>
          {records.map((item) => (
            <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-6 py-5 text-[0.875rem] text-slate-800 border-b border-slate-100 font-bold">{item.title}</td>
              <td className="px-6 py-5 text-[0.875rem] text-slate-500 border-b border-slate-100">{item.date}</td>
              <td className="px-6 py-5 text-[0.875rem] text-slate-500 border-b border-slate-100">{item.time}</td>
              <td className="px-6 py-5 text-[0.875rem] text-slate-500 border-b border-slate-100">{item.organization}</td>
              <td className="px-6 py-5 border-b border-slate-100">
                <button className="text-[0.75rem] font-bold text-slate-500 uppercase border border-slate-200 px-3 py-1.5 rounded-sm bg-transparent hover:bg-white hover:border-slate-800 hover:text-slate-800 transition-all cursor-pointer">
                  Open File
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ArchiveTable;
