import { Link, useNavigate } from 'react-router-dom'
import { LogOut, Home, TrendingUp, FileText, Bell, Users } from 'lucide-react'

export default function Navigation({ onLogout }: { onLogout?: () => void }) {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    if (onLogout) onLogout()
    navigate('/login')
  }

  return (
    <div className="sidebar">
      <div className="p-6 border-b border-blue-600">
        <h1 className="text-2xl font-bold text-white mb-1">🌍 Climate-Health</h1>
        <p className="text-blue-100 text-sm">Companion System</p>
      </div>

      <nav className="py-4 space-y-2">
        <Link to="/dashboard" className="sidebar-item">
          <Home size={20} /> Dashboard
        </Link>
        <Link to="/predict" className="sidebar-item">
          <TrendingUp size={20} /> Risk Predictor
        </Link>
        <Link to="/reports" className="sidebar-item">
          <FileText size={20} /> Health Reports
        </Link>
        <Link to="/alerts" className="sidebar-item">
          <Bell size={20} /> Alerts
        </Link>
        <Link to="/family" className="sidebar-item">
          <Users size={20} /> Family Setup
        </Link>
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-blue-600">
        <button
          onClick={handleLogout}
          className="sidebar-item w-full text-left justify-start"
        >
          <LogOut size={20} /> Logout
        </button>
      </div>
    </div>
  )
}