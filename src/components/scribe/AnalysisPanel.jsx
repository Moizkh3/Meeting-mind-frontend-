import React from 'react';
import Card from '../common/Card';

const AnalysisPanel = ({ data }) => {
  const { summary, actionItems, metadata } = data;

  return (
    <div className="flex flex-col gap-6">
      <Card title="AI Intelligence" headerActions={<span className="text-xs text-slate-400">v2.4 Active</span>}>
        <div className="mb-8 last:mb-0">
          <h4 className="text-[0.7rem] font-extrabold text-slate-400 uppercase tracking-widest mb-3">Automated Summary</h4>
          <div className="m-0">
            <p className="text-[0.8125rem] leading-relaxed text-slate-600 italic m-0">{summary}</p>
          </div>
        </div>
        <div className="mb-8 last:mb-0">
          <h4 className="text-[0.7rem] font-extrabold text-slate-400 uppercase tracking-widest mb-3">Action Items</h4>
          <div className="flex flex-col gap-3">
            {actionItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 text-[0.8125rem]">
                <input type="checkbox" readOnly checked={item.completed} className="w-3.5 h-3.5 rounded-sm border border-slate-200" />
                <span className="text-slate-700">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card title="Meeting Records">
        {metadata.map((m, idx) => (
          <div key={idx} className="flex justify-between py-3 border-b border-slate-50 last:border-b-0 px-6">
            <span className="text-[0.75rem] text-slate-400 font-medium">{m.label}</span>
            <span className="text-[0.75rem] font-bold text-slate-800">{m.value}</span>
          </div>
        ))}
      </Card>
    </div>
  );
};

export default AnalysisPanel;
