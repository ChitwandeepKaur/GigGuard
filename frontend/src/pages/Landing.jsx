import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 text-center">
      <h1 className="text-5xl font-display font-extrabold text-brand mb-6">GigGuard</h1>
      <p className="text-xl text-app-muted max-w-xl mb-12 font-body italic">
        Financial security for the modern gig economy.
      </p>
      <button 
        onClick={() => navigate('/onboarding')}
        className="px-12 py-4 bg-brand text-white font-bold rounded-hero hover:bg-brand-light transition-all transform hover:scale-105 shadow-lg"
      >
        Get Started
      </button>
    </div>
  );
}
