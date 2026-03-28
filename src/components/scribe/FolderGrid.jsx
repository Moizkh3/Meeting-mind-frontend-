import React from 'react';
import Card from '../common/Card';

const FolderGrid = ({ folders }) => {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-6">
      {folders.map((folder, idx) => (
        <Card key={idx} className="">
          <div className="py-8 px-6 flex flex-col items-center justify-center text-center">
            <span className="text-[2.5rem] font-extrabold text-slate-800 leading-none mb-2">{folder.count}</span>
            <h4 className="text-[0.75rem] font-bold text-slate-400 uppercase tracking-widest m-0">{folder.label}</h4>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default FolderGrid;
