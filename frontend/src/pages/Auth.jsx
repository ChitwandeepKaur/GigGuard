import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import api from '../services/api';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const response = await api.post(endpoint, { email, password });
      
      const { token } = response.data;
      if (token) {
        localStorage.setItem('token', token);
      }

      // Automatically save pending onboarding profiles
      const pendingStr = localStorage.getItem('pendingProfile');
      if (pendingStr) {
        const pendingData = JSON.parse(pendingStr);
        try {
          await api.post('/api/user/profile', pendingData);
          localStorage.removeItem('pendingProfile');
        } catch (saveErr) {
          console.error("Failed to save pending profile:", saveErr);
        }
      }
      
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-xl border-t-4 border-t-brand">
        <h2 className="text-3xl font-syne text-brand text-center mb-2">
          {isLogin ? 'Welcome Back' : 'Join GigGuard'}
        </h2>
        <p className="text-center text-gray-500 mb-8 text-sm">
          {isLogin ? 'Sign in to access your financial tools' : 'Create an account to protect your income'}
        </p>
        
        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 rounded text-sm text-center border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email <span className="text-danger">*</span></label>
            <input 
              type="email" 
              required
              className="w-full p-3 border border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="worker@gigguard.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password <span className="text-danger">*</span></label>
            <input 
              type="password" 
              required
              className="w-full p-3 border border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" className="w-full py-4 mt-8 text-lg font-bold shadow-md hover:shadow-lg transition-shadow" disabled={isLoading}>
            {isLoading ? 'Processing...' : (isLogin ? 'Secure Login' : 'Create Account')}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-600 border-t border-gray-100 pt-6">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button"
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-brand font-bold hover:underline ml-1"
          >
            {isLogin ? 'Sign up here' : 'Log in here'}
          </button>
        </div>
      </Card>
    </div>
  );
}
