
import React from 'react';

interface StatCardProps {
  label: string;
  value: number;
  type: 'income' | 'expense' | 'neutral';
  icon: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, type, icon }) => {
  const colorClass = 
    type === 'income' ? 'text-emerald-400' : 
    type === 'expense' ? 'text-rose-400' : 'text-sky-400';

  return (
    <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm flex items-center gap-4">
      <div className={`p-3 rounded-xl bg-slate-800 ${colorClass}`}>
        {icon}
      </div>
      <div>
        <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{label}</p>
        <p className={`text-xl font-bold ${colorClass}`}>
          {value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </p>
      </div>
    </div>
  );
};
