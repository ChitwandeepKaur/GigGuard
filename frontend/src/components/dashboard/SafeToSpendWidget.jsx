import React from 'react';

const COLORS = {
  safe: 'bg-teal-500 text-white',
  warning: 'bg-amber-500 text-white',
  risky: 'bg-orange-600 text-white',
  danger: 'bg-red-600 text-white',
};

const LABELS = {
  safe: 'Confidently safe',
  warning: 'Safe if income arrives',
  risky: 'Risky',
  danger: 'Overspending danger',
};

export default function SafeToSpendWidget({ amount, state, billsDue, availableCash }) {
  const bgColor = COLORS[state] || COLORS.safe;
  const label = LABELS[state] || 'Checking...';

  return (
    <div className={`${bgColor} p-8 rounded-card shadow-lg transition-all duration-300 transform hover:scale-[1.02]`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-mono uppercase tracking-widest opacity-80">Safe-to-Spend This Week</h3>
          <p className="text-5xl font-bold mt-2 font-display">
            ${amount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="text-right">
          <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider">
            {label}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-white/20">
        <div>
          <p className="text-xs opacity-70 uppercase font-mono">Cash on Hand</p>
          <p className="text-lg font-bold">${availableCash?.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs opacity-70 uppercase font-mono">Bills Due (Approx)</p>
          <p className="text-lg font-bold">${billsDue?.toLocaleString()}</p>
        </div>
      </div>
      
      <p className="text-[10px] mt-4 opacity-50 italic">
        Formula: Cash - Bills - Buffer Gap - Tax Reserve - Cushion
      </p>
    </div>
  );
}
