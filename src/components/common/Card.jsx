import React from 'react';

const Card = ({ children, title, subtitle, className = '', footer, headerActions }) => {
  return (
    <div className={`bg-white border border-slate-200 rounded-sm flex flex-col overflow-hidden ${className}`}>
      {(title || headerActions) && (
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="flex flex-col">
            {title && <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest m-0">{title}</h3>}
            {subtitle && <p className="text-slate-500 text-[0.75rem] mt-1 m-0">{subtitle}</p>}
          </div>
          {headerActions && <div className="flex items-center">{headerActions}</div>}
        </div>
      )}
      <div className="p-4 md:p-6 flex-1">
        {children}
      </div>
      {footer && <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">{footer}</div>}
    </div>
  );
};

export default Card;
