import React, { useState } from 'react';

export default function TriageModal({ isOpen, onClose, summary }) {
  const [activeTab, setActiveTab] = useState('balanced');

  if (!isOpen) return null;

  // We'll mock the specific expenses for the demo
  const mockBills = summary?.billsDueThisWeek || 500;
  
  const PLANS = {
    minimum: {
      title: 'Minimum Damage',
      description: 'Pay only non-negotiables. Defer everything else.',
      allowance: '$50',
      timeline: '7-10 Days',
      actionTitle: 'Freeze immediately:',
      actions: ['All eating out and delivery', 'Entertainment', 'Clothing & non-essential shopping']
    },
    balanced: {
      title: 'Balanced Survival',
      description: 'Reduce semi-flexible spend, protect essentials.',
      allowance: '$120',
      timeline: '14-21 Days',
      actionTitle: 'Temporarily pause:',
      actions: ['Streaming subscriptions (except 1)', 'Limit eating out to $30/wk', 'Delay any non-urgent vehicle upgrades']
    },
    aggressive: {
      title: 'Aggressive Cutback',
      description: 'Complete spending freeze. Accelerate recovery.',
      allowance: 'Zero discretionary',
      timeline: '3-5 Days',
      actionTitle: 'Strict lock:',
      actions: ['Only buy groceries (staples)', 'Only spend on gas for earning', 'Pause all investing/saving temporarily']
    }
  };

  const currentPlan = PLANS[activeTab];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-app-card w-full max-w-2xl rounded-card border border-rose-500/30 shadow-2xl overflow-hidden animate-in zoom-in duration-200">
        <div className="bg-rose-500/10 p-6 border-b border-rose-500/20 flex justify-between items-start">
           <div>
             <h2 className="text-xl font-bold font-display text-rose-500" flex items-center gap-2>
               ⚠️ Triage Plans
             </h2>
             <p className="text-xs text-app-muted mt-1">Your expenses have exceeded your safe cash by <span className="font-bold text-rose-500">${Math.abs(summary?.safeToSpend || 0).toLocaleString()}</span>. Pick a plan to recover.</p>
           </div>
           <button onClick={onClose} className="text-app-muted hover:text-rose-500 transition-colors">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
           </button>
        </div>

        <div className="flex border-b border-app-border">
          {Object.entries(PLANS).map(([key, plan]) => (
            <button 
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 py-4 px-2 text-[10px] font-bold uppercase tracking-widest transition-all text-center ${activeTab === key ? 'bg-rose-500 text-white' : 'text-app-muted hover:bg-app-muted/5'}`}
            >
              {plan.title}
            </button>
          ))}
        </div>

        <div className="p-8">
           <p className="text-sm text-app-text mb-8">{currentPlan.description}</p>
           
           <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-app-bg p-4 rounded-md border border-app-border text-center">
                 <p className="text-[10px] font-mono text-app-muted uppercase tracking-widest mb-1">New Discretionary Allowance</p>
                 <p className="text-2xl font-black font-display text-emerald-500">{currentPlan.allowance}</p>
              </div>
              <div className="bg-app-bg p-4 rounded-md border border-app-border text-center">
                 <p className="text-[10px] font-mono text-app-muted uppercase tracking-widest mb-1">Estimated Recovery Time</p>
                 <p className="text-2xl font-black font-display font-mono">{currentPlan.timeline}</p>
              </div>
           </div>

           <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-app-muted mb-3">{currentPlan.actionTitle}</p>
              <ul className="space-y-3">
                 {currentPlan.actions.map((action, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-sm">
                       <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center font-bold text-xs shrink-0">×</span>
                       {action}
                    </li>
                 ))}
              </ul>
           </div>
        </div>
        
        <div className="p-6 bg-app-bg border-t border-app-border flex justify-end gap-4">
           <button onClick={onClose} className="px-6 py-2 text-xs font-bold uppercase tracking-widest border border-app-border rounded-sm hover:bg-app-muted/5">Dismiss</button>
           <button onClick={onClose} className="px-6 py-2 bg-rose-500 text-white text-xs font-bold uppercase tracking-widest rounded-sm shadow-md shadow-rose-500/20 hover:bg-rose-600 transition-all">Enable Plan</button>
        </div>
      </div>
    </div>
  );
}
