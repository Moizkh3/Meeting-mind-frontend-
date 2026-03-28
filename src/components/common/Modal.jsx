import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, maxWidth = "max-w-md" }) => {
  // Prevent scrolling on body when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      {/* Backdrop with elegant glassmorphism, NO black shadow */}
      <div 
        className="absolute inset-0 bg-slate-400/20 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Content Box */}
      <div className={`relative bg-white rounded-2xl w-full ${maxWidth} border border-slate-200/60 shadow-sm overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]`}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white/80 backdrop-blur-md z-10 sticky top-0">
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">{title}</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[75vh]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
