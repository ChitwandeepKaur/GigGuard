import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import IncomeProfiler from '../components/onboarding/IncomeProfiler';
import ExpenseSetup from '../components/onboarding/ExpenseSetup';
import InsuranceStep from '../components/onboarding/InsuranceStep';
import ProfileViewer from '../components/onboarding/ProfileViewer';
import api from '../services/api';

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [isEditing, setIsEditing] = useState(false);
  const [hasExistingProfile, setHasExistingProfile] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState(() => {
    const savedDraft = localStorage.getItem('onboardingDraft');
    if (savedDraft) {
      try {
        return JSON.parse(savedDraft);
      } catch (e) {
        console.error("Failed to parse saved draft:", e);
      }
    }
    return {
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
    };
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        setIsEditing(true);
        return;
      }
      try {
        const res = await api.get('/api/user/dashboard');
        if (res.data?.profile) {
          setFormData({
            gig_types: res.data.profile.gig_types || [],
            income_frequency: res.data.profile.income_frequency || 'weekly',
            weekly_low: res.data.profile.weekly_low || '',
            weekly_high: res.data.profile.weekly_high || '',
            worst_week: res.data.profile.worst_week || '',
            best_week: res.data.profile.best_week || '',
            rent: res.data.expenses?.rent || '',
            utilities: res.data.expenses?.utilities || '',
            debt_minimums: res.data.expenses?.debt_minimums || '',
            transport: res.data.expenses?.transport || '',
            groceries: res.data.expenses?.groceries || '',
            insurance_cost: res.data.expenses?.insurance_cost || '',
            phone: res.data.expenses?.phone || '',
            subscriptions: res.data.expenses?.subscriptions || '',
            eating_out: res.data.expenses?.eating_out || '',
            shopping: res.data.expenses?.shopping || '',
            entertainment: res.data.expenses?.entertainment || ''
          });
          setHasExistingProfile(true);
          setIsEditing(false);
        } else {
          setIsEditing(true);
        }
      } catch(e) {
        setIsEditing(true);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    if (isEditing) {
      localStorage.setItem('onboardingDraft', JSON.stringify(formData));
    }
  }, [formData, isEditing]);

  const nextStep = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep(s => s + 1);
  };
  
  const prevStep = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep(s => s - 1);
  };

  const handleComplete = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      localStorage.setItem('pendingProfile', JSON.stringify(formData));
      navigate('/auth');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      await api.post('/api/user/profile', formData);
      localStorage.removeItem('onboardingDraft');
      if (hasExistingProfile) {
        setIsEditing(false);
        setStep(0);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        navigate('/dashboard');
        window.location.reload(); // Force Navbar text refresh
      }
    } catch (err) {
      console.error(err);
      setError('Failed to save profile. Make sure you are logged in and the server is running properly.');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand"></div>
      </div>
    );
  }

  if (!isEditing && hasExistingProfile) {
    return (
      <div className="min-h-screen bg-app-bg py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-4xl mx-auto relative">
          <ProfileViewer profileData={formData} onEdit={() => setIsEditing(true)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl mx-auto">
        {hasExistingProfile && (
           <div className="mb-6">
             <button onClick={() => { setIsEditing(false); setStep(0); }} className="text-sm font-bold text-app-muted hover:text-brand transition-colors flex items-center gap-1">
               ← Cancel Editing
             </button>
           </div>
        )}
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
