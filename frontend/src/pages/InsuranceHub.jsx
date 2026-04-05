import { useState } from 'react';
import api from '../services/api';
import { useStore } from '../store';
import { Upload, FileText, CheckCircle, Loader2, ShieldCheck, XCircle, DollarSign, Calendar, Target, Brain, AlertTriangle } from 'lucide-react';
import QuizGame from '../components/insurance/QuizGame';

export default function InsuranceHub() {
  const { setPolicyText, policyText, policySummary, setPolicySummary } = useStore();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  
  const [comparisonData, setComparisonData] = useState(null);
  const [isComparing, setIsComparing] = useState(false);

  const fetchComparison = async (text) => {
    setIsComparing(true);
    setComparisonData(null);
    try {
      const res = await api.post('/api/ai/compare-policy', { policyText: text, gigType: 'rideshare/delivery' });
      setComparisonData(res.data.comparison);
    } catch (err) {
      console.error('Comparison fetch failed', err);
    } finally {
      setIsComparing(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('policyFile', file);
    
    try {
      const res = await api.post('/api/ai/upload-policy', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setPolicyText(res.data.extractedText);
      setPolicySummary(res.data.summary);
      
      // Trigger waterfall loading of comparison table with a slight delay to avoid burst rate limits
      setIsComparing(true);
      setTimeout(() => fetchComparison(res.data.extractedText), 2000);
    } catch (err) {
      console.error(err);
      setError('Failed to process policy document');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4 sm:p-10 w-full space-y-10 pb-24">
      <div>
        <h2 className="text-3xl font-display text-brand mb-2">Insurance Hub</h2>
        <p className="text-app-muted">Policy analysis and AI-powered recommendations.</p>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-8">
        <h3 className="text-xl font-medium mb-4 flex items-center gap-2">
          <FileText className="text-brand" />
          Your Policy Document
        </h3>
        
        {policyText && policySummary ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border">
               <div>
                 <h4 className="text-lg font-medium text-app-text flex items-center gap-2">
                   Plain-English Digest
                 </h4>
                 <p className="text-sm text-app-muted mt-1">Here is exactly what your uploaded policy covers and what it does not.</p>
               </div>
               <button 
                onClick={() => { setPolicyText(''); setPolicySummary(null); }}
                className="text-sm px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors font-medium border border-red-500/20"
              >
                Upload Different Policy
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
               {/* Covered Card */}
               <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4 text-green-500">
                    <ShieldCheck size={28} />
                    <h5 className="font-semibold text-lg">What IS Covered</h5>
                  </div>
                  <ul className="space-y-3">
                    {policySummary.isCovered?.map((item, i) => (
                       <li key={i} className="flex items-start gap-2 text-sm text-app-text">
                         <span className="text-green-500 mt-0.5">•</span>
                         <span className="leading-relaxed">{item}</span>
                       </li>
                    ))}
                    {(!policySummary.isCovered || policySummary.isCovered.length === 0) && (
                       <li className="text-sm text-app-muted italic">No covered items extracted.</li>
                    )}
                  </ul>
               </div>

               {/* Not Covered Card */}
               <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4 text-red-500">
                    <XCircle size={28} />
                    <h5 className="font-semibold text-lg">What is NOT Covered</h5>
                  </div>
                  <ul className="space-y-3">
                    {policySummary.notCovered?.map((item, i) => (
                       <li key={i} className="flex items-start gap-2 text-sm text-app-text">
                         <span className="text-red-500 mt-0.5">•</span>
                         <span className="leading-relaxed">{item}</span>
                       </li>
                    ))}
                    {(!policySummary.notCovered || policySummary.notCovered.length === 0) && (
                       <li className="text-sm text-app-muted italic">No exclusions extracted.</li>
                    )}
                  </ul>
               </div>

               {/* Hidden Terms Card */}
               <div className="bg-orange-500/5 border border-orange-500/20 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4 text-orange-500">
                    <AlertTriangle size={28} />
                    <h5 className="font-semibold text-lg">Hidden Terms</h5>
                  </div>
                  <ul className="space-y-3">
                    {policySummary.hiddenTerms?.map((item, i) => (
                       <li key={i} className="flex items-start gap-2 text-sm text-app-text">
                         <span className="text-orange-500 mt-0.5">•</span>
                         <span className="leading-relaxed">{item}</span>
                       </li>
                    ))}
                    {(!policySummary.hiddenTerms || policySummary.hiddenTerms.length === 0) && (
                       <li className="text-sm text-app-muted italic">No hidden terms extracted.</li>
                    )}
                  </ul>
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border">
               {/* Deductible */}
               <div className="bg-surface border border-border rounded-xl p-4 flex flex-col justify-center items-center text-center hover:border-brand/50 transition-colors">
                  <DollarSign className="text-brand mb-2" size={24} />
                  <p className="text-xs text-app-muted uppercase tracking-wider font-semibold mb-1">Deductible</p>
                  <p className="text-lg font-medium text-app-text">{policySummary.deductible || 'Not specified'}</p>
               </div>

               {/* Coverage Limits */}
               <div className="bg-surface border border-border rounded-xl p-4 flex flex-col justify-center items-center text-center hover:border-brand/50 transition-colors">
                  <Target className="text-brand mb-2" size={24} />
                  <p className="text-xs text-app-muted uppercase tracking-wider font-semibold mb-1">Coverage Limits</p>
                  <p className="text-lg font-medium text-app-text">{policySummary.coverageLimits || 'Not specified'}</p>
               </div>

               {/* Renewal Date */}
               <div className="bg-surface border border-border rounded-xl p-4 flex flex-col justify-center items-center text-center hover:border-brand/50 transition-colors">
                  <Calendar className="text-brand mb-2" size={24} />
                  <p className="text-xs text-app-muted uppercase tracking-wider font-semibold mb-1">Renewal Date</p>
                  <p className="text-lg font-medium text-app-text">{policySummary.renewalDate || 'Not specified'}</p>
               </div>
            </div>
            
            {/* Coverage Comparison Table */}
            <div className="mt-10">
               <div className="flex items-center justify-between mb-4">
                 <h4 className="text-lg font-medium text-app-text">Coverage Comparison</h4>
               </div>
               
               {isComparing ? (
                 <div className="bg-surface border border-border rounded-xl p-8 flex flex-col items-center justify-center space-y-4">
                   <Loader2 className="animate-spin text-brand" size={32} />
                   <p className="text-sm text-app-muted animate-pulse">Running matrix comparison against State Farm products...</p>
                 </div>
               ) : comparisonData ? (
                 <div className="overflow-x-auto border border-border rounded-xl">
                   <table className="w-full text-left text-sm border-collapse">
                     <thead>
                       <tr className="border-b border-border bg-app-bg text-app-muted">
                         <th className="font-medium p-4 font-mono uppercase tracking-widest text-[10px]">Scenario</th>
                         <th className="font-medium p-4 font-mono uppercase tracking-widest text-[10px] border-l border-border">Your Uploaded Policy</th>
                         <th className="font-medium p-4 font-mono uppercase tracking-widest text-[10px] bg-brand/5 border-l border-brand/20">State Farm Rideshare</th>
                         <th className="font-medium p-4 font-mono uppercase tracking-widest text-[10px] bg-brand/10 border-l border-brand/30 text-brand">
                             Commercial Auto <span className="ml-2 inline-flex items-center gap-1 bg-brand text-white px-2 py-0.5 rounded-full text-[8px] font-bold">BEST MATCH</span>
                         </th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-border bg-surface">
                       {comparisonData.map((row, idx) => {
                         const renderIcon = (status) => {
                           if (status === 'covered') return <span className="flex items-center gap-1.5 text-green-500 font-medium"><CheckCircle size={16}/> Covered</span>;
                           if (status === 'not_covered') return <span className="flex items-center gap-1.5 text-red-500 font-medium"><XCircle size={16}/> Gap</span>;
                           return <span className="flex items-center gap-1.5 text-amber-500 font-medium"><AlertTriangle size={16}/> Partial</span>;
                         };
                         return (
                           <tr key={idx} className="hover:bg-app-bg transition-colors">
                             <td className="p-4 font-medium text-app-text">{row.feature}</td>
                             <td className="p-4 border-l border-border">{renderIcon(row.userPolicy)}</td>
                             <td className="p-4 bg-brand/5 border-l border-brand/10">{renderIcon(row.ridesharePolicy)}</td>
                             <td className="p-4 bg-brand/10 border-l border-brand/20">{renderIcon(row.commercialPolicy)}</td>
                           </tr>
                         );
                       })}
                     </tbody>
                   </table>
                 </div>
               ) : null}
            </div>
            
            <div className="mt-8 bg-brand/10 border border-brand/20 p-4 rounded-xl flex items-start gap-3">
               <div className="bg-brand text-white p-2 rounded-full shrink-0">
                 <ShieldCheck size={18} />
               </div>
               <div>
                 <p className="text-sm font-medium text-brand">GigGuard AI Active</p>
                 <p className="text-sm text-app-muted mt-1">
                   Have "what if" questions? Just ask the assistant on the right.
                 </p>
               </div>
            </div>

          </div>

        ) : policyText ? (
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 flex flex-col items-center justify-center space-y-4 text-center">
            <CheckCircle className="text-green-500" size={48} />
            <div>
              <p className="font-medium text-green-500">Policy loaded successfully but summary failed!</p>
              <p className="text-sm text-app-muted mt-1">You can still ask the GigGuard Assistant questions.</p>
            </div>
            <button 
              onClick={() => { setPolicyText(''); setPolicySummary(null); }}
              className="text-sm text-red-400 hover:text-red-300 underline mt-4"
            >
              Remove Document
            </button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-border rounded-xl p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-4 hover:border-brand/50 transition-colors bg-app-bg group">
            {isUploading ? (
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="animate-spin text-brand" size={48} />
                <p className="text-app-muted text-sm animate-pulse">Analyzing document with AI...</p>
              </div>
            ) : (
              <>
                <div className="p-4 bg-brand/10 rounded-full group-hover:scale-110 transition-transform">
                  <Upload className="text-brand" size={32} />
                </div>
                <div>
                  <p className="font-medium">Upload your insurance policy</p>
                  <p className="text-sm text-app-muted mt-1">Supported formats: PDF (up to 10MB)</p>
                </div>
                <label className="cursor-pointer bg-brand hover:bg-brand-light text-white px-6 py-2 rounded-lg font-medium transition-colors">
                  Select File
                  <input 
                    type="file" 
                    accept=".pdf" 
                    className="hidden" 
                    onChange={handleFileUpload}
                  />
                </label>
              </>
            )}
          </div>
        )}
        
        {error && (
          <p className="text-red-400 text-sm mt-4 text-center">{error}</p>
        )}
      </div>

      {/* ── Quiz Card — always visible ── */}
      <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8">
        <h3 className="text-xl font-medium mb-1 flex items-center gap-2">
          <Brain className="text-brand" size={22} />
          Policy Knowledge Quiz
        </h3>
        <p className="text-sm text-app-muted mb-6">
          {policyText
            ? 'Quiz generated from your uploaded policy.'
            : 'No policy uploaded yet — try the demo quiz to see how it works.'}
        </p>
        <QuizGame />
      </div>
    </div>
  );
}
