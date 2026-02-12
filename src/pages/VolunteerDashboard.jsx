import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { TOTAL_HUBS, SESSION_DURATION_MS } from '../lib/constants';
import { Eye, LogOut, Clock, User, Monitor, Wifi, WifiOff } from 'lucide-react';

const HUB_STATUSES = { ACTIVE: 'active', EXPIRING: 'expiring', EXPIRED: 'expired', OPEN: 'open' };

export default function VolunteerDashboard() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [sessions, setSessions] = useState({});
    const [now, setNow] = useState(Date.now());

    // Fetch active sessions
    const fetchSessions = useCallback(async () => {
        const { data, error } = await supabase
            .from('sessions')
            .select('*')
            .in('status', ['active'])
            .order('started_at', { ascending: false });

        if (!error && data) {
            const byHub = {};
            data.forEach((s) => {
                if (!byHub[s.hub_number] || new Date(s.started_at) > new Date(byHub[s.hub_number].started_at)) {
                    byHub[s.hub_number] = s;
                }
            });
            setSessions(byHub);
        }
    }, []);

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
        Object.values(sessions).forEach(async (s) => {
            if (s.status === 'active' && new Date(s.expires_at).getTime() <= now) {
                await supabase
                    .from('sessions')
                    .update({ status: 'expired' })
                    .eq('id', s.id);
            }
        });
    }, [now, sessions]);

    const getHubData = (hubNum) => {
        const session = sessions[hubNum];
        if (!session) return { status: HUB_STATUSES.OPEN };

        const expiresAt = new Date(session.expires_at).getTime();
        const remaining = Math.max(0, expiresAt - now);
        const totalMs = SESSION_DURATION_MS;
        const progress = Math.max(0, Math.min(100, (remaining / totalMs) * 100));

        let status = HUB_STATUSES.ACTIVE;
        if (remaining <= 0) status = HUB_STATUSES.EXPIRED;
        else if (remaining <= 120000) status = HUB_STATUSES.EXPIRING; // <2 min

        return { session, status, remaining, progress };
    };

    const formatTime = (ms) => {
        if (ms <= 0) return '00:00';
        const mins = Math.floor(ms / 60000);
        const secs = Math.floor((ms % 60000) / 1000);
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const handleLogout = () => {
        logout();
        navigate('/volunteer');
    };

    const hubs = Array.from({ length: TOTAL_HUBS }, (_, i) => i + 1);

    return (
        <div className="min-h-screen flex flex-col" style={{ background: 'transparent' }}>
            {/* ── Header ── */}
            <header className="monitor-header" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: '16px', position: 'relative' }}>
                <div className="flex flex-col items-center gap-1">
                    <img src="/assets/game-hub-logo.png" alt="Game Hub" className="h-10 sm:h-16 w-auto object-contain drop-shadow-[0_0_10px_rgba(255,255,0,0.5)]" />
                    <h1 className="text-glow-green text-lg sm:text-2xl" style={{ color: '#ccff00' }}>HUB MONITOR</h1>
                </div>
                <button onClick={handleLogout} className="btn-base cyber-btn-outline btn-sm" style={{ position: 'absolute', top: '12px', right: '12px', width: '36px', height: '36px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <LogOut className="w-4 h-4" />
                </button>
            </header>

            {/* ── Hub Grid ── */}
            <main className="flex-1 px-6 pb-8">
                <div className="hub-grid">
                    {hubs.map((hubNum) => {
                        const { session, status, remaining, progress } = getHubData(hubNum);
                        const isActive = status === HUB_STATUSES.ACTIVE;
                        const isExpiring = status === HUB_STATUSES.EXPIRING;
                        const isExpired = status === HUB_STATUSES.EXPIRED;
                        const isOpen = status === HUB_STATUSES.OPEN;

                        return (
                            <div
                                key={hubNum}
                                className={`hub-card ${status}`}
                            >
                                {/* Card Header */}
                                <div className="hub-header">
                                    <div className="flex items-center gap-2.5">
                                        <Monitor className="w-5 h-5" />
                                        <span className="hub-id">HUB {String(hubNum).padStart(2, '0')}</span>
                                    </div>
                                    <span className={`hub-status ${status}`}>
                                        {isActive && <><Wifi className="w-3 h-3" /> ACTIVE</>}
                                        {isExpiring && <><Clock className="w-3 h-3 animate-pulse" /> EXPIRING</>}
                                        {isExpired && <><WifiOff className="w-3 h-3" /> EXPIRED</>}
                                        {isOpen && 'OPEN'}
                                    </span>
                                </div>

                                {/* Card Content */}
                                <div className="hub-content">
                                    {isOpen ? (
                                        <div className="flex flex-col items-center justify-center py-8 gap-3">
                                            <Monitor className="w-10 h-10 text-cyber-muted/20" />
                                            <span className="text-cyber-muted/40 font-['Share_Tech_Mono'] text-xs tracking-wider">
                                                WAITING FOR PLAYER
                                            </span>
                                        </div>
                                    ) : (
                                        <>
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
                                            <div className={`hub-timer ${isExpired ? 'expired' : ''} ${isExpiring ? 'expiring' : ''}`}>
                                                <Clock className="w-4 h-4" />
                                                <span className="font-['Orbitron'] text-2xl font-black tracking-wider">
                                                    {isExpired ? 'EXPIRED' : formatTime(remaining)}
                                                </span>
                                            </div>

                                            {/* Progress Bar */}
                                            {!isExpired && (
                                                <div className="w-full h-1.5 rounded-full bg-cyber-bg/60 overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all duration-1000 ease-linear"
                                                        style={{
                                                            width: `${progress}%`,
                                                            background: isExpiring
                                                                ? 'linear-gradient(90deg, #ffff00, #ff3300)'
                                                                : 'linear-gradient(90deg, #ccff00, #ffff00)',
                                                        }}
                                                    />
                                                </div>
                                            )}

                                            {/* Session Start */}
                                            <p className="text-cyber-muted/40 text-[10px] font-['Share_Tech_Mono'] tracking-wider mt-auto">
                                                Started: {new Date(session.started_at).toLocaleTimeString('en-IN', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ── Status Legend ── */}
                <div className="status-legend">
                    <div className="legend-item">
                        <div className="legend-dot" style={{ background: '#ccff00' }} />
                        <span>Active</span>
                    </div>
                    <div className="legend-item">
                        <div className="legend-dot" style={{ background: '#ffff00' }} />
                        <span>Expiring (&lt;2 min)</span>
                    </div>
                    <div className="legend-item">
                        <div className="legend-dot" style={{ background: '#ff3366' }} />
                        <span>Expired</span>
                    </div>
                    <div className="legend-item">
                        <div className="legend-dot" style={{ background: '#555577' }} />
                        <span>Open</span>
                    </div>
                </div>
            </main>
        </div>
    );
}
