import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import VolunteerDashboard from './pages/VolunteerDashboard';

import BackgroundDecorations from './components/BackgroundDecorations';

export default function App() {
  return (
    <>
      <div className="cyber-bg" />
      <div className="noise-overlay" />
      <BackgroundDecorations />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-portal-secure/dashboard"
          element={
            <ProtectedRoute requireAdmin>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/volunteer/dashboard"
          element={
            <ProtectedRoute requireVolunteer>
              <VolunteerDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
