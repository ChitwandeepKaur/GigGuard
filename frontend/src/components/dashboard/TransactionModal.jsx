import React, { useState } from 'react';
import api from '../../services/api';

export default function TransactionModal({ isOpen, onClose, onUpdate, summary }) {
  const [activeTab, setActiveTab] = useState('income');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [suggestedSavings, setSuggestedSavings] = useState(0);
  const [savingsReason, setSavingsReason] = useState('');
  const [isSubmittingPhase2, setIsSubmittingPhase2] = useState(false);

  const [formData, setFormData] = useState({
    amount: '',
    source: '',
    category: '',
    note: '',
    date: new Date().toISOString().split('T')[0]
  });

  if (!isOpen) return null;

  const handleCompleteClose = () => {
    onUpdate();
    onClose();
    setTimeout(() => {
      setStep(1);
      setActiveTab('income');
      setFormData({
        amount: '',
        source: '',
        category: '',
        note: '',
        date: new Date().toISOString().split('T')[0]
      });
    }, 300); // Reset after modal fade out conceptually
  };
  
  const handleBackToStep1 = () => {
    setStep(1);
  };

  const executeLogTransaction = async () => {
    const endpoint = activeTab === 'income' ? '/api/finance/income' : '/api/finance/expense';
    const payload = {
      amount: Number(formData.amount),
      date: formData.date,
      note: formData.note,
      [activeTab === 'income' ? 'source' : 'category']: formData[activeTab === 'income' ? 'source' : 'category']
    };
    await api.post(endpoint, payload);
  };

  const handleSkipToLog = async () => {
    setIsSubmittingPhase2(true);
    try {
      await executeLogTransaction();
      handleCompleteClose();
    } catch (err) {
      console.error(err);
      alert('Failed to log transaction.');
    } finally {
      setIsSubmittingPhase2(false);
    }
  };

  const handleSaveBuffer = async () => {
    setIsSubmittingPhase2(true);
    try {
      await executeLogTransaction();
      await api.put('/api/user/profile', {
        current_buffer: (summary?.currentBuffer || 0) + suggestedSavings
      });
      handleCompleteClose();
    } catch (e) {
      console.error(e);
      alert('Failed to update buffer.');
    } finally {
      setIsSubmittingPhase2(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (activeTab === 'income' && summary) {
      let amount = Number(formData.amount);
      let suggested = amount * 0.20; 
      let reason = "We generally suggest saving 20% of your income toward your safety buffer.";
      
      const bufferGap = Math.max(0, (summary.emergencyBufferTarget || 0) - (summary.currentBuffer || 0));
      
      if (summary.billsDueThisWeek > summary.availableCash) {
         suggested = amount * 0.10; 
         reason = "You have high bills coming up compared to your available cash, so we're suggesting a smaller 10% safety buffer for now.";
      } else if (bufferGap > ((summary.emergencyBufferTarget || 1) * 0.5)) {
         suggested = amount * 0.30;
         reason = "Your buffer is less than half full! We strongly recommend aggressive saving (30%) from this income if you can afford it.";
      }
      
      if (suggested > bufferGap && bufferGap > 0) suggested = bufferGap;
      
      if (suggested >= 5) {
         setSuggestedSavings(Math.round(suggested));
         setSavingsReason(reason);
         setStep(2);
         return; 
      }
    }
    
    // Direct log if expense or negligible suggestion
    setLoading(true);
    try {
      await executeLogTransaction();
      handleCompleteClose();
    } catch (err) {
      console.error('Error logging transaction:', err);
      alert('Failed to log transaction.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 2) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-app-card w-full max-w-md rounded-card border border-app-border shadow-2xl p-8 text-center animate-in zoom-in duration-200 relative">
           <div className="absolute top-6 left-6">
             <button onClick={handleBackToStep1} className="text-[10px] text-app-muted font-bold hover:text-brand transition-colors flex items-center gap-1 uppercase tracking-widest">
               ← Back
             </button>
           </div>
           
           <div className="mx-auto w-16 h-16 bg-brand/10 text-brand rounded-full flex items-center justify-center mb-4 mt-2 text-3xl">
             🛡️
           </div>
           <h3 className="text-2xl font-display font-bold text-brand mb-2">Smart Buffer Suggestion</h3>
           <p className="text-sm text-app-text mb-6">
             {savingsReason}
           </p>
           
           <div className="bg-app-muted/5 border border-brand/20 rounded-xl p-6 mb-8">
             <p className="text-[10px] font-mono text-app-muted uppercase tracking-widest mb-2 font-bold">Recommended Buffer Transfer</p>
             <p className="text-4xl font-mono font-bold text-brand">${suggestedSavings}</p>
           </div>
           
           <div className="flex gap-4">
             <button 
               onClick={handleSkipToLog}
               disabled={isSubmittingPhase2}
               className="flex-1 py-3 border border-app-border text-app-muted rounded-sm hover:bg-app-muted/5 transition-all text-[10px] font-bold uppercase tracking-widest disabled:opacity-50"
             >
               {isSubmittingPhase2 ? 'Saving...' : 'Skip This'}
             </button>
             <button 
               onClick={handleSaveBuffer}
               disabled={isSubmittingPhase2}
               className="flex-1 py-3 bg-brand text-white rounded-sm hover:bg-brand-dark transition-all text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-brand/20 disabled:opacity-50"
             >
               {isSubmittingPhase2 ? 'Saving...' : 'Add to Buffer'}
             </button>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-app-card w-full max-w-md rounded-card border border-app-border shadow-2xl overflow-hidden animate-in zoom-in duration-200">
        <div className="flex border-b border-app-border">
          <button 
            onClick={() => setActiveTab('income')}
            className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'income' ? 'bg-brand text-white' : 'text-app-muted hover:bg-app-muted/5'}`}
          >
            Add Income
          </button>
          <button 
            onClick={() => setActiveTab('expense')}
            className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'expense' ? 'bg-brand text-white' : 'text-app-muted hover:bg-app-muted/5'}`}
          >
            Add Expense
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div>
            <label className="block text-[10px] uppercase font-mono text-app-muted mb-2 font-bold tracking-tighter">Amount ($)</label>
            <input 
              type="number" 
              required
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              placeholder="0.00"
              className="w-full bg-app-bg border border-app-border rounded-sm py-3 px-4 text-app-text outline-none focus:border-brand transition-all font-mono text-lg"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-mono text-app-muted mb-2 font-bold tracking-tighter">
              {activeTab === 'income' ? 'Source (e.g. DoorDash, Uber)' : 'Category (e.g. Gas, Food)'}
            </label>
            <input 
              type="text" 
              required
              value={activeTab === 'income' ? formData.source : formData.category}
              onChange={(e) => setFormData({...formData, [activeTab === 'income' ? 'source' : 'category']: e.target.value})}
              placeholder={activeTab === 'income' ? "Where did this come from?" : "What was this for?"}
              className="w-full bg-app-bg border border-app-border rounded-sm py-3 px-4 text-app-text text-sm outline-none focus:border-brand transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-mono text-app-muted mb-2 font-bold tracking-tighter">Date</label>
              <input 
                type="date" 
                required
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full bg-app-bg border border-app-border rounded-sm py-3 px-4 text-app-text text-xs outline-none focus:border-brand transition-all"
              />
            </div>
            <div>
               <label className="block text-[10px] uppercase font-mono text-app-muted mb-2 font-bold tracking-tighter">Optional Note</label>
               <input 
                type="text" 
                value={formData.note}
                onChange={(e) => setFormData({...formData, note: e.target.value})}
                placeholder="..."
                className="w-full bg-app-bg border border-app-border rounded-sm py-3 px-4 text-app-text text-xs outline-none focus:border-brand transition-all"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="button"
              onClick={handleCompleteClose}
              className="flex-1 py-3 border border-app-border text-app-muted rounded-sm hover:bg-app-muted/5 transition-all text-[10px] font-bold uppercase tracking-widest"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-brand text-white rounded-sm hover:bg-brand-dark transition-all text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-brand/20 disabled:opacity-50"
            >
              {loading ? 'Logging...' : 'Save Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
