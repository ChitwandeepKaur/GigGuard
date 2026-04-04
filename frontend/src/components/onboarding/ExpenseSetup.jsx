import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';

export default function ExpenseSetup({ formData, setFormData, onNext, onBack }) {
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getNum = (val) => Number(val) || 0;
  
  // Calculate running survival number
  const nonNegotiableSum = 
    getNum(formData.rent) + 
    getNum(formData.utilities) + 
    getNum(formData.debt_minimums) + 
    getNum(formData.transport) + 
    getNum(formData.groceries) + 
    getNum(formData.insurance_cost);
    
  const survivalNumber = (nonNegotiableSum / 4.33).toFixed(2);

  const isFormValid = () => {
    // Making core non-negotiables required so Survival Number isn't just zero.
    // If they have zero rent, they should explicitly type '0'.
    return (
      formData.rent !== '' &&
      formData.utilities !== '' &&
      formData.groceries !== ''
    );
  };

  return (
    <Card className="p-0 overflow-hidden shadow-md border-0">
      <div className="sticky top-0 bg-white z-10 p-6 border-b border-gray-100 shadow-sm">
        <h2 className="text-2xl font-syne text-brand mb-4">Expense Profiler</h2>
        <div className="bg-primary/5 border border-primary/20 text-primary p-4 rounded-xl flex justify-between items-center transition-all">
          <span className="font-semibold text-sm">Weekly Survival Number (Required)</span>
          <span className="text-3xl font-bold font-mono tracking-tight">${survivalNumber}</span>
        </div>
      </div>

      <div className="p-6 space-y-8 max-h-[60vh] overflow-y-auto">
        <section className="bg-danger/5 p-5 rounded-xl border border-danger/10">
          <h3 className="font-bold text-danger mb-1 text-lg flex items-center"><span className="mr-2">🚨</span> 1. Non-Negotiables (Monthly)</h3>
          <p className="text-sm text-danger/80 mb-4 font-medium">Things you absolutely must pay to survive.</p>
          <div className="grid grid-cols-2 gap-4">
            {['rent', 'utilities', 'debt_minimums', 'transport', 'groceries', 'insurance_cost'].map(field => {
              const isRequired = ['rent', 'utilities', 'groceries'].includes(field);
              return (
                <div key={field}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">
                    {field.replace('_', ' ')} ($) {isRequired && <span className="text-danger">*</span>}
                  </label>
                  <input type="number" name={field} className="w-full bg-white border border-gray-200 p-2.5 rounded-lg outline-none focus:border-danger focus:ring-1 focus:ring-danger transition-all text-sm" 
                    value={formData[field] || ''} onChange={handleChange} placeholder={isRequired ? "Required" : "0"} />
                </div>
              );
            })}
          </div>
        </section>

        <section className="bg-warn/5 p-5 rounded-xl border border-warn/10">
          <h3 className="font-bold text-warn mb-1 text-lg flex items-center"><span className="mr-2">⚠️</span> 2. Semi-Flexible (Monthly)</h3>
          <p className="text-sm text-warn/80 mb-4 font-medium">Important, but you could reduce or pause them.</p>
          <div className="grid grid-cols-2 gap-4">
            {['phone', 'subscriptions'].map(field => (
              <div key={field}>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">{field.replace('_', ' ')} ($)</label>
                <input type="number" name={field} className="w-full bg-white border border-gray-200 p-2.5 rounded-lg outline-none focus:border-warn focus:ring-1 focus:ring-warn transition-all text-sm" 
                  value={formData[field] || ''} onChange={handleChange} placeholder="0" />
              </div>
            ))}
          </div>
        </section>

        <section className="bg-gray-50 p-5 rounded-xl border border-gray-100">
          <h3 className="font-bold text-gray-600 mb-1 text-lg flex items-center"><span className="mr-2">☕</span> 3. Fully Flexible (Monthly)</h3>
          <p className="text-sm text-gray-500 mb-4 font-medium">Discretionary spending that changes weekly.</p>
          <div className="grid grid-cols-2 gap-4">
            {['eating_out', 'shopping', 'entertainment'].map(field => (
              <div key={field}>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">{field.replace('_', ' ')} ($)</label>
                <input type="number" name={field} className="w-full bg-white border border-gray-200 p-2.5 rounded-lg outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all text-sm" 
                  value={formData[field] || ''} onChange={handleChange} placeholder="0" />
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="p-6 bg-gray-50 border-t border-gray-100">
        {!isFormValid() && (
          <p className="text-sm text-gray-500 mb-3 text-center">Please fill out core required expenses (*) to continue.</p>
        )}
        <div className="flex gap-4">
          <Button variant="secondary" onClick={onBack} className="w-1/3 py-3">Back</Button>
          <Button onClick={onNext} disabled={!isFormValid()} className="w-2/3 py-3 shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
            Calculate Profile
          </Button>
        </div>
      </div>
    </Card>
  );
}
