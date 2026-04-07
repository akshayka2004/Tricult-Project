import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { getActivityById, isTimedActivity } from '../lib/constants';
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
    const [billType, setBillType] = useState('receipt'); // 'confirmation' | 'receipt'
    const [scanError, setScanError] = useState('');
    const [processing, setProcessing] = useState(false);
    const [activeTab, setActiveTab] = useState('history');
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    const fetchTransactions = useCallback(async () => {
        if (!user) return;
        try {
            const { data } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });
            
            if (data && data.length > 0) {
                setTransactions(data);
            } else if (!transactions.length) {
                // Initialize with some dummy transactions for the Reference Demo
                setTransactions([
                    {
                        id: 'demo-tx-1',
                        type: 'deduction',
                        amount: 150,
                        description: 'Cyber Combat Arena',
                        created_at: new Date(Date.now() - 3600000).toISOString()
                    },
                    {
                        id: 'demo-tx-2',
                        type: 'recharge',
                        amount: 1000,
                        description: 'Initial balance',
                        created_at: new Date(Date.now() - 7200000).toISOString()
                    }
                ]);
            }
        } catch (err) {
            console.warn("Supabase fetchTransactions failed, using demo data.");
        }
    }, [user, transactions.length]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const handleQRScan = async (decodedText) => {
        if (processing || bill) return; // Prevent scan if processing or modal open
        setScanError('');

        try {
            // Parse JSON payload from QR code
            let qrData;
            try {
                qrData = JSON.parse(decodedText);
            } catch {
                throw new Error('Invalid QR Code. Please scan a valid activity QR.');
            }

            // Validate QR data structure
            if (!qrData.id || !qrData.name || !qrData.amount) {
                throw new Error('Invalid QR Code format. Missing activity details.');
            }

            // Look up activity from constants to verify it's a known activity
            const activity = getActivityById(qrData.id);
            if (!activity) {
                throw new Error(`Unknown activity: ${qrData.name}`);
            }

            // Check user balance
            if (user.balance_tokens < activity.amount) {
                throw new Error(`Insufficient tokens. Need ${activity.amount} TKN, you have ${user.balance_tokens} TKN.`);
            }

            const isTimed = isTimedActivity(activity);

            // Open Confirmation Modal with full activity details
            setBill({
                activity_id: activity.id,
                activity_name: activity.name,
                amount: activity.amount,
                duration_mins: activity.duration_mins,
                is_timed: isTimed,
                timestamp: null, // Pending
                username: user.username,
                ticket_number: user.ticket_number,
            });
            setBillType('confirmation');

        } catch (err) {
            setScanError(err.message);
            setTimeout(() => setScanError(''), 4000);
        }
    };

    const confirmTransaction = async () => {
        if (!bill || !user) return;
        setProcessing(true);

        try {
            const timestamp = new Date().toISOString();
            const newBalance = user.balance_tokens - bill.amount;

            // 1. Deduct Tokens
            try {
                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({ balance_tokens: newBalance })
                    .eq('id', user.id);
                if (updateError) throw updateError;
            } catch (err) {
                console.warn("Deduct tokens failed, mimicking success:", err);
            }

            // 2. Log Transaction
            try {
                const durationLabel = bill.is_timed ? `${bill.duration_mins} min` : null;
                await supabase.from('transactions').insert({
                    user_id: user.id,
                    type: 'deduction',
                    amount: bill.amount,
                    duration: durationLabel,
                    description: bill.is_timed
                        ? `${bill.activity_name} — ${bill.duration_mins} min session`
                        : `${bill.activity_name}`,
                    created_at: timestamp,
                });
            } catch (err) {
                console.warn("Log transaction failed, mimicking success:", err);
            }

            // 3. Create active session
            if (bill.is_timed) {
                try {
                    const expiresAt = new Date(Date.now() + bill.duration_mins * 60 * 1000).toISOString();
                    await supabase.from('sessions').insert({
                        hub_number: 0,
                        activity_id: bill.activity_id,
                        activity_name: bill.activity_name,
                        user_id: user.id,
                        username: user.username,
                        ticket_number: user.ticket_number,
                        amount: bill.amount,
                        status: 'active',
                        started_at: timestamp,
                        expires_at: expiresAt,
                    });
                } catch (err) {
                    console.warn("Create session failed, mimicking success:", err);
                }
            }

            // Success (Refresh locally even if DB failed)
            setLocalUser({ ...user, balance_tokens: newBalance });
            setTransactions(prev => [{
                id: `demo-new-${Date.now()}`,
                type: 'deduction',
                amount: bill.amount,
                description: bill.activity_name,
                created_at: timestamp
            }, ...prev]);

            // Update modal to Receipt
            setBill({ ...bill, timestamp });
            setBillType('receipt');
        } catch (err) {
            console.error("Critical failure during transaction:", err);
        } finally {
            setProcessing(false);
        }
    };

    const setLocalUser = (updated) => {
        localStorage.setItem('tricult_user', JSON.stringify(updated));
        // refreshUser in AuthContext will pick this up on its next call or we can manually trigger it
        if (refreshUser) refreshUser();
    };
    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="app-container" style={{ maxWidth: '480px', margin: '0 auto', paddingBottom: '100px' }}>
            {/* ── Header ── */}
            <header className="app-header" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: '16px', position: 'relative' }}>
                <div className="flex flex-col items-center">
                    <img src="/assets/game-hub-logo.png" alt="Game Hub" className="h-12 sm:h-20 w-auto object-contain drop-shadow-[0_0_15px_rgba(0,229,255,0.6)]" />
                    <h1 className="text-xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-cyber-cyan tracking-widest drop-shadow-[0_0_15px_rgba(0,229,255,0.6)] mt-1">GAME HUB</h1>
                </div>
                <button onClick={handleLogout} className="btn-base cyber-btn-outline btn-sm transition-all duration-300 hover:scale-110 hover:shadow-[0_0_15px_rgba(0,229,255,0.4)]" style={{ position: 'absolute', top: '12px', right: '12px', width: '36px', height: '36px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <LogOut className="w-4 h-4" />
                </button>
            </header>

            {/* ── Profile Card ── */}
            <div
                className="user-header animate-slide-up"
                style={{ borderColor: 'rgba(0, 229, 255, 0.2)' }}
            >
                <div
                    className="user-avatar"
                    style={{
                        borderColor: 'var(--color-cyber-cyan)',
                        background: 'rgba(0, 229, 255, 0.1)',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        border: '2px solid var(--color-cyber-cyan)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--color-cyber-cyan)'
                    }}
                >
                    <User className="w-8 h-8" />
                </div>
                <div className="flex flex-col items-end">
                    <p className="font-['Orbitron'] text-xl font-bold text-white tracking-wider">{user?.username}</p>
                    <p className="text-cyber-muted text-sm font-['Share_Tech_Mono']">{user?.ticket_number}</p>
                </div>
                <button
                    onClick={() => setShowPasswordModal(true)}
                    className="ml-auto px-3 py-1.5 rounded-lg border border-cyber-cyan/30 bg-cyber-cyan/10 hover:bg-cyber-cyan/20 hover:scale-105 hover:shadow-[0_0_15px_rgba(0,229,255,0.3)] text-cyber-cyan text-xs font-['Orbitron'] font-bold tracking-wider transition-all duration-300 flex items-center gap-2"
                >
                    <Lock className="w-3 h-3" />
                    RESET PASSWORD
                </button>
            </div>

            {/* ── Balance ── */}
            <div className="token-balance-card">
                <div className="flex items-center justify-between">
                    <span className="token-balance-label flex items-center gap-2">
                        <Coins className="w-4 h-4 text-cyber-cyan" />
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
                                ACTIVITY QR SCANNER
                            </h2>
                        </div>

                        <div className="mb-5 p-4 rounded-2xl bg-cyber-bg/60 border border-cyber-border/30">
                            <div className="flex items-center justify-between text-sm font-['Rajdhani'] font-medium">
                                <span className="text-cyber-muted">Scan an activity QR code to play</span>
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
            <nav className="bottom-nav" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 30, background: 'rgba(11,13,23,0.95)', backdropFilter: 'blur(12px)', borderTop: '1px solid var(--color-cyber-border)' }}>
                <div className={`nav-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
                    <History className="nav-icon w-5 h-5" />
                    <span className="nav-label">HISTORY</span>
                </div>
                <div className={`nav-item ${activeTab === 'scanner' ? 'active' : ''}`} onClick={() => setActiveTab('scanner')} style={activeTab === 'scanner' ? { color: 'var(--color-cyber-cyan)' } : undefined}>
                    <QrCode className="nav-icon w-5 h-5" />
                    <span className="nav-label">SCAN QR</span>
                </div>
            </nav>

            {/* Bill Modal */}
            <BillModal
                bill={bill}
                type={billType}
                onClose={() => {
                    setBill(null);
                    setBillType('receipt'); // Reset to default
                }}
                onConfirm={confirmTransaction}
                processing={processing}
            />

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
