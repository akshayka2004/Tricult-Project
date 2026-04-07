import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Shield, Users, Zap, Terminal } from 'lucide-react';

export default function LandingPage() {
    const { login, adminLogin, volunteerLogin } = useAuth();
    const navigate = useNavigate();
    const [loadingRole, setLoadingRole] = useState(null);

    const handleRoleSelect = async (role) => {
        setLoadingRole(role);
        try {
            if (role === 'user') {
                await login();
                navigate('/dashboard');
            } else if (role === 'admin') {
                await adminLogin();
                navigate('/admin-portal-secure/dashboard');
            } else if (role === 'volunteer') {
                await volunteerLogin();
                navigate('/volunteer/dashboard');
            }
        } catch (err) {
            console.error(`Failed to login as ${role}:`, err);
        } finally {
            setLoadingRole(null);
        }
    };

    return (
        <div className="login-container relative overflow-hidden flex flex-col items-center justify-center min-h-screen">
            <div className="w-full max-w-[500px] animate-slide-up z-10 px-4">
                {/* Logo & Header */}
                <div className="login-logo flex flex-col items-center mb-10">
                    <img
                        src="/assets/game-hub-logo.png"
                        alt="Game Hub Logo"
                        className="w-24 h-24 sm:w-40 sm:h-40 object-contain mb-2 drop-shadow-[0_0_25px_rgba(0,229,255,0.6)]"
                    />
                    <h1 className="text-4xl sm:text-6xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-cyber-cyan drop-shadow-[0_0_20px_rgba(0,229,255,0.8)]">GAME HUB</h1>
                    <p className="mt-2 text-cyber-cyan font-['Rajdhani'] text-lg tracking-wide uppercase">Reference Architecture</p>
                </div>

                {/* Role Selection Container */}
                <div className="glass-card p-6 sm:p-10 border border-cyber-cyan/30 bg-cyber-bg/80 backdrop-blur-md">
                    <div className="flex items-center gap-2 mb-8 justify-center">
                        <Terminal className="w-5 h-5 text-cyber-cyan" />
                        <h2 className="text-xl font-['Orbitron'] text-cyber-text text-center tracking-widest drop-shadow-[0_0_5px_rgba(0,255,255,0.5)]">
                            SELECT PORTAL
                        </h2>
                    </div>

                    <div className="flex flex-col gap-5">
                        <button
                            onClick={() => handleRoleSelect('user')}
                            disabled={loadingRole !== null}
                            className="group relative overflow-hidden rounded-xl border-2 border-cyber-border bg-cyber-bg/50 p-4 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:bg-cyber-cyan/10 hover:border-cyber-cyan hover:shadow-[0_0_25px_rgba(0,229,255,0.3)] disabled:opacity-50"
                        >
                            <div className="absolute inset-0 w-1/4 bg-cyber-cyan/5 blur-2xl group-hover:bg-cyber-cyan/20 transition-all"></div>
                            <div className="relative flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-cyber-bg/80 rounded-lg border border-cyber-border group-hover:border-cyber-cyan/50 transition-colors">
                                        <User className="w-6 h-6 text-cyber-cyan" />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-['Orbitron'] text-lg font-bold text-white group-hover:text-cyber-cyan transition-colors">Player Portal</h3>
                                        <p className="text-cyber-muted text-sm font-['Share_Tech_Mono']">Access player dashboard & QR scanner</p>
                                    </div>
                                </div>
                                <div className="hidden sm:block">
                                    {loadingRole === 'user' ? <Zap className="w-5 h-5 text-cyber-cyan animate-pulse" /> : <div className="w-8 h-8 rounded-full border border-cyber-cyan/30 flex items-center justify-center text-cyber-cyan group-hover:bg-cyber-cyan group-hover:text-black transition-all">→</div>}
                                </div>
                            </div>
                        </button>

                        <button
                            onClick={() => handleRoleSelect('volunteer')}
                            disabled={loadingRole !== null}
                            className="group relative overflow-hidden rounded-xl border-2 border-cyber-border bg-cyber-bg/50 p-4 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:bg-cyber-magenta/10 hover:border-cyber-magenta hover:shadow-[0_0_25px_rgba(176,38,255,0.3)] disabled:opacity-50"
                        >
                            <div className="absolute inset-0 w-1/4 bg-cyber-magenta/5 blur-2xl group-hover:bg-cyber-magenta/20 transition-all"></div>
                            <div className="relative flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-cyber-bg/80 rounded-lg border border-cyber-border group-hover:border-cyber-magenta/50 transition-colors">
                                        <Users className="w-6 h-6 text-cyber-magenta" />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-['Orbitron'] text-lg font-bold text-white group-hover:text-cyber-magenta transition-colors">Volunteer Portal</h3>
                                        <p className="text-cyber-muted text-sm font-['Share_Tech_Mono']">Manage active sessions & tokens</p>
                                    </div>
                                </div>
                                <div className="hidden sm:block">
                                    {loadingRole === 'volunteer' ? <Zap className="w-5 h-5 text-cyber-magenta animate-pulse" /> : <div className="w-8 h-8 rounded-full border border-cyber-magenta/30 flex items-center justify-center text-cyber-magenta group-hover:bg-cyber-magenta group-hover:text-black transition-all">→</div>}
                                </div>
                            </div>
                        </button>

                        <button
                            onClick={() => handleRoleSelect('admin')}
                            disabled={loadingRole !== null}
                            className="group relative overflow-hidden rounded-xl border-2 border-cyber-border bg-cyber-bg/50 p-4 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:bg-cyber-amber/10 hover:border-cyber-amber hover:shadow-[0_0_25px_rgba(255,184,0,0.3)] disabled:opacity-50"
                        >
                            <div className="absolute inset-0 w-1/4 bg-cyber-amber/5 blur-2xl group-hover:bg-cyber-amber/20 transition-all"></div>
                            <div className="relative flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-cyber-bg/80 rounded-lg border border-cyber-border group-hover:border-cyber-amber/50 transition-colors">
                                        <Shield className="w-6 h-6 text-cyber-amber" />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-['Orbitron'] text-lg font-bold text-white group-hover:text-cyber-amber transition-colors">Admin Portal</h3>
                                        <p className="text-cyber-muted text-sm font-['Share_Tech_Mono']">Full system overview & analytics</p>
                                    </div>
                                </div>
                                <div className="hidden sm:block">
                                    {loadingRole === 'admin' ? <Zap className="w-5 h-5 text-cyber-amber animate-pulse" /> : <div className="w-8 h-8 rounded-full border border-cyber-amber/30 flex items-center justify-center text-cyber-amber group-hover:bg-cyber-amber group-hover:text-black transition-all">→</div>}
                                </div>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Footer decoration */}
                <div className="mt-12 flex items-center justify-center gap-3">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent to-cyber-cyan/20" />
                    <span className="text-cyber-cyan/50 text-[10px] font-['Share_Tech_Mono'] tracking-[0.3em]">INITIALIZING NO-AUTH ENVIRONMENT</span>
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent to-cyber-cyan/20" />
                </div>
            </div>
        </div>
    );
}
