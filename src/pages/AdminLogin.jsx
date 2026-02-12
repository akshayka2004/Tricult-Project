import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, User, Lock, AlertTriangle } from 'lucide-react';

export default function AdminLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { adminLogin } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await adminLogin(username.trim(), password);
            navigate('/admin-portal-secure/dashboard');
        } catch (err) {
            setError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="w-full max-w-[460px] animate-slide-up">
                {/* Logo */}
                <div className="login-logo flex flex-col items-center">
                    <img
                        src="/assets/game-hub-logo.png"
                        alt="Game Hub Logo"
                        className="w-40 h-40 object-contain mb-4 drop-shadow-[0_0_25px_rgba(255,255,0,0.8)]"
                    />
                    <h1 className="text-5xl font-black tracking-widest text-[#ffff00] drop-shadow-[0_0_15px_rgba(255,255,0,0.6)] text-center">ADMIN PORTAL</h1>
                </div>

                {/* Login Card */}
                <div className="glass-card p-10" style={{ borderColor: 'rgba(255, 255, 0, 0.15)' }}>
                    <h2 className="text-lg font-['Orbitron'] text-cyber-text mb-10 text-center tracking-widest">
                        SECURE LOGIN
                    </h2>

                    <form onSubmit={handleSubmit} className="login-form" style={{ gap: '28px' }}>
                        <div className="input-group">
                            <label className="input-label">Username</label>
                            <div className="input-with-icon">
                                <User className="input-icon w-5 h-5" style={{ color: 'rgba(255, 255, 0, 0.4)' }} />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Admin username"
                                    className="cyber-input"
                                    style={{ borderColor: 'rgba(255, 255, 0, 0.2)' }}
                                    required
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="input-label">Password</label>
                            <div className="input-with-icon">
                                <Lock className="input-icon w-5 h-5" style={{ color: 'rgba(255, 255, 0, 0.4)' }} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Admin password"
                                    className="cyber-input"
                                    style={{ borderColor: 'rgba(255, 255, 0, 0.2)' }}
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="alert-error">
                                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-base cyber-btn btn-full"
                        >
                            {loading ? (
                                <span className="animate-pulse">AUTHENTICATING...</span>
                            ) : (
                                <>
                                    <Shield className="w-5 h-5" />
                                    ACCESS ADMIN PANEL
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
