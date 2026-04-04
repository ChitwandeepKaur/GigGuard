import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import InsuranceHub from './pages/InsuranceHub'
import ChatbotButton from './components/chatbot/ChatbotButton'
import Navbar from './components/Navbar'

export default function App() {
  return (
    <div className="min-h-screen bg-app-bg text-app-text font-body">
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/insurance" element={<InsuranceHub />} />
        </Routes>
        <ChatbotButton />
      </BrowserRouter>
    </div>
  )
}
