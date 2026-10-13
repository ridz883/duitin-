// src/components/MoneyInput.jsx
import React from 'react';

export const formatThousands = (val) => {
  if (val === undefined || val === null || val === '') return '';
  const clean = val.toString().replace(/\D/g, '');
  return clean.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export const parseThousands = (val) => {
  if (!val) return 0;
  return Number(val.toString().replace(/\./g, '')) || 0;
};

export default function MoneyInput({ value, onChange, placeholder = '0', className = '', ...props }) {
  const handleChange = (e) => {
    const raw = e.target.value;
    const formatted = formatThousands(raw);
    const numeric = parseThousands(formatted);
    onChange(numeric, formatted);
  };

  return (
    <div className="relative flex items-center w-full">
      <span className="absolute left-3.5 text-xs font-bold text-slate-400 select-none">Rp</span>
      <input
        type="text"
        inputMode="numeric"
        placeholder={placeholder}
        value={formatThousands(value)}
        onChange={handleChange}
        className={`w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-100 outline-none border border-slate-200/80 dark:border-slate-700/60 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all ${className}`}
        {...props}
      />
    </div>
  );
}
