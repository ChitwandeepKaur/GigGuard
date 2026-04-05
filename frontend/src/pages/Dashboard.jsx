import React, { useState, useEffect } from 'react';
import api from '../services/api';
import SafeToSpendWidget from '../components/dashboard/SafeToSpendWidget';
import BufferHealthTracker from '../components/dashboard/BufferHealthTracker';
import TaxTracker from '../components/dashboard/TaxTracker';
import WindfallStabilizer from '../components/dashboard/WindfallStabilizer';
import TransactionModal from '../components/dashboard/TransactionModal';
import TriageModal from '../components/dashboard/TriageModal';
import MonthlyBills from '../components/dashboard/MonthlyBills';
import ManageBillsModal from '../components/dashboard/ManageBillsModal';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [onboardingIncomplete, setOnboardingIncomplete] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showTriageModal, setShowTriageModal] = useState(false);
  const [showManageBillsModal, setShowManageBillsModal] = useState(false);
  const [balances, setBalances] = useState({ available_cash: 0, current_buffer: 0 });

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Check if user has completed onboarding by fetching their profile
      try {
        await api.get('/api/user/profile');
      } catch (profileErr) {
        if (profileErr.response?.status === 404) {
          setOnboardingIncomplete(true);
          setLoading(false);
          return;
        }
      }

      const [summaryRes, historyRes] = await Promise.all([
        api.get('/api/finance/summary'),
        api.get('/api/finance/transactions')
      ]);
      
      setSummary(summaryRes.data);
      setHistory(historyRes.data);
      setBalances({
        available_cash: summaryRes.data.availableCash,
        current_buffer: summaryRes.data.currentBuffer
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Could not load dashboard data. Please make sure the backend is running and you are logged in.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateBalances = async (e) => {
    e.preventDefault();
    try {
      await api.put('/api/user/profile', {
        available_cash: Number(balances.available_cash),
        current_buffer: Number(balances.current_buffer)
      });
      setShowUpdateModal(false);
      fetchData();
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

  if (onboardingIncomplete) {
    return (
      <div className="p-8 bg-app-bg min-h-screen flex flex-col items-center justify-center">
        <div className="bg-app-card border border-app-border p-8 rounded-card max-w-md text-center shadow-lg">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-2xl font-display font-bold text-brand mb-2">Dashboard Locked</h2>
          <p className="text-gray-500 mb-6 font-body">
            The dashboard can only be unlocked once you have completed onboarding. Please finish your profile setup to access your financial tools.
          </p>
          <a 
            href="/onboarding"
            className="inline-block w-full bg-brand text-white py-3 rounded-lg font-medium hover:bg-brand-dark transition-colors"
          >
            Complete Onboarding
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 bg-app-bg min-h-screen max-w-7xl mx-auto pb-24 relative">
      {summary?.safeToSpend < 0 && (
        <div className="bg-red-500/10 border-b border-red-500 mb-8 p-4 rounded-sm flex items-center justify-between text-red-500">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            <p className="text-xs font-bold uppercase tracking-widest">SURVIVAL MODE ACTIVE: Your expenses exceed your safe cash.</p>
          </div>
          <button 
            onClick={() => setShowTriageModal(true)}
            className="px-4 py-1.5 bg-red-500 text-white rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-red-600 transition-all"
          >
            View Triage Plans
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
        <div>
          <h2 className="text-3xl sm:text-4xl font-display text-brand font-bold">Dashboard</h2>
          <p className="text-app-muted text-xs sm:text-sm font-mono mt-1 uppercase tracking-widest">Financial Wellness Control Center</p>
        </div>
        <div className="flex gap-3 sm:gap-4 w-full sm:w-auto">
          <button 
            onClick={() => setShowUpdateModal(true)}
            className="flex-1 sm:flex-none px-4 py-2 text-app-muted text-[10px] font-bold rounded-sm border border-app-border hover:bg-app-muted/5 transition-all uppercase tracking-widest"
          >
            Adjust Balance
          </button>
          <button 
            onClick={() => setShowLogModal(true)}
            className="flex-1 sm:flex-none px-6 py-2 bg-brand text-white text-[10px] font-bold rounded-sm hover:bg-brand-dark transition-all uppercase tracking-widest shadow-lg shadow-brand/20"
          >
            Log Transaction
          </button>
        </div>
      </div>

      {/* Windfall Stabilizer */}
      {summary?.windfall && summary?.safeToSpend >= 0 && (
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Main Hero Widget */}
        <div className="lg:col-span-2">
          <SafeToSpendWidget 
            amount={summary?.safeToSpend} 
            state={summary?.safeToSpendState}
            availableCash={summary?.availableCash}
            billsDue={summary?.billsDueThisWeek}
            taxReserve={summary?.taxReserve}
            bufferGap={Math.max(0, (summary?.emergencyBufferTarget || 0) - (summary?.currentBuffer || 0))}
          />
          
          <div className="mt-8 bg-app-card p-6 rounded-card border border-app-border">
             <h3 className="text-xs font-mono text-app-muted uppercase tracking-widest mb-4">Quick Income Tracker (This Week)</h3>
             
             <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-3 bg-app-muted/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-brand" 
                    style={{ width: `${Math.min(100, ((summary?.thisWeekIncome || 0) / (summary?.goodWeekThreshold || 1)) * 100)}%` }}
                  />
                </div>
                <p className="font-mono font-bold text-lg">${summary?.thisWeekIncome?.toLocaleString()}</p>
             </div>
             
             <div className="pt-4 border-t border-app-border grid grid-cols-3 gap-2 text-center divide-x divide-app-border/50 bg-app-muted/5 -mx-6 -mb-6 p-4 rounded-b-card">
               <div>
                 <p className="text-[9px] uppercase font-mono text-app-muted mb-1">Worst Week</p>
                 <p className="font-bold text-sm text-rose-500">${summary?.floorIncome?.toLocaleString()}</p>
               </div>
               <div>
                 <p className="text-[9px] uppercase font-mono text-app-muted mb-1">Best Week</p>
                 <p className="font-bold text-sm text-emerald-500">${summary?.goodWeekThreshold?.toLocaleString()}</p>
               </div>
               <div>
                 <p className="text-[9px] uppercase font-mono text-app-muted mb-1">Volatility Score</p>
                 <p className="font-bold text-sm text-amber-500">{summary?.volatilityScore ? Math.round(summary.volatilityScore) : 0} <span className="text-[9px] uppercase opacity-70">(High)</span></p>
               </div>
             </div>
          </div>
        </div>

        {/* Secondary Trackers */}
        <div className="space-y-8">
          <BufferHealthTracker 
            weeks={summary?.bufferWeeks} 
            currentBuffer={summary?.currentBuffer}
            targetBuffer={summary?.emergencyBufferTarget}
            onUpdate={fetchData}
          />
          
          <TaxTracker 
            owed={summary?.totalTaxOwed}
            deadline={summary?.nextTaxDeadline}
            penalty={summary?.estimatedPenalty}
          />
          
          <MonthlyBills 
            expenses={summary?.expenses} 
            onUpdate={fetchData} 
            onManage={() => setShowManageBillsModal(true)}
          />
        </div>
      </div>

      {/* Transaction History Section */}
      <div className="bg-app-card rounded-card border border-app-border overflow-hidden">
        <div className="p-6 border-b border-app-border flex justify-between items-center">
           <h3 className="text-[10px] font-mono text-app-muted uppercase tracking-widest font-bold">Recent Cash Flow History</h3>
           <p className="text-[10px] font-mono text-app-muted uppercase">Showing Last 30 Activities</p>
        </div>
        <div className="divide-y divide-app-border">
          {history.length > 0 ? (
            history.map((tx, idx) => (
              <div key={tx.id || idx} className="p-4 flex items-center justify-between hover:bg-app-muted/5 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${tx.type === 'income' ? 'bg-emerald-500 shadow-sm shadow-emerald-500/20' : 'bg-rose-500 shadow-sm shadow-rose-500/20'}`} />
                  <div>
                    <p className="text-sm font-bold text-app-text">{tx.source || tx.category || 'Transaction'}</p>
                    <p className="text-[10px] text-app-muted font-mono">{new Date(tx.date).toLocaleDateString()} • {tx.note || 'No note'}</p>
                  </div>
                </div>
                <p className={`font-mono font-bold ${tx.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {tx.type === 'income' ? '+' : '-'}${Number(tx.amount).toLocaleString()}
                </p>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <p className="text-app-muted text-sm italic">No transactions logged yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Log Transaction Modal */}
      <TransactionModal 
        isOpen={showLogModal} 
        onClose={() => setShowLogModal(false)} 
        onUpdate={fetchData} 
      />

      {/* Adjustment Modal (Old Update Balances) */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-app-card p-8 rounded-card border border-app-border shadow-2xl w-full max-w-md animate-in zoom-in duration-200">
            <h3 className="text-2xl font-display font-bold text-brand mb-6">Adjust Balances</h3>
            <p className="text-xs text-app-muted mb-6 leading-relaxed">Manually adjust your totals. Use this only for initial setup or to correct errors. Daily logs are preferred.</p>
            <form onSubmit={handleUpdateBalances} className="space-y-6">
              <div>
                <label className="block text-[10px] uppercase font-mono text-app-muted mb-2 font-bold">Total Cash on Hand</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-app-muted font-mono">$</span>
                  <input 
                    type="number" 
                    value={balances.available_cash}
                    onChange={(e) => setBalances({...balances, available_cash: e.target.value})}
                    className="w-full bg-app-bg border border-app-border rounded-sm py-3 pl-8 pr-4 text-app-text outline-none focus:border-brand font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-mono text-app-muted mb-2 font-bold">Emergency Buffer Balance</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-app-muted font-mono">$</span>
                  <input 
                    type="number" 
                    value={balances.current_buffer}
                    onChange={(e) => setBalances({...balances, current_buffer: e.target.value})}
                    className="w-full bg-app-bg border border-app-border rounded-sm py-3 pl-8 pr-4 text-app-text outline-none focus:border-brand font-mono"
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
                  className="flex-1 py-3 border border-app-border text-app-muted rounded-sm hover:bg-app-muted/5 transition-all text-[10px] font-bold uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-brand text-white rounded-sm hover:bg-brand-dark transition-all text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-brand/20"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Triage Modal */}
      <TriageModal 
        isOpen={showTriageModal} 
        onClose={() => setShowTriageModal(false)}
        summary={summary}
      />

      <ManageBillsModal 
        isOpen={showManageBillsModal} 
        onClose={() => setShowManageBillsModal(false)}
        expenses={summary?.expenses}
        onUpdate={fetchData}
      />
    </div>
  );
}
