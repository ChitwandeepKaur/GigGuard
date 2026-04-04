import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import IncomeProfiler from '../components/onboarding/IncomeProfiler';
import ExpenseSetup from '../components/onboarding/ExpenseSetup';
import InsuranceStep from '../components/onboarding/InsuranceStep';
import api from '../services/api';

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    gig_types: [],
    income_frequency: 'weekly',
    weekly_low: '',
    weekly_high: '',
    worst_week: '',
    best_week: '',
    rent: '',
    utilities: '',
    debt_minimums: '',
    transport: '',
    groceries: '',
    insurance_cost: '',
    phone: '',
    subscriptions: '',
    eating_out: '',
    shopping: '',
    entertainment: ''
  });

  const nextStep = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep(s => s + 1);
  };
  
  const prevStep = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep(s => s - 1);
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      await api.post('/api/user/profile', formData);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Failed to save profile. Make sure you are logged in and the server is running properly.');
      // Fallback navigation occasionally used for demos if backend fails completely
      // navigate('/dashboard');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return <IncomeProfiler formData={formData} setFormData={setFormData} onNext={nextStep} />;
      case 1:
        return <ExpenseSetup formData={formData} setFormData={setFormData} onNext={nextStep} onBack={prevStep} />;
      case 2:
        return <InsuranceStep formData={formData} isSubmitting={isSubmitting} onComplete={handleComplete} onBack={prevStep} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-app-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl mx-auto">
        <div className="flex justify-center items-center gap-3 mb-10">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center">
              <div 
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  i === step 
                    ? 'bg-primary ring-4 ring-primary/20 scale-125' 
                    : i < step 
                      ? 'bg-primary' 
                      : 'bg-gray-200'
                }`}
              />
              {i < 2 && (
                <div className={`w-12 h-1 mx-2 rounded-full transition-colors duration-300 ${
                  i < step ? 'bg-primary' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-md text-sm shadow-sm flex items-center">
            <span className="mr-3 text-lg">⚠️</span>
            {error}
          </div>
        )}
        
        <div className="transition-all duration-500 relative">
          {renderStep()}
        </div>
      </div>
    </div>
  );
}
