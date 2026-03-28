import React from 'react';

const ResourceList = ({ items, color = '#1E293B' }) => {
  return (
    <div className="flex flex-col gap-6">
      {items.map((item, idx) => (
        <div key={idx} className="flex flex-col gap-2">
          <div className="flex justify-between items-baseline">
            <span className="text-[0.8125rem] font-semibold text-slate-600">{item.name}</span>
            <span className="text-[0.625rem] font-bold text-slate-400">{item.load}%</span>
          </div>
          <div className="h-1 bg-slate-100 rounded-sm overflow-hidden">
            <div 
              className="h-full" 
              style={{ width: `${item.load}%`, backgroundColor: color }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ResourceList;
