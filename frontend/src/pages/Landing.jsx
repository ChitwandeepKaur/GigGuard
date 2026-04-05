import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import { ShieldCheck, Calculator, Coins, Brain } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');
  
  return (
    <div className="min-h-screen bg-app-bg overflow-x-hidden flex flex-col pt-8">
      {/* Hero Section */}
      <section className="relative px-6 pt-16 pb-24 lg:pt-32 lg:pb-32 max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-center gap-12 z-10">
        
        {/* Text Content */}
        <div className="flex-1 text-center lg:text-left space-y-8 animate-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs font-bold uppercase tracking-widest mb-2">
            <ShieldCheck size={16} />
            Your Financial Safety Net
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-display font-extrabold text-app-text leading-[1.1]">
            Security for the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-emerald-400">
              Gig Economy.
            </span>
          </h1>
          
          <p className="text-lg lg:text-xl text-app-muted max-w-xl mx-auto lg:mx-0 font-body leading-relaxed">
            Stop stressing over irregular income. GigGuard automatically tracks your taxes, builds your safety net, and analyzes confusing insurance policies using AI.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-4">
            <Button 
              onClick={() => navigate('/onboarding')}
              className="w-full sm:w-auto !rounded-2xl !px-10 !py-4 shadow-[0_0_40px_-10px_rgba(0,169,145,0.6)] text-lg transform hover:scale-105 hover:-translate-y-1 transition-all"
            >
              Get Started
            </Button>

            {!isLoggedIn ? (
              <Button 
                variant="secondary"
                onClick={() => navigate('/auth')}
                className="w-full sm:w-auto !rounded-2xl !px-10 !py-4 shadow-md text-lg transform hover:scale-105 transition-all text-app-muted hover:text-app-text bg-surface border-border"
              >
                Login / Signup
              </Button>
            ) : (
              <Button 
                variant="secondary"
                onClick={() => navigate('/dashboard')}
                className="w-full sm:w-auto !rounded-2xl !px-10 !py-4 shadow-md text-lg transform hover:scale-105 transition-all text-app-muted hover:text-app-text bg-surface border-border"
              >
                Go to Dashboard
              </Button>
            )}
          </div>
        </div>

        {/* Hero Image */}
        <div className="flex-1 w-full max-w-lg lg:max-w-none relative animate-in zoom-in-95 duration-1000 delay-150 fill-mode-both">
          <div className="absolute inset-0 bg-brand/20 blur-[100px] rounded-full mix-blend-multiply"></div>
          <img 
            src="/hero-illustration.png" 
            alt="GigGuard Dashboard UI" 
            className="w-full h-auto drop-shadow-2xl object-contain relative z-10 animate-[float_6s_ease-in-out_infinite]"
          />
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="px-6 pb-32 max-w-7xl mx-auto w-full z-10 relative">
         <div className="text-center mb-16 animate-in fade-in duration-1000 delay-300 fill-mode-both">
           <h2 className="text-3xl lg:text-4xl font-display font-bold text-app-text">Everything you need to thrive</h2>
           <p className="text-app-muted mt-4 font-mono text-sm uppercase tracking-widest">Powered by Automation & AI</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-bottom-12 duration-1000 delay-500 fill-mode-both">
            
            <div className="bg-surface border border-border p-8 rounded-3xl hover:border-brand/50 hover:shadow-xl transition-all group flex flex-col items-start text-left">
              <div className="p-3 bg-brand/10 text-brand rounded-2xl mb-6 group-hover:scale-110 group-hover:bg-brand group-hover:text-white transition-all">
                <Coins size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Income Smoothing</h3>
              <p className="text-app-muted text-sm leading-relaxed">Turn variable gig payments into a predictable 'salary'. We calculate your safe-to-spend limit dynamically every week.</p>
            </div>

            <div className="bg-surface border border-border p-8 rounded-3xl hover:border-brand/50 hover:shadow-xl transition-all group flex flex-col items-start text-left">
              <div className="p-3 bg-brand/10 text-brand rounded-2xl mb-6 group-hover:scale-110 group-hover:bg-brand group-hover:text-white transition-all">
                <Calculator size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Tax Tracking</h3>
              <p className="text-app-muted text-sm leading-relaxed">Stay ahead of the IRS. We automatically estimate your 1099 tax burden so you are never caught off-guard at tax time.</p>
            </div>

            <div className="bg-surface border border-border p-8 rounded-3xl hover:border-brand/50 hover:shadow-xl transition-all group flex flex-col items-start text-left">
              <div className="p-3 bg-brand/10 text-brand rounded-2xl mb-6 group-hover:scale-110 group-hover:bg-brand group-hover:text-white transition-all">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Buffer Builder</h3>
              <p className="text-app-muted text-sm leading-relaxed">Automatically allocate excess cash into a bulletproof 3-6 month emergency fund according to your specific burn rate.</p>
            </div>

            <div className="bg-surface border border-border p-8 rounded-3xl hover:border-brand/50 hover:shadow-xl transition-all group flex flex-col items-start text-left lg:col-span-1 md:col-span-2">
              <div className="p-3 bg-brand/10 text-brand rounded-2xl mb-6 group-hover:scale-110 group-hover:bg-brand group-hover:text-white transition-all">
                <Brain size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">AI Insurance Hub</h3>
              <p className="text-app-muted text-sm leading-relaxed">Upload confusing insurance policies and let our AI translate them into a plain-English digest so you know exactly what is covered.</p>
            </div>

         </div>
      </section>

    </div>
  );
}
