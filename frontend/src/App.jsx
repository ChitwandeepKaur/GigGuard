import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import InsuranceHub from './pages/InsuranceHub'
import ChatWindow from './components/chatbot/ChatWindow'
import Navbar from './components/Navbar'

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/auth" replace />;
  }
  return children;
}

function AppContent() {
  const location = useLocation();
  const isInsurancePage = location.pathname === '/insurance';

  return (
    <div className="flex flex-1">
      {/* Main Content Area */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/insurance" element={<InsuranceHub />} />
        </Routes>
      </main>

      {/* Persistent Chatbot Sidebar - Only shown on Insurance page */}
      {isInsurancePage && (
        <aside className="w-[450px] bg-app-bg hidden lg:flex flex-col p-8 pt-12 items-start animate-in slide-in-from-right duration-500">
          <ChatWindow isSidebar={true} />
        </aside>
      )}
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-app-bg text-app-text font-body flex flex-col">
      <BrowserRouter>
        <Navbar />
        <AppContent />
      </BrowserRouter>
    </div>
  )
}
