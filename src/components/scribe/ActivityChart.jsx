import React from 'react';

const ActivityChart = ({ data, color = '#6366F1' }) => {
  return (
    <div className="h-[240px] flex flex-col justify-end pt-8">
      <div className="flex items-end justify-between h-full px-4 gap-4">
        {data.map((item, i) => (
          <div 
            key={i} 
            className="flex-1 rounded-[1px] transition-opacity duration-200 hover:opacity-80" 
            style={{ 
              height: `${item.value}%`,
              backgroundColor: color 
            }}
            title={`${item.day}: ${item.value}%`}
          ></div>
        ))}
      </div>
      <div className="flex justify-between px-4 pt-4 text-[0.7rem] font-bold text-slate-400">
        {data.map((item, i) => (
          <span key={i}>{item.day}</span>
        ))}
      </div>
    </div>
  );
};

export default ActivityChart;
