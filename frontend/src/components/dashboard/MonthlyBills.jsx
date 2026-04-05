import React from 'react';
import api from '../../services/api';

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

export default function MonthlyBills({ expenses, onUpdate }) {
  if (!expenses) return null;

  const paidCategories = expenses.paid_categories || [];
  
  const handleToggle = async (category) => {
    try {
      await api.post('/api/finance/toggle-bill', { category });
      onUpdate();
    } catch (err) {
      console.error('Error toggling bill:', err);
      alert('Failed to update bill status.');
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
        <div className="flex gap-2">
          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[8px] font-bold rounded-full uppercase tracking-widest border border-emerald-500/20">
            {paidCategories.length} Paid
          </span>
          <span className="px-2 py-0.5 bg-app-muted/10 text-app-muted text-[8px] font-bold rounded-full uppercase tracking-widest border border-app-border">
            {billItems.length - paidCategories.length} Due
          </span>
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
                  className={`w-5 h-5 rounded-sm border flex items-center justify-center transition-all ${
                    item.isPaid 
                      ? 'bg-emerald-500 border-emerald-500 text-white' 
                      : 'border-app-border bg-transparent group-hover:border-brand'
                  }`}
                >
                  {item.isPaid && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
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
