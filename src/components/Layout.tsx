// File: web/src/components/Layout.tsx
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  FileText,
  Settings,
  LogOut,
  Shield,
  Cloud,
  Heart,
} from 'lucide-react';
import toast from 'react-hot-toast';

const Layout = () => {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const navItems = [
    { path: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/app/family', label: 'Family', icon: Users },
    { path: '/app/assistant', label: 'AI Assistant', icon: MessageSquare },
    { path: '/app/reports', label: 'Reports', icon: FileText },
    { path: '/app/settings', label: 'Settings', icon: Settings },
  ];

  if (user?.role === 'ngo_admin') {
    navItems.push({ path: '/app/admin', label: 'Admin', icon: Shield });
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-black border-r border-yellow-400/20 z-40">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-yellow-400/20">
            <div className="flex items-center space-x-3">
              <div className="bg-yellow-400 rounded-lg p-2">
                <Cloud className="w-6 h-6 text-black" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Climate Health</h1>
                <p className="text-xs text-gray-400">Stay Safe, Stay Healthy</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-yellow-400/20 text-yellow-300 font-medium'
                        : 'text-gray-400 hover:bg-yellow-400/10 hover:text-yellow-300'
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-yellow-400/20">
            <div className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-yellow-400/10">
              <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-black font-semibold">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-3 w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 min-h-screen bg-black">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;