import React, { useState } from 'react';
import api from '../../services/api';
import { Loader2, Check, Settings } from 'lucide-react';

const CATEGORY_LABELS = {
  rent: 'Rent / Mortgage',
  utilities: 'Utilities (Water, Electricity)',
  debt_minimums: 'Debt Minimums',
  transport: 'Transportation',
  groceries: 'Groceries',
  insurance_cost: 'Health/Life Insurance',
  phone: 'Phone Plan',
  subscriptions: 'Digital Subscriptions',
  eating_out: 'Dining & Takeout',
  shopping: 'Shopping',
  entertainment: 'Entertainment'
};

export default function MonthlyBills({ expenses, onUpdate, onManage }) {
  const [loadingCategory, setLoadingCategory] = useState(null);

  if (!expenses) return null;

  const paidCategories = expenses.paid_categories || [];
  
  const handleToggle = async (category) => {
    try {
      setLoadingCategory(category);
      await api.post('/api/finance/toggle-bill', { category });
      onUpdate();
    } catch (err) {
      console.error('Error toggling bill:', err);
      alert('Failed to update bill status.');
    } finally {
      setLoadingCategory(null);
    }
  };

  const billItems = Object.entries(CATEGORY_LABELS).map(([key, label]) => ({
    key,
    label,
    amount: expenses[key] || 0,
    isPaid: paidCategories.includes(key)
  })).filter(item => item.amount > 0);

  return (
    <div className="bg-app-card rounded-card border border-app-border overflow-hidden">
      <div className="p-6 border-b border-app-border flex justify-between items-center">
        <div>
          <h3 className="text-[10px] font-mono text-app-muted uppercase tracking-widest font-bold">Monthly Bill Tracker</h3>
          <p className="text-[10px] text-app-muted mt-1 uppercase tracking-tighter">Resets on the 1st of each month</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[8px] font-bold rounded-full uppercase tracking-widest border border-emerald-500/20">
              {paidCategories.length} Paid
            </span>
            <span className="px-2 py-0.5 bg-app-muted/10 text-app-muted text-[8px] font-bold rounded-full uppercase tracking-widest border border-app-border">
              {billItems.length - paidCategories.length} Due
            </span>
          </div>
          <button 
            onClick={onManage}
            className="p-1.5 hover:bg-app-muted/10 rounded-md transition-all text-app-muted hover:text-app-text border border-transparent hover:border-app-border group"
            title="Manage Monthly Budgets"
          >
            <Settings size={14} className="group-hover:rotate-45 transition-transform" />
          </button>
        </div>
      </div>
      
      <div className="divide-y divide-app-border max-h-[400px] overflow-y-auto custom-scrollbar">
        {billItems.length > 0 ? (
          billItems.map((item) => (
            <div 
              key={item.key} 
              className={`p-4 flex items-center justify-between transition-all group hover:bg-app-muted/5 ${item.isPaid ? 'opacity-60' : ''}`}
            >
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleToggle(item.key)}
                  disabled={loadingCategory !== null}
                  className={`w-5 h-5 rounded-sm border flex items-center justify-center transition-all ${
                    item.isPaid 
                      ? 'bg-emerald-500 border-emerald-500 text-white' 
                      : 'border-app-border bg-transparent group-hover:border-brand'
                  } ${loadingCategory !== null ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                  {loadingCategory === item.key ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : item.isPaid ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : null}
                </button>
                <div>
                  <p className={`text-sm font-bold ${item.isPaid ? 'text-app-muted line-through' : 'text-app-text'}`}>
                    {item.label}
                  </p>
                  <p className="text-[10px] text-app-muted font-mono uppercase">Monthly Budgeted</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-mono font-bold ${item.isPaid ? 'text-app-muted' : 'text-app-text'}`}>
                  ${item.amount.toLocaleString()}
                </p>
                {item.isPaid && (
                  <p className="text-[8px] text-emerald-500 font-bold uppercase tracking-widest">Logged</p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center">
            <p className="text-app-muted text-sm italic">No recurring bills set up in profile.</p>
          </div>
        )}
      </div>
      
      <div className="p-4 bg-app-muted/5 border-t border-app-border">
        <p className="text-[9px] text-app-muted leading-relaxed italic">
          Tip: Checking a bill marks it as "paid" for this month's budget and automatically logs it as an expense in your history.
        </p>
      </div>
    </div>
  );
}
