import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { TOKEN_COST_PER_PLAY, SESSION_DURATION, SESSION_DURATION_MS, TOTAL_HUBS } from '../lib/constants';
import TransactionList from '../components/TransactionList';
import QRScanner from '../components/QRScanner';
import BillModal from '../components/BillModal';
import ChangePasswordModal from '../components/ChangePasswordModal';
import { Coins, LogOut, History, QrCode, AlertTriangle, User, Lock } from 'lucide-react';

export default function UserDashboard() {
    const { user, logout, refreshUser } = useAuth();
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [bill, setBill] = useState(null);
    const [scanError, setScanError] = useState('');
    const [processing, setProcessing] = useState(false);
    const [activeTab, setActiveTab] = useState('history');
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    const fetchTransactions = useCallback(async () => {
        if (!user) return;
        const { data } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        if (data) setTransactions(data);
    }, [user]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const handleQRScan = async (decodedText) => {
        setScanError('');
        setProcessing(true);

        try {
            const hubNumber = parseInt(decodedText.replace(/\D/g, ''), 10);
            if (isNaN(hubNumber) || hubNumber < 1 || hubNumber > TOTAL_HUBS) {
                setScanError(`Invalid hub QR code. Expected hub number 1-${TOTAL_HUBS}.`);
                setProcessing(false);
                return;
            }

            if (user.balance_tokens < TOKEN_COST_PER_PLAY) {
                setScanError('Insufficient tokens! Please recharge.');
                setProcessing(false);
                return;
            }

            const newBalance = user.balance_tokens - TOKEN_COST_PER_PLAY;
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ balance_tokens: newBalance })
                .eq('id', user.id);

            if (updateError) throw updateError;

            const timestamp = new Date().toISOString();
            const { error: txError } = await supabase
                .from('transactions')
                .insert({
                    user_id: user.id,
                    type: 'deduction',
                    amount: TOKEN_COST_PER_PLAY,
                    hub_number: hubNumber,
                    duration: SESSION_DURATION,
                    description: `Hub #${hubNumber} session — ${SESSION_DURATION}`,
                    created_at: timestamp,
                });

            if (txError) throw txError;

            // Create a session record for the volunteer hub monitor
            const expiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString();
            await supabase.from('sessions').insert({
                hub_number: hubNumber,
                user_id: user.id,
                username: user.username,
                ticket_number: user.ticket_number,
                amount: TOKEN_COST_PER_PLAY,
                status: 'active',
                started_at: timestamp,
                expires_at: expiresAt,
            });

            await refreshUser();
            await fetchTransactions();

            setBill({
                hub_number: hubNumber,
                timestamp,
                username: user.username,
                ticket_number: user.ticket_number,
                duration: SESSION_DURATION,
                amount: TOKEN_COST_PER_PLAY,
            });
        } catch (err) {
            setScanError('Transaction failed. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="app-container" style={{ maxWidth: '480px', margin: '0 auto', paddingBottom: '100px' }}>
            {/* ── Header ── */}
            {/* ── Header ── */}
            <header className="app-header flex-col gap-2 h-auto py-4">
                <div className="flex flex-col items-center">
                    <img src="/assets/game-hub-logo.png" alt="Game Hub" className="h-12 sm:h-20 w-auto object-contain drop-shadow-[0_0_15px_rgba(255,255,0,0.6)]" />
                    <h1 className="text-xl sm:text-3xl font-black text-[#ffff00] tracking-wider drop-shadow-[0_0_10px_rgba(255,255,0,0.5)] mt-1">GAME HUB</h1>
                </div>
                <button onClick={handleLogout} className="btn-base cyber-btn-outline btn-sm absolute top-4 right-4">
                    <LogOut className="w-3.5 h-3.5" />
                    EXIT
                </button>
            </header>

            {/* ── Profile Card ── */}
            <div
                className="user-header animate-slide-up"
                style={{ borderColor: 'rgba(255, 255, 0, 0.2)' }}
            >
                <div
                    className="user-avatar"
                    style={{
                        borderColor: '#ffff00',
                        background: 'rgba(255, 255, 0, 0.1)',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        border: '2px solid #ffff00',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffff00'
                    }}
                >
                    <User className="w-8 h-8" />
                </div>
                <div className="user-info">
                    <h2 className="user-name">{user?.username}</h2>
                    <p className="user-id">{user?.ticket_number}</p>
                </div>
                <button
                    onClick={() => setShowPasswordModal(true)}
                    className="ml-auto p-2 rounded-full hover:bg-[rgba(255,255,0,0.1)] text-[#ffff00]/60 hover:text-[#ffff00] transition-colors"
                >
                    <Lock className="w-5 h-5" />
                </button>
            </div>

            {/* ── Balance ── */}
            <div className="token-balance-card">
                <div className="flex items-center justify-between">
                    <span className="token-balance-label flex items-center gap-2">
                        <Coins className="w-4 h-4 text-cyber-yellow" />
                        Token Balance
                    </span>
                    <div className="flex items-baseline gap-1.5">
                        <span className="token-balance-amount">{user?.balance_tokens || 0}</span>
                        <span className="token-balance-suffix">TKN</span>
                    </div>
                </div>
            </div>

            {/* ── Content Area ── */}
            <div className="flex-1 animate-slide-up" style={{ animationDelay: '0.15s' }}>
                {activeTab === 'history' && (
                    <div className="glass-card">
                        <div className="transaction-header mb-5">
                            <h2>
                                <History className="w-4 h-4 inline mr-2" />
                                TRANSACTION HISTORY
                            </h2>
                        </div>
                        <div style={{ maxHeight: 'calc(100vh - 420px)', overflowY: 'auto', paddingRight: '4px' }}>
                            <TransactionList transactions={transactions} />
                        </div>
                    </div>
                )}

                {activeTab === 'scanner' && (
                    <div className="glass-card">
                        <div className="transaction-header mb-5">
                            <h2>
                                <QrCode className="w-4 h-4 inline mr-2" />
                                HUB QR SCANNER
                            </h2>
                        </div>

                        <div className="mb-5 p-4 rounded-2xl bg-cyber-bg/60 border border-cyber-border/30">
                            <div className="flex items-center justify-between text-sm font-['Rajdhani'] font-medium">
                                <span className="text-cyber-muted">Cost per play:</span>
                                <span className="text-cyber-yellow font-bold">{TOKEN_COST_PER_PLAY} TKN</span>
                            </div>
                            <div className="flex items-center justify-between text-sm font-['Rajdhani'] font-medium mt-2">
                                <span className="text-cyber-muted">Session duration:</span>
                                <span className="text-cyber-cyan font-bold">{SESSION_DURATION}</span>
                            </div>
                        </div>

                        {scanError && (
                            <div className="alert-error mb-5">
                                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                <span>{scanError}</span>
                            </div>
                        )}

                        <QRScanner onScan={handleQRScan} disabled={processing} />

                        {processing && (
                            <div className="mt-6 text-center">
                                <p className="text-cyber-cyan font-['Orbitron'] text-xs animate-pulse tracking-wider">
                                    PROCESSING TRANSACTION...
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── Bottom Tab Bar ── */}
            <nav className="bottom-nav" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 30, background: 'rgba(10,10,26,0.95)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(42,42,94,0.4)' }}>
                <div className={`nav-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
                    <History className="nav-icon w-5 h-5" />
                    <span className="nav-label">HISTORY</span>
                </div>
                <div className={`nav-item ${activeTab === 'scanner' ? 'active' : ''}`} onClick={() => setActiveTab('scanner')} style={activeTab === 'scanner' ? { color: '#ffcc00' } : undefined}>
                    <QrCode className="nav-icon w-5 h-5" />
                    <span className="nav-label">SCAN QR</span>
                </div>
            </nav>

            {/* Bill Modal */}
            <BillModal bill={bill} onClose={() => setBill(null)} />

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
