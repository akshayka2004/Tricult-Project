import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import UserLogin from './pages/UserLogin';
import UserDashboard from './pages/UserDashboard';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import VolunteerLogin from './pages/VolunteerLogin';
import VolunteerDashboard from './pages/VolunteerDashboard';

import BackgroundDecorations from './components/BackgroundDecorations';

export default function App() {
  return (
    <>
      <div className="cyber-bg" />
      <BackgroundDecorations />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<UserLogin />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/admin-portal-secure" element={<AdminLogin />} />
        <Route
          path="/admin-portal-secure/dashboard"
          element={
            <ProtectedRoute requireAdmin>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/volunteer" element={<VolunteerLogin />} />
        <Route
          path="/volunteer/dashboard"
          element={
            <ProtectedRoute requireVolunteer>
              <VolunteerDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}
