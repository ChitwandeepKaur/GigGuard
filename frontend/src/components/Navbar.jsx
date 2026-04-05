import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Menu, X, User, LogOut } from 'lucide-react';
import api from '../services/api';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(!!localStorage.getItem('token'));
  
  const [showOnboardingAlert, setShowOnboardingAlert] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // { type: 'NAVIGATE' | 'LOGOUT', path?: string }

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        setIsAuthenticating(true);
        try {
          const res = await api.get('/api/auth/me');
          setUser(res.data.user);
        } catch (err) {
          // Token is likely invalid or expired
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          setUser(null);
        } finally {
          setIsAuthenticating(false);
        }
      } else {
        setUser(null);
        setIsAuthenticating(false);
      }
    };
    
    fetchUser();
    setIsMenuOpen(false); // Close menu on navigation
  }, [location.pathname]); // Re-runs when the user navigates (e.g. after login)

  const handleLogoutRequest = () => {
    if (location.pathname === '/onboarding') {
      setPendingAction({ type: 'LOGOUT' });
      setShowOnboardingAlert(true);
    } else {
      executeLogout();
    }
  };

  const executeLogout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch(e) {
      console.error('Logout error', e);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setUser(null);
    navigate('/');
  };

  const handleNavClick = (e, path) => {
    if (location.pathname === '/onboarding' && path !== '/onboarding') {
      e.preventDefault();
      setPendingAction({ type: 'NAVIGATE', path });
      setShowOnboardingAlert(true);
    }
  };

  const isLoggedIn = !!localStorage.getItem('token');

  const links = [
    { name: 'Home', path: '/' },
    { name: 'Onboarding', path: '/onboarding' },
    ...(isLoggedIn ? [{ name: 'Dashboard', path: '/dashboard' }] : []),
    { name: 'Insurance Hub', path: '/insurance' },
  ];

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Gig Worker';

  return (
    <nav className="bg-app-card border-b border-app-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link 
                to="/" 
                onClick={(e) => handleNavClick(e, '/')}
                className="text-brand font-display font-bold text-xl"
              >
                GigGuard
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {links.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={(e) => handleNavClick(e, link.path)}
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
          
          {/* Top Right Group: Auth + Mobile Menu */}
          <div className="flex items-center space-x-2">
            {/* Top Right Auth Section */}
            <div className="flex items-center">
              {isAuthenticating ? (
                <div className="ml-4 h-9 w-28 bg-gray-200/50 animate-pulse rounded-md" />
              ) : user ? (
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
                        onClick={handleLogoutRequest}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button 
                  onClick={(e) => {
                    handleNavClick(e, '/auth');
                    if (!e.defaultPrevented) navigate('/auth');
                  }}
                  className="ml-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand hover:bg-brand-dark focus:outline-none"
                >
                  Login / Signup
                </button>
              )}
            </div>
            
            <div className="flex items-center sm:hidden">
               <button
                 onClick={() => setIsMenuOpen(!isMenuOpen)}
                 className="inline-flex items-center justify-center p-2 rounded-md text-app-muted hover:text-brand hover:bg-app-muted/5 transition-colors focus:outline-none"
               >
                 <span className="sr-only">Open main menu</span>
                 {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
               </button>
            </div>
          </div>
        </div>
      </div>
      {/* Mobile Menu Content */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} sm:hidden border-t border-app-border bg-app-card animate-in slide-in-from-top duration-300`}>
        <div className="pt-2 pb-3 space-y-1 px-2">
          {links.map((link) => (
             <Link
              key={link.path}
              to={link.path}
              onClick={(e) => {
                handleNavClick(e, link.path);
                if (!e.defaultPrevented) setIsMenuOpen(false);
              }}
              className={`block pl-3 pr-4 py-3 border-l-4 text-base font-medium transition-all ${
                location.pathname === link.path
                  ? 'bg-brand/5 border-brand text-brand'
                  : 'border-transparent text-app-muted hover:bg-brand/5 hover:border-brand-light hover:text-app-text'
              }`}
            >
              {link.name}
            </Link>
          ))}
          
          {/* Mobile Auth User Info */}
          {user && (
            <div className="pt-4 pb-3 border-t border-app-border mt-4">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-brand/10 border border-brand/30 flex items-center justify-center text-brand font-bold uppercase">
                    {displayName.charAt(0)}
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-app-text">{displayName}</div>
                  <div className="text-sm font-medium text-app-muted truncate">{user.email}</div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <button
                  onClick={handleLogoutRequest}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors flex items-center gap-2"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            </div>
          )}
          
          {!user && !isAuthenticating && (
            <div className="p-4">
              <button 
                onClick={(e) => {
                  handleNavClick(e, '/auth');
                  if (!e.defaultPrevented) navigate('/auth');
                }}
                className="w-full px-4 py-3 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-brand hover:bg-brand-dark focus:outline-none text-center"
              >
                Login / Signup
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Onboarding Nav Alert Modal */}
      {showOnboardingAlert && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-app-card rounded-xl shadow-2xl p-6 max-w-sm w-full border border-app-border animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-display font-bold text-gray-900 mb-2">Leave Onboarding?</h3>
            <p className="text-gray-500 mb-6 font-body text-sm">
              Your form data is already saved.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => {
                  setShowOnboardingAlert(false);
                  if (pendingAction?.type === 'LOGOUT') {
                    executeLogout();
                  } else if (pendingAction?.type === 'NAVIGATE' && pendingAction.path) {
                    navigate(pendingAction.path);
                  }
                }}
                className="w-full bg-brand text-white py-3 rounded-lg font-medium hover:bg-brand-dark transition-colors border border-transparent"
              >
                Save and Continue
              </button>
              <button 
                onClick={() => {
                  setShowOnboardingAlert(false);
                  setPendingAction(null);
                }}
                className="w-full bg-app-bg text-app-text border border-app-border py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Go Back to Onboarding
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
