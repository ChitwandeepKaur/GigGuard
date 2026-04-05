import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import useAuthStore from '../../store/useAuthStore';
import api from '../../services/api';

export default function AuthModal({ onComplete, onClose, isSubmitting }) {
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setAuth } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const response = await api.post(endpoint, { email, password });
      
      if (response.data.token) {
        setAuth(response.data.user, response.data.token);
        // After successful login/signup, proceed with the original completion
        onComplete();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4 overflow-y-auto">
      <Card className="w-full max-w-md p-8 shadow-2xl relative animate-in zoom-in-95 fill-mode-both duration-300">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-app-muted hover:text-brand transition-colors text-2xl font-bold p-2"
        >
          &times;
        </button>
        
        <h2 className="text-2xl font-display font-bold text-brand mb-2 text-center">
          {isLogin ? 'Sign In' : 'Create Account'}
        </h2>
        <p className="text-app-muted text-sm text-center mb-8 font-body">
          {isLogin ? 'Sign in to save your profile permanently.' : 'Create a profile to secure your gig work future.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input 
            type="email" 
            placeholder="worker@gig.com"
            className="w-full !rounded-[12px] border-app-border p-3 focus:border-brand focus:ring-1 focus:ring-brand outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Secure Password"
              className="w-full !rounded-[12px] border-app-border p-3 pr-10 focus:border-brand focus:ring-1 focus:ring-brand outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-brand transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {error && <p className="text-danger text-xs italic font-body">{error}</p>}
          
          <Button 
            type="submit" 
            className="w-full !py-3 shadow-md !rounded-[16px]"
            disabled={loading || isSubmitting}
          >
            {loading ? 'Authenticating...' : (isLogin ? 'Log In & Save' : 'Create & Save Profile')}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-brand font-bold text-sm hover:underline"
          >
            {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </Card>
    </div>
  );
}
