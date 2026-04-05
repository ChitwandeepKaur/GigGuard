import React, { useState } from 'react';
import Modal from '../ui/Modal';
import api from '../../services/api';
import { Loader2, DollarSign, AlertCircle } from 'lucide-react';

const GROUPS = [
  {
    title: 'Non-Negotiables',
    classes: 'bg-red-500/5 border-red-500/10 text-red-500',
    keys: ['rent', 'utilities', 'debt_minimums', 'transport', 'groceries', 'insurance_cost']
  },
  {
    title: 'Semi-Flexible',
    classes: 'bg-amber-500/5 border-amber-500/10 text-amber-500',
    keys: ['phone', 'subscriptions']
  },
  {
    title: 'Fully Flexible',
    classes: 'bg-emerald-500/5 border-emerald-500/10 text-emerald-500',
    keys: ['eating_out', 'shopping', 'entertainment']
  }
];

const LABELS = {
  rent: 'Rent / Mortgage',
  utilities: 'Utilities',
  debt_minimums: 'Debt Min',
  transport: 'Transport',
  groceries: 'Groceries',
  insurance_cost: 'Insurance',
  phone: 'Phone',
  subscriptions: 'Subscriptions',
  eating_out: 'Dining',
  shopping: 'Shopping',
  entertainment: 'Fun'
};

export default function ManageBillsModal({ isOpen, onClose, expenses, onUpdate }) {
  const [formData, setFormData] = useState(expenses || {});
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: Number(e.target.value) });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      await api.patch('/api/user/expenses', formData);
      onUpdate();
      onClose();
    } catch (err) {
      console.error('Save failed:', err);
      setError('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manage Monthly Bills">
      <div className="space-y-6 pb-6">
        <p className="text-sm text-app-muted leading-relaxed">
          Adjust your monthly budgeted amounts below. Setting an amount to <span className="text-app-text font-bold text-white">$0</span> will remove it from your dashboard tracker.
        </p>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-md flex items-center gap-2 text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <div className="space-y-8">
          {GROUPS.map((group) => (
            <section key={group.title} className={`p-4 rounded-xl border ${group.classes}`}>
              <h4 className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                {group.title}
              </h4>
              <div className="grid grid-cols-2 gap-4">
                {group.keys.map((key) => (
                  <div key={key}>
                    <label className="block text-[10px] font-mono uppercase tracking-tighter opacity-80 mb-1">
                      {LABELS[key]}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-app-muted text-xs">$</span>
                      </div>
                      <input 
                        type="number" 
                        name={key}
                        value={formData[key] || 0}
                        onChange={handleChange}
                        className="block w-full pl-7 pr-3 py-2 bg-app-bg border border-app-border rounded-lg text-sm text-app-text focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
                        placeholder="0"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="sticky bottom-0 pt-4 bg-app-card mt-6 border-t border-app-border flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg border border-app-border text-sm font-bold uppercase tracking-widest hover:bg-app-muted/10 transition-all shadow-sm"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex-[2] px-4 py-2.5 rounded-lg bg-brand text-white text-sm font-bold uppercase tracking-widest hover:bg-brand-dark transition-all shadow-lg flex items-center justify-center gap-2"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : 'Save Changes'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
