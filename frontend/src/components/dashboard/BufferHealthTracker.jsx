import React, { useState } from 'react';
import api from '../../services/api';

const TIER_COLORS = {
  vulnerable: 'bg-red-500',
  building: 'bg-amber-500',
  protected: 'bg-emerald-500',
};

const TIER_ICONS = {
  vulnerable: '🔴',
  building: '🟡',
  protected: '🟢',
};

export default function BufferHealthTracker({ weeks, currentBuffer, targetBuffer, onUpdate }) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || Number(amount) <= 0) return;

    try {
      setLoading(true);
      await api.post('/api/finance/transfer-to-buffer', { amount: Number(amount) });
      setAmount('');
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Transfer failed:', err);
      alert(err.response?.data?.error || 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  const tier = weeks < 1 ? 'vulnerable' : weeks < 3 ? 'building' : 'protected';
  const progress = Math.min(100, (weeks / 3) * 100);
  
  const gap = Math.max(0, targetBuffer - currentBuffer);

  return (
    <div className="bg-app-card p-6 rounded-card border border-app-border shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-mono text-app-muted uppercase tracking-wider">Buffer Health</h3>
        <span className="text-xl">{TIER_ICONS[tier]} {tier.charAt(0).toUpperCase() + tier.slice(1)}</span>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-app-muted">Your buffer covers</span>
          <span className="font-bold font-mono text-brand text-lg">{weeks?.toFixed(1)} bad weeks</span>
        </div>

        <div className="h-4 w-full bg-app-muted/20 rounded-full overflow-hidden">
          <div 
            className={`h-full ${TIER_COLORS[tier]} transition-all duration-1000 ease-out`}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex justify-between text-[10px] text-app-muted uppercase tracking-tighter">
          <span>0 Weeks</span>
          <span>1.5 Weeks</span>
          <span>3 Weeks (Goal)</span>
        </div>
      </div>

      {gap > 0 && (
        <div className="mt-8 p-3 bg-brand/5 border border-brand/10 rounded-sm italic text-xs text-brand/80">
          Tip: Save <strong>${(gap / 4).toLocaleString()} extra</strong> this week to reach safety in a month.
        </div>
      )}
      {gap <= 0 && (
        <div className="mt-8 p-3 bg-emerald-50 border border-emerald-100 rounded-sm italic text-xs text-emerald-700">
          Boom! You're fully protected. Any windfall now is pure flex spending.
        </div>
      )}

      {/* Transfer Action */}
      <div className="mt-8 pt-6 border-t border-app-border">
        <form onSubmit={handleTransfer} className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-app-muted text-[10px] font-mono">$</span>
            <input 
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount"
              className="w-full bg-app-bg border border-app-border rounded-sm py-2 pl-6 pr-2 text-xs text-app-text outline-none focus:border-brand font-mono"
              disabled={loading}
            />
          </div>
          <button 
            type="submit"
            disabled={loading || !amount}
            className="px-4 py-2 bg-brand text-white text-[10px] font-bold rounded-sm hover:bg-brand-dark transition-all uppercase tracking-widest disabled:opacity-50"
          >
            {loading ? '...' : 'Transfer'}
          </button>
        </form>
        <p className="text-[9px] text-app-muted mt-2 uppercase tracking-tighter text-center">Move from Available Cash to Buffer</p>
      </div>
    </div>
  );
}
