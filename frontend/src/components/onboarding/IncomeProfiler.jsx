import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';

export default function IncomeProfiler({ formData, setFormData, onNext }) {
  const handleGigToggle = (type) => {
    setFormData(prev => {
      const types = prev.gig_types.includes(type)
        ? prev.gig_types.filter(t => t !== type)
        : [...prev.gig_types, type];
      return { ...prev, gig_types: types };
    });
  };

  const isFormValid = () => {
    return (
      formData.gig_types.length > 0 &&
      formData.weekly_low !== '' &&
      formData.weekly_high !== '' &&
      formData.worst_week !== '' &&
      formData.best_week !== ''
    );
  };

  return (
    <Card className="p-6 shadow-md border-0">
      <h2 className="text-2xl font-syne text-brand mb-6 text-center">Let's map out your income</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-3 text-gray-700">What kind of gig work do you do? <span className="text-danger">*</span></label>
          <div className="flex flex-wrap gap-2">
            {['Rideshare', 'Food Delivery', 'Package Delivery', 'Freelance / Upwork', 'Retail / Shift', 'TaskRabbit', 'Pet Care', 'Other'].map(type => (
              <button
                key={type}
                onClick={() => handleGigToggle(type.toLowerCase())}
                className={`px-4 py-2 border rounded-full transition-colors text-sm font-medium ${formData.gig_types.includes(type.toLowerCase()) ? 'bg-brand text-white border-brand' : 'bg-white border-gray-300 text-gray-700 hover:border-brand hover:text-brand'}`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">Income Frequency <span className="text-danger">*</span></label>
          <div className="flex flex-wrap gap-3 sm:gap-6">
            {['daily', 'weekly', 'random'].map(freq => (
              <label key={freq} className="flex items-center space-x-2 cursor-pointer bg-gray-50 px-3 py-2 border rounded-lg hover:border-brand transition-colors">
                <input 
                  type="radio" 
                  name="income_frequency" 
                  checked={formData.income_frequency === freq}
                  onChange={() => setFormData({...formData, income_frequency: freq})}
                  className="accent-brand"
                />
                <span className="capitalize text-sm font-medium">{freq}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-1">Average Weekly Low ($) <span className="text-danger">*</span></label>
            <input type="number" className="w-full bg-white border border-gray-200 p-2 rounded-md outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all" 
              placeholder="e.g. 500"
              value={formData.weekly_low || ''} onChange={e => setFormData({...formData, weekly_low: e.target.value})} />
          </div>
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-1">Average Weekly High ($) <span className="text-danger">*</span></label>
            <input type="number" className="w-full bg-white border border-gray-200 p-2 rounded-md outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all" 
              placeholder="e.g. 1200"
              value={formData.weekly_high || ''} onChange={e => setFormData({...formData, weekly_high: e.target.value})} />
          </div>
          <div className="bg-warn/10 p-3 rounded-lg border border-warn/20">
            <label className="block text-sm font-medium text-warn mb-1">Absolute Worst Week ($) <span className="text-danger">*</span></label>
            <input type="number" className="w-full bg-white border border-warn/30 p-2 rounded-md outline-none focus:border-warn focus:ring-1 focus:ring-warn transition-all"
              placeholder="e.g. 250"
              value={formData.worst_week || ''} onChange={e => setFormData({...formData, worst_week: e.target.value})} />
          </div>
          <div className="bg-safe/10 p-3 rounded-lg border border-safe/20">
            <label className="block text-sm font-medium text-safe mb-1">Absolute Best Week ($) <span className="text-danger">*</span></label>
            <input type="number" className="w-full bg-white border border-safe/30 p-2 rounded-md outline-none focus:border-safe focus:ring-1 focus:ring-safe transition-all" 
              placeholder="e.g. 2100"
              value={formData.best_week || ''} onChange={e => setFormData({...formData, best_week: e.target.value})} />
          </div>
        </div>

        <div className="mt-8">
          {!isFormValid() && (
            <p className="text-sm text-gray-500 mb-3 text-center">Please fill out all required fields (*) to continue.</p>
          )}
          <Button onClick={onNext} disabled={!isFormValid()} className="w-full shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
            Continue to Expenses
          </Button>
        </div>
      </div>
    </Card>
  );
}
