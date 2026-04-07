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
        return <Navigate to="/" replace />;
    }

    if (requireAdmin && !isAdmin) {
        return <Navigate to="/" replace />;
    }

    if (requireVolunteer && !isVolunteer) {
        return <Navigate to="/" replace />;
    }

    return children;
}
