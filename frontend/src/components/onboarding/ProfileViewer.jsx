import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { FileText, Briefcase, DollarSign, Edit3 } from 'lucide-react';
import api from '../../services/api';

export default function ProfileViewer({ profileData, onEdit }) {
  const [recommendations, setRecommendations] = useState(null);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);
  const [recError, setRecError] = useState('');
  
  useEffect(() => {
    const savedRecs = localStorage.getItem('insuranceRecommendations');
    if (savedRecs) {
      try {
        setRecommendations(JSON.parse(savedRecs));
      } catch (e) {}
    }
  }, []);

  const savedProfileStr = localStorage.getItem('recommendationsProfileData');
  const isStale = savedProfileStr !== JSON.stringify(profileData);
  const hasOldRecs = !!recommendations;

  const fetchRecommendations = async () => {
    setIsLoadingRecs(true);
    setRecError('');
    try {
      const response = await api.post('/api/ai/recommendation/preview', profileData);
      setRecommendations(response.data);
      localStorage.setItem('insuranceRecommendations', JSON.stringify(response.data));
      localStorage.setItem('recommendationsProfileData', JSON.stringify(profileData));
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
      setRecError('Failed to generate recommendations. Please try again.');
    } finally {
      setIsLoadingRecs(false);
    }
  };

  let buttonText = 'Get Recommendation Insurance';
  let isButtonDisabled = false;

  if (isLoadingRecs) {
    buttonText = 'Analyzing Profile...';
    isButtonDisabled = true;
  } else if (hasOldRecs) {
    if (isStale) {
      buttonText = 'Get recommendations according to new details';
      isButtonDisabled = false;
    } else {
      buttonText = 'Recommendations Generated';
      isButtonDisabled = true;
    }
  }

  if (!profileData) return null;

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center bg-app-card p-6 rounded-card border border-app-border shadow-sm">
        <div>
          <h2 className="text-2xl font-display font-bold text-brand">Profile Details</h2>
          <p className="text-app-muted text-sm mt-1">Your registered income and expense parameters.</p>
        </div>
        <Button onClick={onEdit} className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg shadow-md hover:bg-brand-dark transition-all">
          <Edit3 size={18} />
          Edit Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Income Card */}
        <Card className="p-6 border border-app-border">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-display font-bold text-brand flex items-center gap-2">
              <Briefcase size={20} /> Income Profile
            </h3>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase font-mono text-app-muted mb-1">Gig Types</p>
              <div className="flex flex-wrap gap-2">
                {profileData.gig_types?.map(t => (
                  <span key={t} className="px-2 py-1 bg-brand/10 text-brand rounded font-mono text-xs font-bold uppercase tracking-widest">{t}</span>
                ))}
              </div>
            </div>
            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
              <div>
                <p className="text-xs uppercase font-mono text-app-muted mb-1">Typical Week</p>
                <p className="font-bold text-gray-800">${profileData.weekly_low} - ${profileData.weekly_high}</p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase font-mono text-app-muted mb-1">Frequency</p>
                <p className="font-bold text-gray-800 capitalize">{profileData.income_frequency}</p>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
               <div>
                  <p className="text-[10px] uppercase font-mono text-rose-500 mb-1">Worst Week</p>
                  <p className="font-bold text-rose-600">${profileData.worst_week}</p>
               </div>
               <div className="text-right">
                  <p className="text-[10px] uppercase font-mono text-emerald-500 mb-1">Best Week</p>
                  <p className="font-bold text-emerald-600">${profileData.best_week}</p>
               </div>
            </div>
            
            {(profileData.available_cash !== undefined && profileData.available_cash !== '') && (
              <div className="mt-2 bg-brand/5 p-3 rounded-md border border-brand/10 flex justify-between items-center">
                 <div>
                    <p className="text-[10px] sm:text-xs uppercase font-mono text-brand mb-1 font-bold">Available Savings</p>
                    <p className="text-xs text-brand/70">Current cash buffer</p>
                 </div>
                 <div className="text-right">
                    <p className="text-lg font-bold text-brand">${profileData.available_cash}</p>
                 </div>
              </div>
            )}
          </div>
        </Card>

        {/* Expenses Card */}
        <Card className="p-6 border border-app-border flex flex-col">
          <div className="mb-6">
            <h3 className="font-display font-bold text-brand flex items-center gap-2">
              <DollarSign size={20} /> Base Expenses (Monthly)
            </h3>
          </div>
          <div className="space-y-3 flex-1">
            <ExpenseRow label="Rent / Mortgage" amount={profileData.rent} />
            <ExpenseRow label="Utilities" amount={profileData.utilities} />
            <ExpenseRow label="Debt Minimums" amount={profileData.debt_minimums} />
            <ExpenseRow label="Transport/Gas" amount={profileData.transport} />
            <ExpenseRow label="Groceries" amount={profileData.groceries} />
            <ExpenseRow label="Insurance Cost" amount={profileData.insurance_cost} />
          </div>
          
          <div className="mt-6 pt-4 border-t border-app-border/50">
             <div className="flex justify-between items-center text-sm font-bold bg-app-muted/5 p-3 rounded-lg">
                <span className="text-gray-700">Total Survival Needs</span>
                <span className="text-brand text-lg">
                  ${[
                    profileData.rent, profileData.utilities, profileData.debt_minimums, 
                    profileData.transport, profileData.groceries, profileData.insurance_cost
                  ].reduce((a, b) => Number(a || 0) + Number(b || 0), 0) || 0}/mo
                </span>
             </div>
          </div>
        </Card>
      </div>

      <div className="mt-8 pt-8">
        <div className="flex flex-col items-center mb-6">
          <div className="relative group w-full sm:w-auto">
            <Button 
              onClick={fetchRecommendations} 
              disabled={isButtonDisabled}
              className="w-full sm:w-auto min-w-[250px] font-semibold transition-all z-10 relative"
              variant={isButtonDisabled && !isLoadingRecs ? "outline" : "primary"}
            >
              {isLoadingRecs ? <span className="flex items-center gap-2"><span className="animate-spin inline-block w-4 h-4 border-2 border-white rounded-full border-t-transparent"></span> {buttonText}</span> : buttonText}
            </Button>
            
            {isButtonDisabled && !isLoadingRecs && (
              <>
                <div className="absolute inset-0 cursor-not-allowed z-20" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-30 pointer-events-none shadow-lg">
                  Edit profile to view new recommendations
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                </div>
              </>
            )}
          </div>
          {recError && <p className="text-danger text-sm mt-2">{recError}</p>}
        </div>

        {recommendations && (
          <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-4">
             <h3 className="text-xl font-display font-bold text-brand mb-4">Recommended Coverages</h3>
             {isStale && (
               <div className="bg-warn/10 text-warn-dark p-3 rounded-lg text-sm border border-warn/20 mb-4">
                 ⚠️ Your profile has changed. These recommendations are based on your old details. Generate new ones to update them.
               </div>
             )}
             
             {recommendations.coverageGapScore && (
                <div className="mb-6 p-4 rounded-xl border border-red-500/20 bg-red-50/50 shadow-sm flex items-center justify-between max-w-sm">
                  <div>
                    <h3 className="text-xs text-red-600 uppercase tracking-wider font-bold mb-1">Coverage Gap Score</h3>
                  </div>
                  <div className="text-2xl font-bold bg-white px-4 py-2 rounded-lg border border-red-100 shadow-sm">
                    {recommendations.coverageGapScore}
                  </div>
                </div>
             )}
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {recommendations.recommendations?.map((rec, i) => (
                 <div key={i} className="p-4 border border-gray-200 border-l-4 border-l-brand rounded-xl bg-white shadow-sm hover:border-l-brand-dark transition-all">
                   <div className="flex justify-between items-start mb-2">
                     <h3 className="font-bold text-gray-800">{rec.product}</h3>
                     <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-widest ${
                        rec.priority === 'high' ? 'bg-danger/10 text-danger' : 
                        rec.priority === 'medium' ? 'bg-warn/10 text-warn' : 
                        'bg-safe/10 text-safe'
                      }`}>
                        {rec.priority}
                      </span>
                   </div>
                   <p className="text-sm text-gray-600 mb-3"><span className="font-semibold text-gray-700">Why:</span> {rec.reason}</p>
                   {rec.gap_description && (
                     <div className="bg-gray-50 p-3 rounded-md border border-gray-100 text-xs text-gray-600 italic">
                        "{rec.gap_description}"
                     </div>
                   )}
                 </div>
               ))}
             </div>
          </div>
        )}
      </div>

    </div>
  );
}

function ExpenseRow({ label, amount }) {
  if (!amount) return null;
  return (
    <div className="flex justify-between items-center border-b border-gray-50 pb-2 last:border-0 last:pb-0">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="font-mono font-bold text-gray-800">${amount}</span>
    </div>
  );
}
