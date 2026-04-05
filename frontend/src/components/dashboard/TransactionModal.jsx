import React, { useState } from 'react';
import api from '../../services/api';

export default function TransactionModal({ isOpen, onClose, onUpdate }) {
  const [activeTab, setActiveTab] = useState('income');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    source: '',
    category: '',
    note: '',
    date: new Date().toISOString().split('T')[0]
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = activeTab === 'income' ? '/api/finance/income' : '/api/finance/expense';
      const payload = {
        amount: Number(formData.amount),
        date: formData.date,
        note: formData.note,
        [activeTab === 'income' ? 'source' : 'category']: formData[activeTab === 'income' ? 'source' : 'category']
      };
      
      await api.post(endpoint, payload);
      onUpdate();
      onClose();
      setFormData({
        amount: '',
        source: '',
        category: '',
        note: '',
        date: new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      console.error('Error logging transaction:', err);
      alert('Failed to log transaction.');
    } finally {
      setLoading(false);
    }
  };

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
              onClick={onClose}
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
