import React, { useState, useEffect } from 'react';
import api from '../services/api';
import SafeToSpendWidget from '../components/dashboard/SafeToSpendWidget';
import BufferHealthTracker from '../components/dashboard/BufferHealthTracker';
import TaxTracker from '../components/dashboard/TaxTracker';
import WindfallStabilizer from '../components/dashboard/WindfallStabilizer';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [balances, setBalances] = useState({ available_cash: 0, current_buffer: 0 });

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/finance/summary');
      setSummary(res.data);
      setBalances({
        available_cash: res.data.availableCash,
        current_buffer: res.data.currentBuffer
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard summary:', err);
      setError('Could not load dashboard data. Please make sure the backend is running and you are logged in.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleUpdateBalances = async (e) => {
    e.preventDefault();
    try {
      await api.put('/api/user/profile', {
        available_cash: Number(balances.available_cash),
        current_buffer: Number(balances.current_buffer)
      });
      setShowUpdateModal(false);
      fetchSummary();
    } catch (err) {
      console.error('Error updating balances:', err);
      alert('Failed to update balances.');
    }
  };

  if (loading && !summary) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-app-bg min-h-screen">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-app-bg min-h-screen max-w-7xl mx-auto pb-24">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-4xl font-display text-brand font-bold">Dashboard</h2>
          <p className="text-app-muted text-sm font-mono mt-1 uppercase tracking-widest">Financial Wellness Control Center</p>
        </div>
        <button 
          onClick={() => setShowUpdateModal(true)}
          className="px-4 py-2 bg-brand/10 text-brand text-xs font-bold rounded-sm border border-brand/20 hover:bg-brand/20 transition-all"
        >
          Update Balances
        </button>
      </div>

      {/* Windfall Stabilizer (Shows only if summary has windfall) */}
      {summary?.windfall && (
        <div className="mb-8">
          <WindfallStabilizer 
            excess={summary.windfall.excess} 
            split={{
              buffer: summary.windfall.buffer,
              bills: summary.windfall.bills,
              essentials: summary.windfall.essentials,
              flex: summary.windfall.flex
            }} 
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Hero Widget (Spans 2 columns) */}
        <div className="lg:col-span-2">
          <SafeToSpendWidget 
            amount={summary?.safeToSpend} 
            state={summary?.safeToSpendState}
            availableCash={summary?.availableCash}
            billsDue={summary?.billsDueThisWeek}
          />
          
          <div className="mt-8 bg-app-card p-6 rounded-card border border-app-border">
             <h3 className="text-xs font-mono text-app-muted uppercase tracking-widest mb-4">Quick Income Tracker (This Week)</h3>
             <div className="flex items-center gap-4">
                <div className="flex-1 h-3 bg-app-muted/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-brand" 
                    style={{ width: `${Math.min(100, (summary?.thisWeekIncome / summary?.goodWeekThreshold) * 100)}%` }}
                  />
                </div>
                <p className="font-mono font-bold text-lg">${summary?.thisWeekIncome?.toLocaleString()}</p>
             </div>
             <p className="text-[10px] text-app-muted mt-2">Target for a "Good Week": ${summary?.goodWeekThreshold?.toLocaleString()}</p>
          </div>
        </div>

        {/* Secondary Trackers (Stack vertically in 1 column) */}
        <div className="space-y-8">
          <BufferHealthTracker 
            weeks={summary?.bufferWeeks} 
            currentBuffer={summary?.currentBuffer}
            targetBuffer={summary?.emergencyBufferTarget}
          />
          
          <TaxTracker 
            owed={summary?.totalTaxOwed}
            deadline={summary?.nextTaxDeadline}
            penalty={summary?.estimatedPenalty}
          />
        </div>
      </div>

      {/* Update Balances Modal (Simplified) */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-app-card p-8 rounded-card border border-app-border shadow-2xl w-full max-w-md animate-in zoom-in duration-200">
            <h3 className="text-2xl font-display font-bold text-brand mb-6">Update Your Balances</h3>
            <form onSubmit={handleUpdateBalances} className="space-y-6">
              <div>
                <label className="block text-[10px] uppercase font-mono text-app-muted mb-2 font-bold">Total Cash on Hand</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-app-muted">$</span>
                  <input 
                    type="number" 
                    value={balances.available_cash}
                    onChange={(e) => setBalances({...balances, available_cash: e.target.value})}
                    className="w-full bg-app-bg border border-app-border rounded-sm py-3 pl-8 pr-4 text-app-text outline-none focus:border-brand"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-mono text-app-muted mb-2 font-bold">Emergency Buffer Balance</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-app-muted">$</span>
                  <input 
                    type="number" 
                    value={balances.current_buffer}
                    onChange={(e) => setBalances({...balances, current_buffer: e.target.value})}
                    className="w-full bg-app-bg border border-app-border rounded-sm py-3 pl-8 pr-4 text-app-text outline-none focus:border-brand"
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
                  className="flex-1 py-3 border border-app-border text-app-muted rounded-sm hover:bg-app-muted/5 transition-all text-xs font-bold uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-brand text-white rounded-sm hover:bg-brand-dark transition-all text-xs font-bold uppercase tracking-widest shadow-lg shadow-brand/20"
                >
                  Save Balances
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
