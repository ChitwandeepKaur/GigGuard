import React from 'react';

export default function WindfallStabilizer({ excess, split }) {
  if (!excess || excess <= 0) return null;

  return (
    <div className="bg-emerald-600 p-8 rounded-card shadow-lg text-white animate-fade-in transition-all">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-sm font-mono uppercase tracking-widest opacity-80">Windfall Stabilizer</h3>
          <p className="text-3xl font-bold font-display mt-2 italic shadow-emerald-700 underline underline-offset-4 decoration-emerald-400 decoration-wavy">
            You made ${excess?.toLocaleString()} more than usual! 🚀
          </p>
        </div>
        <div className="hidden lg:block text-5xl">🏦</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/10 p-5 rounded-md backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-all cursor-default">
          <p className="text-[10px] uppercase font-mono opacity-60">50% → Shock Buffer</p>
          <p className="text-2xl font-black mt-1">${split?.buffer?.toLocaleString()}</p>
          <p className="text-[9px] mt-2 opacity-50 italic">Priority: HIGH</p>
        </div>
        
        <div className="bg-white/10 p-5 rounded-md backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-all cursor-default">
          <p className="text-[10px] uppercase font-mono opacity-60">20% → Overdue Bills</p>
          <p className="text-2xl font-black mt-1">${split?.bills?.toLocaleString()}</p>
          <p className="text-[9px] mt-2 opacity-50 italic">Priority: MEDIUM</p>
        </div>

        <div className="bg-white/10 p-5 rounded-md backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-all cursor-default">
          <p className="text-[10px] uppercase font-mono opacity-60">20% → Next Week Essentials</p>
          <p className="text-2xl font-black mt-1">${split?.essentials?.toLocaleString()}</p>
          <p className="text-[9px] mt-2 opacity-50 italic">Priority: LOW</p>
        </div>

        <div className="bg-white/10 p-5 rounded-md backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-all cursor-default">
          <p className="text-[10px] uppercase font-mono opacity-60">10% → Flexible Spending</p>
          <p className="text-2xl font-black mt-1">${split?.flex?.toLocaleString()}</p>
          <p className="text-[9px] mt-2 opacity-50 italic uppercase tracking-tighter text-emerald-300">Reward yourself! 🎉</p>
        </div>
      </div>
      
      <div className="mt-8 pt-6 border-t border-white/10 italic text-xs text-emerald-100/60 leading-relaxed max-w-2xl">
        "Stability isn't about how much you make, it's about what you do with the excess. This split builds your net worth without sacrificing this week's joy."
      </div>
    </div>
  );
}
