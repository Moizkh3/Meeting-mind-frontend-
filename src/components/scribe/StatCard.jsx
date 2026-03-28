import React from 'react';
import Card from '../common/Card';

const StatCard = ({ label, value, trend, color = 'var(--primary)' }) => {
  return (
    <Card className="">
      <div className="py-8 px-6 flex flex-col">
        <span className="block text-[0.7rem] font-extrabold text-slate-400 uppercase tracking-widest mb-2">{label}</span>
        <h3 className="text-[2.5rem] font-extrabold mb-1 tracking-tight" style={{ color }}>{value}</h3>
        <span className="text-[0.75rem] text-emerald-500 font-semibold">{trend}</span>
      </div>
    </Card>
  );
};

export default StatCard;
