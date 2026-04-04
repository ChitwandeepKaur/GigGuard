import React, { useState } from 'react';
import axios from 'axios';
import { useStore } from '../store';
import { Upload, FileText, CheckCircle, Loader2 } from 'lucide-react';

export default function InsuranceHub() {
  const { setPolicyText, policyText } = useStore();
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
      const res = await axios.post('http://localhost:3001/api/ai/upload-policy', formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || 'test-token'}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setPolicyText(res.data.extractedText);
    } catch (err) {
      console.error(err);
      setError('Failed to process policy document');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-display text-brand mb-2">Insurance Hub</h2>
        <p className="text-app-muted">Policy analysis and AI-powered recommendations.</p>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-8">
        <h3 className="text-xl font-medium mb-4 flex items-center gap-2">
          <FileText className="text-brand" />
          Your Policy Document
        </h3>
        
        {policyText ? (
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 flex flex-col items-center justify-center space-y-4 text-center">
            <CheckCircle className="text-green-500" size={48} />
            <div>
              <p className="font-medium text-green-500">Policy loaded successfully!</p>
              <p className="text-sm text-app-muted mt-1">You can now ask the GigGuard Assistant "what if" questions based on your coverage.</p>
            </div>
            <button 
              onClick={() => setPolicyText('')}
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
    </div>
  );
}
