// File: web/src/pages/Login.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Cloud, Mail, Lock, Loader2 } from 'lucide-react';
import { authAPI } from '../api/services';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.login({ email, password });
      setAuth(response.data.token, response.data.user);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-400 rounded-2xl mb-4 shadow-yellow-400/40 shadow-lg">
            <Cloud className="w-10 h-10 text-black" />
          </div>
          <h1 className="text-3xl font-bold text-white">Climate Health</h1>
          <p className="text-gray-400 mt-2">Sign in to your Climate Health account</p>
        </div>

        {/* Login Form */}
        <div className="bg-gray-900 rounded-2xl shadow-xl border border-yellow-400/20 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-black border border-yellow-400/20 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-white placeholder-gray-500"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-black border border-yellow-400/20 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-white placeholder-gray-500"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-400 text-black py-3 rounded-lg font-semibold hover:bg-yellow-500 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-yellow-400/40 shadow-md"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-yellow-300 font-semibold hover:text-yellow-400">
              Sign up
            </Link>
          </p>

          {/* Demo Accounts */}
          <div className="mt-6 p-4 bg-yellow-400/10 rounded-lg border border-yellow-400/20">
            <p className="text-xs font-semibold text-yellow-300 mb-2">Demo Accounts:</p>
            <div className="text-xs text-gray-400 space-y-1">
              <p>Citizen: test@example.com / password123</p>
              <p>Family Admin: sarah.admin@example.com / password123</p>
              <p>NGO Admin: ngo.admin@example.com / password123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;