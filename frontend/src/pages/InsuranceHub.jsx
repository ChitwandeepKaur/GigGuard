import { useState } from 'react';
import api from '../services/api';
import { useStore } from '../store';
import { Upload, FileText, CheckCircle, Loader2, ShieldCheck, XCircle, DollarSign, Calendar, Target, Brain } from 'lucide-react';
import QuizGame from '../components/insurance/QuizGame';

export default function InsuranceHub() {
  const { setPolicyText, policyText, policySummary, setPolicySummary } = useStore();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

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
    } catch (err) {
      console.error(err);
      setError('Failed to process policy document');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-10 w-full space-y-10">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            
            <div className="mt-6 bg-brand/10 border border-brand/20 p-4 rounded-xl flex items-start gap-3">
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
          <div className="border-2 border-dashed border-border rounded-xl p-12 flex flex-col items-center justify-center text-center space-y-4 hover:border-brand/50 transition-colors bg-app-bg group">
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
      <div className="bg-surface border border-border rounded-2xl p-8">
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
