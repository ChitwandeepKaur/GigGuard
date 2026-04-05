import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../services/api';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/api/auth/me');
          setUser(res.data.user);
        } catch (err) {
          // Token is likely invalid or expired
          localStorage.removeItem('token');
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };
    
    fetchUser();
  }, [location.pathname]); // Re-runs when the user navigates (e.g. after login)

  const handleLogout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch(e) {
      console.error('Logout error', e);
    }
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };

  const links = [
    { name: 'Home', path: '/' },
    { name: 'Onboarding', path: '/onboarding' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Insurance Hub', path: '/insurance' },
  ];

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Gig Worker';

  return (
    <nav className="bg-app-card border-b border-app-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-brand font-display font-bold text-xl">
                GigGuard
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {links.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    location.pathname === link.path
                      ? 'border-brand text-brand'
                      : 'border-transparent text-app-muted hover:border-brand-light hover:text-app-text'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
          
          {/* Top Right Auth Section */}
          <div className="flex items-center">
            {user ? (
              <div 
                className="relative ml-3"
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                <div className="flex items-center cursor-pointer space-x-2 p-2 rounded-md hover:bg-gray-50 transition-colors">
                  <div className="h-8 w-8 rounded-full bg-brand/10 border border-brand/30 flex items-center justify-center text-brand font-bold uppercase overflow-hidden">
                    {displayName.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-gray-700 hidden sm:block">
                    {displayName}
                  </span>
                </div>

                {isDropdownOpen && (
                  <div className="absolute right-0 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none transition-all">
                    <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
                      Signed in as<br/>
                      <span className="font-medium text-gray-900 truncate block">{user.email}</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={() => navigate('/auth')}
                className="ml-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand hover:bg-brand-dark focus:outline-none"
              >
                Login / Signup
              </button>
            )}
          </div>
          
          <div className="flex items-center sm:hidden ml-2">
             {/* Mobile menu logic could go here later */}
          </div>
        </div>
      </div>
      <div className="sm:hidden border-t border-app-border">
        <div className="pt-2 pb-3 space-y-1">
          {links.map((link) => (
             <Link
              key={link.path}
              to={link.path}
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                location.pathname === link.path
                  ? 'bg-brand-surface border-brand text-brand'
                  : 'border-transparent text-app-muted hover:bg-app-bg hover:border-brand-light hover:text-app-text'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
