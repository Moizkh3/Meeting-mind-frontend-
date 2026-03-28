import React from 'react';

const Input = ({ label, type = 'text', placeholder, value, onChange, error, className = '' }) => {
  return (
    <div className={`mb-4 w-full ${className}`}>
      {label && <label className="block mb-2 text-[0.75rem] font-bold text-slate-500 uppercase tracking-widest">{label}</label>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full py-2.5 px-3.5 bg-white border border-slate-200 rounded-sm text-slate-800 text-sm transition-colors duration-200 outline-none focus:border-slate-800 placeholder:text-slate-400 ${error ? 'border-red-500' : ''}`}
      />
      {error && <p className="mt-1 text-[0.75rem] text-red-500">{error}</p>}
    </div>
  );
};

export default Input;
