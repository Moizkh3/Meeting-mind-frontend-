import React from 'react';

const Button = ({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  className = '' 
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center font-semibold rounded-sm transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
        ${variant === 'primary' ? 'bg-slate-800 text-white hover:bg-slate-700' : ''}
        ${variant === 'secondary' ? 'bg-slate-50 text-slate-800 border border-slate-200 hover:bg-slate-100' : ''}
        ${variant === 'outline' ? 'bg-transparent border border-slate-200 text-slate-500 hover:border-slate-800 hover:text-slate-800' : ''}
        ${variant === 'ghost' ? 'bg-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50' : ''}
        ${size === 'sm' ? 'py-1.5 px-3 text-[0.75rem]' : ''}
        ${size === 'md' ? 'py-2 px-5 text-sm' : ''}
        ${size === 'lg' ? 'py-3 px-6 text-sm' : ''}
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export default Button;
