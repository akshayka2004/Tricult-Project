import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Eye, LogOut, Clock, User, Monitor, Wifi, WifiOff, Lock, Timer, Gamepad2, AlertCircle } from 'lucide-react';
import ChangePasswordModal from '../components/ChangePasswordModal';

export default function VolunteerDashboard() {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [activeSessions, setActiveSessions] = useState([]);
    const [now, setNow] = useState(Date.now());
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    // Fetch active sessions
    const fetchSessions = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('sessions')
                .select('*')
                .in('status', ['active'])
                .order('expires_at', { ascending: true }); // Expiring soonest first

            if (!error && data && data.length > 0) {
                setActiveSessions(data);
            } else if (!activeSessions.length) {
                // Initial load: provide some dummy data for the reference architecture demo
                const dummySessions = [
                    {
                        id: 'demo-1',
                        activity_name: 'High-Speed VR Racer',
                        username: 'Speedster01',
                        ticket_number: 'TRI-VR1024',
                        started_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
                        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
                        status: 'active'
                    },
                    {
                        id: 'demo-2',
                        activity_name: 'Cyber Combat Arena',
                        username: 'NeonGhost',
                        ticket_number: 'TRI-CC2056',
                        started_at: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
                        expires_at: new Date(Date.now() + 30 * 1000).toISOString(), // Expiring soon!
                        status: 'active'
                    }
                ];
                setActiveSessions(dummySessions);
            }
        } catch (err) {
            console.warn("Supabase session fetch failed, using demo data.");
        }
    }, [activeSessions.length]);

    // Poll every 5s
    useEffect(() => {
        fetchSessions();
        const interval = setInterval(fetchSessions, 5000);
        return () => clearInterval(interval);
    }, [fetchSessions]);

    // Tick every second
    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Auto-expire sessions
    useEffect(() => {
        activeSessions.forEach(async (s) => {
            const expiresAt = new Date(s.expires_at).getTime();
            if (expiresAt <= now && s.status === 'active') {
                // Optimistically remove from UI to avoid flicker
                setActiveSessions(prev => prev.filter(p => p.id !== s.id));

                await supabase
                    .from('sessions')
                    .update({ status: 'expired' })
                    .eq('id', s.id);
            }
        });
    }, [now, activeSessions]);

    const getSessionProgress = (session) => {
        const start = new Date(session.started_at).getTime();
        const end = new Date(session.expires_at).getTime();
        const totalMs = end - start;
        const remaining = Math.max(0, end - now);
        const progress = Math.max(0, Math.min(100, (remaining / totalMs) * 100));

        let status = 'active';
        if (remaining <= 0) status = 'expired';
        else if (remaining <= 60000) status = 'expiring'; // < 1 min warning

        return { remaining, progress, status, totalMs };
    };

    const formatTime = (ms) => {
        if (ms <= 0) return '00:00';
        const mins = Math.floor(ms / 60000);
        const secs = Math.floor((ms % 60000) / 1000);
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen flex flex-col" style={{ background: 'transparent' }}>
            {/* ── Header ── */}
            <header className="monitor-header" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: '16px', position: 'relative' }}>
                <button
                    onClick={() => setShowPasswordModal(true)}
                    className="btn-base cyber-btn-outline btn-sm transition-all duration-300 hover:scale-105 hover:shadow-[0_0_15px_rgba(0,250,154,0.3)]"
                    style={{ position: 'absolute', top: '16px', left: '16px', padding: '0 16px', height: '36px', fontSize: '11px', fontWeight: 700 }}
                >
                    <Lock className="w-3 h-3 mr-2" />
                    PWD
                </button>

                <div className="flex flex-col items-center gap-1">
                    <img src="/assets/game-hub-logo.png" alt="Game Hub" className="h-10 sm:h-16 w-auto object-contain drop-shadow-[0_0_15px_rgba(0,229,255,0.6)]" />
                    <h1 className="text-transparent bg-clip-text bg-gradient-to-br from-white to-cyber-green drop-shadow-[0_0_15px_rgba(0,250,154,0.6)] text-lg sm:text-2xl font-['Orbitron'] font-black tracking-widest uppercase">ACTIVITY MONITOR</h1>
                </div>

                <button onClick={handleLogout} className="btn-base cyber-btn-outline btn-sm transition-all duration-300 hover:scale-110 hover:shadow-[0_0_15px_rgba(0,250,154,0.3)]" style={{ position: 'absolute', top: '12px', right: '12px', width: '36px', height: '36px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <LogOut className="w-4 h-4" />
                </button>
            </header>

            {/* ── Active Sessions Grid ── */}
            <main className="flex-1 px-6 pb-8">
                {activeSessions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[60vh] text-cyber-muted opacity-50 animate-pulse">
                        <Monitor className="w-24 h-24 mb-4" />
                        <h2 className="text-2xl font-['Orbitron'] tracking-widest">NO ACTIVE SESSIONS</h2>
                        <p className="font-['Share_Tech_Mono'] mt-2">Waiting for players to scan QR codes...</p>
                    </div>
                ) : (
                    <div className="hub-grid">
                        {activeSessions.map((session) => {
                            const { remaining, progress, status } = getSessionProgress(session);
                            const isExpiring = status === 'expiring';

                            return (
                                <div key={session.id} className={`hub-card ${status === 'expiring' ? 'expiring' : 'active'}`} style={{ borderColor: isExpiring ? '#ff3300' : 'rgba(0, 255, 136, 0.3)' }}>
                                    {/* Card Header */}
                                    <div className="hub-header" style={{ background: isExpiring ? 'rgba(255, 51, 0, 0.1)' : 'rgba(0, 255, 136, 0.05)' }}>
                                        <div className="flex items-center gap-2.5">
                                            <Gamepad2 className="w-5 h-5" style={{ color: isExpiring ? '#ff3300' : '#00ff88' }} />
                                            <span className="hub-id" style={{ color: isExpiring ? '#ff3300' : '#00ff88', fontSize: '14px' }}>
                                                {session.activity_name || 'Activity'}
                                            </span>
                                        </div>
                                        <span className={`hub-status ${status === 'expiring' ? 'expiring' : 'active'}`}>
                                            {isExpiring ? (
                                                <><AlertCircle className="w-3 h-3 animate-pulse" /> EXPIRING</>
                                            ) : (
                                                <><Clock className="w-3 h-3" /> RUNNING</>
                                            )}
                                        </span>
                                    </div>

                                    {/* Card Content */}
                                    <div className="hub-content">
                                        {/* Player Info */}
                                        <div className="hub-player">
                                            <div className="w-10 h-10 rounded-xl bg-cyber-bg/60 border border-cyber-cyan/30 flex items-center justify-center flex-shrink-0 text-cyber-cyan">
                                                <User className="w-5 h-5" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-['Orbitron'] text-sm text-cyber-text font-bold truncate">
                                                    {session.username}
                                                </p>
                                                <p className="text-cyber-muted text-xs font-['Share_Tech_Mono'] mt-0.5">
                                                    {session.ticket_number}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Timer */}
                                        <div className={`hub-timer ${isExpiring ? 'expiring' : ''}`}>
                                            <Timer className="w-4 h-4" />
                                            <span className="font-['Orbitron'] text-2xl font-black tracking-wider">
                                                {formatTime(remaining)}
                                            </span>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="w-full h-1.5 rounded-full bg-cyber-bg/60 overflow-hidden mt-2">
                                            <div
                                                className="h-full rounded-full transition-all duration-1000 ease-linear"
                                                style={{
                                                    width: `${progress}%`,
                                                    background: isExpiring
                                                        ? 'linear-gradient(90deg, #ff3300, #ff0055)'
                                                        : 'linear-gradient(90deg, #00ff88, #00ffff)',
                                                    boxShadow: isExpiring ? '0 0 10px #ff3300' : '0 0 10px #00ff88'
                                                }}
                                            />
                                        </div>

                                        {/* Time details */}
                                        <div className="flex justify-between items-center mt-auto pt-2">
                                            <p className="text-cyber-muted/40 text-[10px] font-['Share_Tech_Mono'] tracking-wider">
                                                Start: {new Date(session.started_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                            <p className="text-cyber-muted/40 text-[10px] font-['Share_Tech_Mono'] tracking-wider">
                                                End: {new Date(session.expires_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Change Password Modal */}
            {showPasswordModal && (
                <ChangePasswordModal
                    user={user}
                    onClose={() => setShowPasswordModal(false)}
                />
            )}
        </div>
    );
}
