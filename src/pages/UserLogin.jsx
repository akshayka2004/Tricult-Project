import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Ticket, Lock, Zap, AlertTriangle } from 'lucide-react';

export default function UserLogin() {
    const [ticketNumber, setTicketNumber] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(ticketNumber.trim(), password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="w-full max-w-[420px] animate-slide-up">
                {/* Logo */}
                <div className="login-logo flex flex-col items-center">
                    <img
                        src="/assets/game-hub-logo.png"
                        alt="Game Hub Logo"
                        className="w-24 h-24 sm:w-40 sm:h-40 object-contain mb-4 drop-shadow-[0_0_25px_rgba(255,255,0,0.8)]"
                    />
                    <h1 className="text-3xl sm:text-5xl font-black tracking-widest text-[#ffff00] drop-shadow-[0_0_15px_rgba(255,255,0,0.6)]">GAME HUB</h1>
                </div>

                {/* Login Card */}
                <div className="glass-card p-8 sm:p-10">
                    <h2 className="text-lg font-['Orbitron'] text-cyber-text mb-8 text-center tracking-widest">
                        PLAYER LOGIN
                    </h2>

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="input-group">
                            <label className="input-label">Ticket Number</label>
                            <div className="input-with-icon">
                                <Ticket className="input-icon w-5 h-5" />
                                <input
                                    type="text"
                                    value={ticketNumber}
                                    onChange={(e) => setTicketNumber(e.target.value)}
                                    placeholder="Enter your ticket number"
                                    className="cyber-input"
                                    required
                                    autoComplete="username"
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="input-label">Password</label>
                            <div className="input-with-icon">
                                <Lock className="input-icon w-5 h-5" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className="cyber-input"
                                    required
                                    autoComplete="current-password"
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
                            className="btn-base cyber-btn btn-full mt-4"
                        >
                            {loading ? (
                                <span className="animate-pulse">AUTHENTICATING...</span>
                            ) : (
                                <>
                                    <Zap className="w-5 h-5" />
                                    ACCESS SYSTEM
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer decoration */}
                <div className="mt-10 flex items-center justify-center gap-3">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent to-cyber-cyan/20" />
                    <span className="text-cyber-muted/30 text-xs font-['Share_Tech_Mono'] tracking-widest">SECURE ACCESS</span>
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent to-cyber-cyan/20" />
                </div>
            </div>
        </div>
    );
}
