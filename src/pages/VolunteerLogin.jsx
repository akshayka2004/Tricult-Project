import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Lock, AlertTriangle, Eye } from 'lucide-react';

export default function VolunteerLogin() {
    const { volunteerLogin } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await volunteerLogin(username.trim(), password);
            navigate('/volunteer/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="w-full max-w-[420px]">
                {/* Logo / Header */}
                <div className="login-logo flex flex-col items-center">
                    <img
                        src="/assets/game-hub-logo.png"
                        alt="Game Hub Logo"
                        className="w-40 h-40 object-contain mb-4 drop-shadow-[0_0_25px_rgba(255,255,0,0.8)]"
                    />
                    <h1 className="text-glow-green text-5xl font-black tracking-widest text-center" style={{ color: '#00ff88' }}>HUB MONITOR</h1>
                </div>

                {/* Login Card */}
                <div className="glass-card p-8 sm:p-10 animate-slide-up">
                    <form onSubmit={handleSubmit} className="login-form">
                        {error && (
                            <div className="alert-error">
                                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="input-group">
                            <label className="input-label">Username</label>
                            <div className="input-with-icon">
                                <User className="input-icon w-4 h-4" style={{ color: 'rgba(0, 255, 136, 0.4)' }} />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Enter username"
                                    className="cyber-input"
                                    required
                                    autoComplete="username"
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="input-label">Password</label>
                            <div className="input-with-icon">
                                <Lock className="input-icon w-4 h-4" style={{ color: 'rgba(0, 255, 136, 0.4)' }} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter password"
                                    className="cyber-input"
                                    required
                                    autoComplete="current-password"
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-base cyber-btn-green btn-full"
                            >
                                {loading ? (
                                    <span className="animate-pulse">AUTHENTICATING...</span>
                                ) : (
                                    <>
                                        <Eye className="w-5 h-5" />
                                        ACCESS HUB MONITOR
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                <p className="text-center text-cyber-muted/30 text-xs font-['Share_Tech_Mono'] mt-8">
                    GAME HUB — VOLUNTEER PORTAL
                </p>
            </div>
        </div>
    );
}
