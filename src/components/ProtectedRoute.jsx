import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requireAdmin = false, requireVolunteer = false }) {
    const { user, isAdmin, isVolunteer, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-cyber-bg">
                <div className="text-cyber-cyan text-xl font-['Orbitron'] animate-pulse-glow">
                    LOADING...
                </div>
            </div>
        );
    }

    if (!user) {
        if (requireAdmin) return <Navigate to="/admin-portal-secure" replace />;
        if (requireVolunteer) return <Navigate to="/volunteer" replace />;
        return <Navigate to="/login" replace />;
    }

    if (requireAdmin && !isAdmin) {
        return <Navigate to="/login" replace />;
    }

    if (requireVolunteer && !isVolunteer) {
        return <Navigate to="/volunteer" replace />;
    }

    return children;
}
