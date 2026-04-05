import React from 'react';

export default function TaxTracker({ owed, deadline, penalty }) {
  const daysLeft = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
  const isUrgent = daysLeft < 14;

  return (
    <div className="bg-app-card p-6 rounded-card border border-app-border shadow-sm">
      <h3 className="text-sm font-mono text-app-muted uppercase tracking-wider mb-6">Self-Employment Tax</h3>
      
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-2xl font-bold font-display text-brand">
            ${owed?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-app-muted uppercase tracking-widest mt-1">Total Owed (15.3%)</p>
        </div>
        <div className={`text-right ${isUrgent ? 'text-red-500 animate-pulse font-black' : 'text-amber-600'}`}>
          <p className="text-3xl font-black font-mono tracking-tighter">{daysLeft}</p>
          <p className="text-[10px] uppercase font-bold">Days Left</p>
        </div>
      </div>

      <div className="space-y-3 pt-6 border-t border-app-muted/10">
        <div className="flex justify-between text-xs">
          <span className="text-app-muted">Next Q-Deadline:</span>
          <span className="font-bold">{new Date(deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
        </div>
        
        <div className="flex justify-between text-xs">
          <span className="text-app-muted">Estimated Penalty:</span>
          <span className={`font-bold ${penalty > 0 ? 'text-red-500' : 'text-emerald-600'}`}>
            ${penalty?.toLocaleString() || '0'}
          </span>
        </div>
      </div>

      <button className="w-full mt-6 py-2 bg-brand/5 hover:bg-brand/10 text-brand border border-brand/20 rounded-sm text-xs font-bold transition-colors">
        Set Aside from Last Payment
      </button>
    </div>
  );
}
