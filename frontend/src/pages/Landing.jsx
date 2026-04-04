import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function Landing() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 text-center">
      <h1 className="text-5xl font-display font-extrabold text-brand mb-6">GigGuard</h1>
      <p className="text-xl text-app-muted max-w-xl mb-12 font-body italic">
        Financial security for the modern gig economy.
      </p>
      <Button 
        onClick={() => navigate('/onboarding')}
        className="!rounded-[16px] !px-12 !py-4 shadow-lg text-lg transform hover:scale-105"
      >
        Get Started
      </Button>
      
    </div>
  );
}
