// File: web/src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import FamilyDashboard from './pages/FamilyDashboard';
import Assistant from './pages/Assistant';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import AdminDashboard from './pages/AdminDashboard';
import LandingPage from './pages/LandingPage';
import NotFound from './pages/NotFound';
// Layout
import Layout from './components/Layout';

function App() {
  const { token, user } = useAuthStore();
  const isAdmin = user?.role === 'ngo_admin';

  return (
    <>
      <Router>
        <Routes>

          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />

          <Route
            path="/login"
            element={!token ? <Login /> : <Navigate to="/app/dashboard" replace />}
          />

          <Route
            path="/register"
            element={!token ? <Register /> : <Navigate to="/app/dashboard" replace />}
          />

          {/* Protected Routes */}
          <Route path="/app" element={token ? <Layout /> : <Navigate to="/login" replace />}>
  <Route index element={<Navigate to="dashboard" replace />} />

  <Route path="dashboard" element={<Dashboard />} />
  <Route path="family" element={<FamilyDashboard />} />
  <Route path="assistant" element={<Assistant />} />
  <Route path="reports" element={<Reports />} />
  <Route path="settings" element={<Settings />} />

  <Route 
    path="admin"
    element={isAdmin ? <AdminDashboard /> : <Navigate to="/app/dashboard" replace />}
  />
</Route>


          {/* 404 */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </Router>

      <Toaster />
    </>
  );
}

export default App;