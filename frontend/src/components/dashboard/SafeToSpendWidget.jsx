import React, { useState } from 'react';
import { Wallet, Calendar, Calculator, ChevronDown, ChevronUp } from 'lucide-react';

const COLORS = {
  safe: 'bg-gradient-to-br from-teal-400 to-emerald-600 text-white',
  warning: 'bg-gradient-to-br from-amber-400 to-orange-500 text-white',
  risky: 'bg-gradient-to-br from-orange-500 to-red-600 text-white',
  danger: 'bg-gradient-to-br from-red-600 to-rose-700 text-white',
};

const LABELS = {
  safe: 'Confidently safe',
  warning: 'Safe if income arrives',
  risky: 'Risky',
  danger: 'Overspending danger',
};

export default function SafeToSpendWidget({ amount, state, billsDue, availableCash, taxReserve = 0, bufferGap = 0 }) {
  const [showMath, setShowMath] = useState(false);
  
  const bgColor = COLORS[state] || COLORS.safe;
  const label = LABELS[state] || 'Checking...';

  // Math breakdown logic
  // SafeToSpend = Cash - Bills - BufferGap - TaxReserve - (Volatility cushion logic inside server)
  // We'll just show a simplified breakdown using available props
  const cushion = (availableCash || 0) - (billsDue || 0) - bufferGap - taxReserve - (amount || 0);

  return (
    <div className={`${bgColor} p-8 rounded-card shadow-xl transition-all duration-300 transform hover:scale-[1.01]`}>
      <div className="flex flex-wrap justify-between items-start gap-4">
        <div>
          <h3 className="text-[10px] sm:text-sm font-mono uppercase tracking-widest opacity-90 font-bold flex items-center gap-2">
            Safe-to-Spend This Week
          </h3>
          <p className="text-4xl sm:text-5xl font-bold mt-2 font-display">
            ${amount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="text-left sm:text-right">
          <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider whitespace-nowrap shadow-sm">
            {label}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-white/20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Wallet size={20} className="opacity-90" />
          </div>
          <div>
            <p className="text-xs opacity-80 uppercase font-mono tracking-tighter">Cash on Hand</p>
            <p className="text-lg font-bold">${availableCash?.toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Calendar size={20} className="opacity-90" />
          </div>
          <div>
            <p className="text-xs opacity-80 uppercase font-mono tracking-tighter">Bills Due (Approx)</p>
            <p className="text-lg font-bold">${billsDue?.toLocaleString()}</p>
          </div>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-white/10">
        <button 
          onClick={() => setShowMath(!showMath)} 
          className="flex items-center gap-2 text-[10px] opacity-80 hover:opacity-100 transition-opacity uppercase tracking-widest font-bold"
        >
          <Calculator size={14} />
          {showMath ? 'Hide Math Breakdown' : 'See The Math'}
          {showMath ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        
        {showMath && (
          <div className="mt-4 p-4 bg-black/10 rounded-md font-mono text-xs space-y-2 animate-in slide-in-from-top-2 duration-200">
            <div className="flex justify-between"><span>Cash on Hand:</span> <span>${availableCash?.toLocaleString()}</span></div>
            <div className="flex justify-between text-white/80"><span>- Bills Due:</span> <span>${billsDue?.toLocaleString()}</span></div>
            <div className="flex justify-between text-white/80"><span>- Tax Reserve:</span> <span>${taxReserve?.toLocaleString()}</span></div>
            <div className="flex justify-between text-white/80"><span>- Volatility Cushion:</span> <span>${cushion > 0 ? cushion.toLocaleString() : '0.00'}</span></div>
            <div className="flex justify-between font-bold pt-2 border-t border-white/20 mt-2">
              <span>= Safe to Spend:</span> 
              <span>${amount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
