import React from 'react';

export default function WindfallStabilizer({ excess, split }) {
  if (!excess || excess <= 0) return null;

  return (
    <div className="bg-emerald-600 p-8 rounded-card shadow-lg text-white animate-fade-in transition-all">
      <div className="mb-8 border-b border-emerald-500/50 pb-4">
        <h3 className="text-[10px] font-bold font-mono uppercase tracking-widest opacity-80 mb-1">Windfall Stabilizer</h3>
        <p className="text-2xl sm:text-3xl font-bold font-display">
          Extra Income Detected: ${excess?.toLocaleString()}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-emerald-700/50 p-5 rounded-md border border-emerald-500/30">
          <p className="text-[10px] uppercase font-mono opacity-80">50% → Shock Buffer</p>
          <p className="text-2xl font-black mt-1">${split?.buffer?.toLocaleString()}</p>
          <p className="text-[9px] mt-2 opacity-60 uppercase">Priority: HIGH</p>
        </div>
        
        <div className="bg-emerald-700/50 p-5 rounded-md border border-emerald-500/30">
          <p className="text-[10px] uppercase font-mono opacity-80">20% → Overdue Bills</p>
          <p className="text-2xl font-black mt-1">${split?.bills?.toLocaleString()}</p>
          <p className="text-[9px] mt-2 opacity-60 uppercase">Priority: MEDIUM</p>
        </div>

        <div className="bg-emerald-700/50 p-5 rounded-md border border-emerald-500/30">
          <p className="text-[10px] uppercase font-mono opacity-80">20% → Next Week Essentials</p>
          <p className="text-2xl font-black mt-1">${split?.essentials?.toLocaleString()}</p>
          <p className="text-[9px] mt-2 opacity-60 uppercase">Priority: LOW</p>
        </div>

        <div className="bg-emerald-700/50 p-5 rounded-md border border-emerald-500/30">
          <p className="text-[10px] uppercase font-mono opacity-80">10% → Flexible Spending</p>
          <p className="text-2xl font-black mt-1">${split?.flex?.toLocaleString()}</p>
          <p className="text-[9px] mt-2 opacity-60 uppercase text-emerald-200">Discretionary</p>
        </div>
      </div>
      
      <div className="mt-8 pt-6 border-t border-emerald-500/50 text-xs text-emerald-100/80 leading-relaxed max-w-2xl font-mono">
        Recommended split to build long-term stability and buffer size while managing essential costs.
      </div>
    </div>
  );
}
