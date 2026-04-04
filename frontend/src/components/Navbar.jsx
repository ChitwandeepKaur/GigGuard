import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  const links = [
    { name: 'Home', path: '/' },
    { name: 'Onboarding', path: '/onboarding' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Insurance Hub', path: '/insurance' },
  ];

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
          <div className="flex items-center sm:hidden">
             {/* Mobile menu could be added here later if needed */}
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
