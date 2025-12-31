
import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, children, className = "", headerAction }) => (
  <div className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col ${className}`}>
    {title && (
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
        <h3 className="font-bold text-slate-900 dark:text-slate-50 text-lg tracking-tight">{title}</h3>
        {headerAction}
      </div>
    )}
    <div className="p-6 flex-1 text-slate-800 dark:text-slate-200">
      {children}
    </div>
  </div>
);

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'ghost' }> = ({ variant = 'primary', className = "", type = "button", onClick, ...props }) => {
  const base = "px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer select-none";
  const variants = {
    primary: "bg-brand-500 hover:bg-brand-600 text-white shadow-lg shadow-brand-500/20",
    secondary: "bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100",
    danger: "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20",
    ghost: "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
  };
  return (
    <button 
      type={type} 
      onClick={(e) => {
        if (onClick) {
          e.stopPropagation();
          onClick(e);
        }
      }} 
      className={`${base} ${variants[variant]} ${className}`} 
      {...props} 
    />
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className = "", ...props }) => (
  <input 
    className={`w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-brand-500/40 outline-none transition-all text-slate-900 dark:text-slate-50 placeholder:text-slate-400 ${className}`}
    {...props}
  />
);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({ className = "", children, ...props }) => (
  <select 
    className={`w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-brand-500/40 outline-none transition-all text-slate-900 dark:text-slate-50 appearance-none cursor-pointer ${className}`}
    {...props}
  >
    {children}
  </select>
);

export const Badge: React.FC<{ children: React.ReactNode; color?: 'orange' | 'green' | 'red' | 'blue' | 'slate' | 'brand' }> = ({ children, color = 'slate' }) => {
  const colors = {
    brand: "bg-brand-500 text-white shadow-sm shadow-brand-500/10",
    orange: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
    green: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    red: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    slate: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
  };
  return <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider whitespace-nowrap ${colors[color]}`}>{children}</span>;
};

// Updated SectionTitle to support className to fix the error in pages/AIHub.tsx
export const SectionTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <h2 className={`text-4xl font-black text-slate-900 dark:text-slate-50 tracking-tight mb-8 mt-4 ${className}`}>{children}</h2>
);

export const Table: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="overflow-x-auto w-full">
    <table className="w-full border-collapse text-sm text-left rtl:text-right">
      {children}
    </table>
  </div>
);

export const Thead: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <thead className="bg-slate-50 dark:bg-slate-800/50 border-y border-slate-200 dark:border-slate-700">
    {children}
  </thead>
);

export const Tbody: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
    {children}
  </tbody>
);

export const Th: React.FC<React.ThHTMLAttributes<HTMLTableHeaderCellElement>> = ({ children, className = "", ...props }) => (
  <th className={`px-6 py-4 font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-[10px] ${className}`} {...props}>
    {children}
  </th>
);

export const Td: React.FC<React.TdHTMLAttributes<HTMLTableDataCellElement>> = ({ children, className = "", ...props }) => (
  <td className={`px-6 py-4 text-slate-700 dark:text-slate-200 font-medium ${className}`} {...props}>
    {children}
  </td>
);

export const Tr: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({ children, className = "", ...props }) => (
  <tr className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors ${className}`} {...props}>
    {children}
  </tr>
);
