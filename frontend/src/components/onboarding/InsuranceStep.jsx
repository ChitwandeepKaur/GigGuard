import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import api from '../../services/api';

export default function InsuranceStep({ formData, isSubmitting, onComplete, onBack }) {
  const [showSnapshot, setShowSnapshot] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [recommendationData, setRecommendationData] = useState(null);
  const [error, setError] = useState('');

  const getNum = (v) => Number(v) || 0;
  const nonNegotiableSum = getNum(formData.rent) + getNum(formData.utilities) + getNum(formData.debt_minimums) + getNum(formData.transport) + getNum(formData.groceries) + getNum(formData.insurance_cost);
  const survivalNumber = (nonNegotiableSum / 4.33).toFixed(2);

  const low = getNum(formData.weekly_low);
  const high = getNum(formData.weekly_high);
  const avg = (low + high) / 2 || 1;
  const volatilityScore = (((high - low) / avg) * 100).toFixed(0);

  let summaryText = '';
  if (volatilityScore > 50) {
    summaryText = `Your income is highly variable (${volatilityScore}% volatility). GigGuard will prioritize essentials-first planning and gap protection for your low weeks.`;
  } else if (volatilityScore > 20) {
    summaryText = `Your income has moderate variability. You have room to build a buffer during good weeks to cover the dips.`;
  } else {
    summaryText = `Your income is relatively stable! We will focus on optimizing your tax reserves and long-term savings.`;
  }

  const startAIGeneration = () => {
    setShowSnapshot(false);
    fetchRecommendations();
  };

  const fetchRecommendations = async () => {
    setIsLoading(true);
    let mounted = true;
    try {
      const response = await api.post('/api/ai/recommendation/preview', formData);
      if (mounted) {
        setRecommendationData(response.data);
        localStorage.setItem('insuranceRecommendations', JSON.stringify(response.data));
        localStorage.setItem('recommendationsProfileData', JSON.stringify(formData));
      }
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
      if (mounted) setError('Failed to securely generate AI recommendations. You can still complete your setup below.');
    } finally {
      if (mounted) setIsLoading(false);
    }
  };

  const renderSnapshot = () => (
    <div className="py-6 text-left animate-in slide-in-from-bottom-2 duration-500">
      <h2 className="text-3xl font-syne text-brand mb-6 text-center">Your Financial Snapshot</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-danger/10 p-4 rounded-xl border border-danger/20 text-center">
          <p className="text-sm font-semibold text-danger uppercase tracking-wider mb-1">Weekly Survival #</p>
          <p className="text-3xl font-bold font-mono text-danger-dark">${survivalNumber}</p>
        </div>
        <div className="bg-warn/10 p-4 rounded-xl border border-warn/20 text-center">
          <p className="text-sm font-semibold text-warn uppercase tracking-wider mb-1">Income Volatility</p>
          <p className="text-3xl font-bold font-mono text-warn-dark">{volatilityScore}%</p>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 text-gray-700 p-5 rounded-lg mb-8 italic shadow-sm">
        "{summaryText}"
      </div>

      <div className="text-center flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-gray-500">Ready to save your profile?</p>
          <Button onClick={onComplete} className="w-full py-4 text-lg shadow-md border-brand bg-brand text-white" disabled={isSubmitting}>
            {isSubmitting ? 'Processing...' : 'Complete Configuration'}
          </Button>
        </div>

        <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">Let's see what insurance coverages can protect this baseline.</p>
          <Button onClick={startAIGeneration} variant="secondary" className="w-full py-4 text-lg shadow-md border-brand text-brand">
            Get Recommended Insurances ✨
          </Button>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100 flex justify-center">
        <button onClick={onBack} disabled={isSubmitting} className="text-sm text-gray-400 hover:text-gray-600 underline">Wait, go back to expenses</button>
      </div>
    </div>
  );

  const renderRecommendations = () => {
    if (isLoading) {
      return (
        <div className="py-16 flex flex-col items-center justify-center animate-in fade-in duration-300">
          <div className="relative w-20 h-20 mb-8">
            <div className="absolute inset-0 border-4 border-brand/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center text-brand">
              <span className="text-xl">✨</span>
            </div>
          </div>
          <h2 className="text-3xl font-syne text-brand mb-4">Analyzing your profile...</h2>
          <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
            Google Gemini is computing your custom safe-to-spend targets, mapping your emergency buffer gaps, and evaluating your {volatilityScore}% volatility.
          </p>
        </div>
      );
    }

    return (
      <div className="py-6 text-left animate-in slide-in-from-right-4 duration-500">
        <h2 className="text-2xl font-syne text-brand mb-2">Your Custom AI Protection Plan</h2>
        
        {recommendationData?.coverageGapScore && (
          <div className="mb-6 p-4 rounded-xl border border-red-500/20 bg-red-50/50 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="text-xs text-red-600 uppercase tracking-wider font-bold mb-1">Overall Profile Evaluation</h3>
              <p className="text-sm text-gray-700 font-medium">Coverage Gap Score</p>
            </div>
            <div className="text-2xl font-bold bg-white px-4 py-2 rounded-lg border border-red-100 shadow-sm">
              {recommendationData.coverageGapScore}
            </div>
          </div>
        )}

        <p className="text-gray-500 mb-6 text-sm">
          Based on your gig work profile, Gemini recommends these State Farm coverages to close your income gaps:
        </p>

        {error && <div className="p-3 mb-4 bg-red-50 text-red-600 rounded text-sm">{error}</div>}

        <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
          {recommendationData?.recommendations?.length > 0 ? (
            recommendationData.recommendations.map((rec, i) => (
              <div key={i} className="p-4 border border-gray-200 border-l-4 border-l-red-500 rounded-xl bg-white hover:border-red-500/50 transition-colors shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-800">{rec.product}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold uppercase tracking-wider ${
                    rec.priority === 'high' ? 'bg-danger/10 text-danger' : 
                    rec.priority === 'medium' ? 'bg-warn/10 text-warn' : 
                    'bg-safe/10 text-safe'
                  }`}>
                    {rec.priority} Priority
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3"><span className="font-semibold text-gray-700">Why:</span> {rec.reason}</p>
                <div className="bg-gray-50 p-3 rounded-md border border-gray-100 text-sm">
                  <span className="font-semibold text-red-600 text-xs uppercase tracking-wider block mb-1">Coverage Gap Fixed:</span>
                  <span className="text-gray-600 italic">"{rec.gap_description}"</span>
                </div>
              </div>
            ))
          ) : (
            !error && <p className="text-center text-gray-500">No specific recommendations at this time.</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-6 pt-4 border-t border-gray-100">
          <Button variant="secondary" onClick={() => setShowSnapshot(true)} className="w-full sm:w-1/3 py-3" disabled={isSubmitting}>Back to Snapshot</Button>
          <Button onClick={onComplete} className="w-full sm:w-2/3 py-3 shadow-md" disabled={isSubmitting}>
            {isSubmitting ? 'Saving Profile...' : 'Complete Configuration'}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card className="p-8 text-center shadow-md border-0 min-h-[400px]">
      {showSnapshot ? renderSnapshot() : renderRecommendations()}
    </Card>
  );
}
