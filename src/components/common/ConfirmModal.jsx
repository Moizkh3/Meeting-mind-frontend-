import React, { useEffect } from 'react';
import { X, AlertTriangle, Trash2, Loader2 } from 'lucide-react';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Delete Data?", 
  message = "Are you sure you want to delete this? This action cannot be undone.",
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  isLoading = false,
  variant = "danger" // 'danger' | 'warning' | 'info'
}) => {
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

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  const variantStyles = {
    danger: {
      iconBg: "bg-rose-50",
      iconColor: "text-rose-500",
      buttonBg: "bg-rose-500 hover:bg-rose-600 shadow-[0_4px_12px_rgba(244,63,94,0.3)]",
      icon: <Trash2 size={24} />
    },
    warning: {
      iconBg: "bg-amber-50",
      iconColor: "text-amber-500",
      buttonBg: "bg-amber-500 hover:bg-amber-600 shadow-[0_4px_12px_rgba(245,158,11,0.3)]",
      icon: <AlertTriangle size={24} />
    }
  };

  const style = variantStyles[variant] || variantStyles.danger;

  return (
    <div 
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 text-center">
          <div className="mb-4 flex justify-center">
            <div className={`w-14 h-14 rounded-full ${style.iconBg} flex items-center justify-center ${style.iconColor} ring-8 ring-white shadow-sm`}>
              {style.icon}
            </div>
          </div>
          
          <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
          <p className="text-sm text-slate-500 leading-relaxed px-4">{message}</p>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
          <button 
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 text-[11px] font-bold text-slate-500 bg-white border border-slate-200 rounded hover:bg-slate-100 transition-all uppercase tracking-widest shadow-sm disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button 
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2.5 text-[11px] font-bold text-white rounded transition-all uppercase tracking-widest shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 ${style.buttonBg}`}
          >
            {isLoading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Processing...
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
