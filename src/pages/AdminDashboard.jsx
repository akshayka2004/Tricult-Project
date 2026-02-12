import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { generateTicketNumber } from '../lib/ticketGenerator';
import RechargeConfirmModal from '../components/RechargeConfirmModal';
import bcrypt from 'bcryptjs';
import {
    Shield, LogOut, UserPlus, Coins, Users, Ticket,
    Lock, User, Check, AlertTriangle, Search,
    RefreshCw, Copy, CheckCheck
} from 'lucide-react';

export default function AdminDashboard() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('addUser');
    const [users, setUsers] = useState([]);
    const [message, setMessage] = useState({ text: '', type: '' });

    // Add User form state
    const [newUser, setNewUser] = useState({
        username: '',
        balance_tokens: 0,
    });
    const [addingUser, setAddingUser] = useState(false);
    const [createdTicket, setCreatedTicket] = useState('');
    const [copiedTicket, setCopiedTicket] = useState(false);

    // Recharge state
    const [rechargeTicket, setRechargeTicket] = useState('');
    const [rechargeAmount, setRechargeAmount] = useState('');
    const [rechargeData, setRechargeData] = useState(null);
    const [rechargeLoading, setRechargeLoading] = useState(false);
    const [fetchingUser, setFetchingUser] = useState(false);

    const fetchUsers = async () => {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('is_admin', false)
            .order('created_at', { ascending: false });
        if (data) setUsers(data);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const showMessage = (text, type = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    };

    // ─── Add User ───
    const handleAddUser = async (e) => {
        e.preventDefault();
        setAddingUser(true);
        setCreatedTicket('');

        try {
            const ticketNumber = await generateTicketNumber();
            // Password is same as ticket number
            const hashedPassword = bcrypt.hashSync(ticketNumber, 10);
            const initialTokens = parseInt(newUser.balance_tokens) || 0;

            const { data: profile, error } = await supabase.from('profiles').insert({
                username: newUser.username.trim(),
                password: hashedPassword,
                ticket_number: ticketNumber,
                balance_tokens: initialTokens,
                is_admin: false,
            }).select().single();

            if (error) throw error;

            if (initialTokens > 0) {
                await supabase.from('transactions').insert({
                    user_id: profile.id,
                    type: 'creation',
                    amount: initialTokens,
                    description: `Account created with ${initialTokens} initial tokens`,
                });
            }

            setCreatedTicket(ticketNumber);
            showMessage(`User "${newUser.username}" created! Ticket: ${ticketNumber}`);
            setNewUser({
                username: '',
                balance_tokens: 0,
            });
            fetchUsers();
        } catch (err) {
            showMessage(err.message || 'Failed to add user', 'error');
        } finally {
            setAddingUser(false);
        }
    };

    // ─── Copy ticket to clipboard ───
    const handleCopyTicket = async () => {
        try {
            await navigator.clipboard.writeText(createdTicket);
            setCopiedTicket(true);
            setTimeout(() => setCopiedTicket(false), 2000);
        } catch {
            const el = document.createElement('textarea');
            el.value = createdTicket;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
            setCopiedTicket(true);
            setTimeout(() => setCopiedTicket(false), 2000);
        }
    };

    // ─── Recharge: Fetch User ───
    const handleFetchForRecharge = async () => {
        if (!rechargeTicket.trim() || !rechargeAmount) return;
        setFetchingUser(true);

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('ticket_number', rechargeTicket.trim().toUpperCase())
                .eq('is_admin', false)
                .single();

            if (error || !data) {
                showMessage('User not found with this ticket number', 'error');
                setFetchingUser(false);
                return;
            }

            setRechargeData({
                ...data,
                current_balance: data.balance_tokens,
                amount: parseInt(rechargeAmount),
            });
        } catch (err) {
            showMessage('Failed to fetch user', 'error');
        } finally {
            setFetchingUser(false);
        }
    };

    // ─── Recharge: Confirm ───
    const handleConfirmRecharge = async (confirmedData) => {
        // Use the data passed from the modal (which has the updated amount)
        // Fallback to state if purely for safety, but modal sends the object.
        const headerData = confirmedData || rechargeData;

        if (!headerData) return;
        setRechargeLoading(true);

        try {
            const newBalance = headerData.current_balance + headerData.amount;

            const { error: updateError } = await supabase
                .from('profiles')
                .update({ balance_tokens: newBalance })
                .eq('id', headerData.id);

            if (updateError) throw updateError;

            const { error: txError } = await supabase.from('transactions').insert({
                user_id: headerData.id,
                type: 'recharge',
                amount: headerData.amount,
                description: `Recharged ${headerData.amount} tokens by admin`,
            });

            if (txError) throw txError;

            showMessage(`Recharged ${headerData.amount} tokens to ${headerData.username}`);
            setRechargeData(null);
            setRechargeTicket('');
            setRechargeAmount('');
            fetchUsers();
        } catch (err) {
            console.error(err);
            showMessage('Recharge failed', 'error');
        } finally {
            setRechargeLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/admin-portal-secure');
    };

    const tabs = [
        { id: 'addUser', label: 'ADD USER', icon: UserPlus },
        { id: 'recharge', label: 'RECHARGE', icon: Coins },
        { id: 'users', label: 'ALL USERS', icon: Users },
    ];

    return (
        <div className="admin-container">
            {/* ── Header ── */}
            <header className="admin-header" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: '16px 24px', position: 'relative' }}>
                <div className="admin-brand" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <img src="/assets/game-hub-logo.png" alt="Game Hub" className="h-10 sm:h-16 w-auto object-contain mb-2 drop-shadow-[0_0_10px_rgba(255,255,0,0.5)]" />
                    <h1 className="admin-title text-lg sm:text-2xl">ADMIN PANEL</h1>
                </div>
                <button onClick={handleLogout} className="admin-exit-btn" style={{ position: 'absolute', top: '16px', right: '16px' }}>
                    <LogOut className="w-4 h-4" />
                    EXIT
                </button>
            </header>

            {/* ── Nav Tabs (Centered) ── */}
            <nav className="admin-nav">
                <div className="admin-nav-container">
                    {tabs.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setActiveTab(id)}
                            className={`admin-nav-item ${activeTab === id ? 'active' : ''}`}
                        >
                            <Icon className="w-4 h-4 nav-icon" />
                            {label}
                        </button>
                    ))}
                </div>
            </nav>

            {/* ── Main Content (Centered, max-800px) ── */}
            <main className="admin-content">
                {/* Status Message */}
                {message.text && (
                    <div className={`${message.type === 'error' ? 'alert-error' : 'alert-success'}`} style={{ width: '100%', marginBottom: '24px', animation: 'slideUp 0.4s ease' }}>
                        {message.type === 'error' ? <AlertTriangle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                        <span>{message.text}</span>
                    </div>
                )}

                {/* ═══ ADD USER TAB ═══ */}
                {activeTab === 'addUser' && (
                    <div className="admin-form-card">
                        <h3 className="form-title">
                            <UserPlus className="w-5 h-5" />
                            ADD NEW USER
                        </h3>

                        {/* Ticket Created Success Card */}
                        {createdTicket && (
                            <div className="alert-success" style={{ marginBottom: '28px', flexDirection: 'column', alignItems: 'stretch', gap: '12px' }}>
                                <p style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#8888aa' }}>
                                    Generated Ticket Number
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                                    <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '1.5rem', color: '#ccff00', fontWeight: 900, letterSpacing: '3px' }}>
                                        {createdTicket}
                                    </span>
                                    <button
                                        onClick={handleCopyTicket}
                                        className="admin-exit-btn"
                                        style={{ borderColor: 'rgba(204,255,0,0.3)', color: '#ccff00', background: 'rgba(204,255,0,0.1)', padding: '8px 14px' }}
                                    >
                                        {copiedTicket ? (
                                            <><CheckCheck className="w-4 h-4" /> COPIED!</>
                                        ) : (
                                            <><Copy className="w-4 h-4" /> COPY</>
                                        )}
                                    </button>
                                </div>
                                <p style={{ fontSize: '0.75rem', color: 'rgba(136,136,170,0.6)' }}>
                                    Share this ticket number with the participant
                                </p>
                            </div>
                        )}

                        <form onSubmit={handleAddUser}>
                            {/* Name + Password side-by-side */}
                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">
                                        <User className="w-3.5 h-3.5" /> Name
                                    </label>
                                    <div className="input-wrapper">
                                        <User className="input-icon w-4 h-4" />
                                        <input
                                            type="text"
                                            value={newUser.username}
                                            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                                            placeholder="Player name"
                                            className="admin-input"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">
                                        <Coins className="w-3.5 h-3.5" style={{ color: '#ffff00' }} /> Initial Tokens
                                    </label>
                                    <div className="input-wrapper">
                                        <Coins className="input-icon w-4 h-4" style={{ color: 'rgba(255, 255, 0, 0.4)' }} />
                                        <input
                                            type="number"
                                            value={newUser.balance_tokens}
                                            onChange={(e) => setNewUser({ ...newUser, balance_tokens: e.target.value })}
                                            placeholder="0"
                                            min="0"
                                            className="admin-input"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Ticket Number Info */}
                            <div className="form-info" style={{ marginBottom: '24px' }}>
                                <Ticket className="w-4 h-4" style={{ color: '#ffff00', opacity: 0.6 }} />
                                <span>Ticket number will be <strong>auto-generated</strong> (Format: TRI-XX0000)</span>
                            </div>

                            {/* Initial Tokens */}


                            {/* Submit */}
                            <div className="form-actions">
                                <button
                                    type="submit"
                                    disabled={addingUser}
                                    className="admin-submit-btn"
                                >
                                    {addingUser ? (
                                        <span style={{ animation: 'pulse 1.5s infinite' }}>CREATING USER...</span>
                                    ) : (
                                        <>
                                            <UserPlus className="w-5 h-5 btn-icon" />
                                            CREATE USER
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* ═══ RECHARGE TAB ═══ */}
                {activeTab === 'recharge' && (
                    <div className="admin-form-card">
                        <h3 className="form-title">
                            <Coins className="w-5 h-5" />
                            RECHARGE TOKENS
                        </h3>

                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label className="form-label">
                                <Ticket className="w-3.5 h-3.5" /> Ticket Number
                            </label>
                            <div className="input-wrapper">
                                <Ticket className="input-icon w-4 h-4" />
                                <input
                                    type="text"
                                    value={rechargeTicket}
                                    onChange={(e) => setRechargeTicket(e.target.value.toUpperCase())}
                                    placeholder="e.g. TRI-AB1234"
                                    className="admin-input"
                                    style={{ textTransform: 'uppercase' }}
                                />
                            </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: '24px' }}>
                            <label className="form-label">
                                <Coins className="w-3.5 h-3.5" style={{ color: '#ffff00' }} /> Token Amount
                            </label>
                            <div className="input-wrapper">
                                <Coins className="input-icon w-4 h-4" style={{ color: 'rgba(255, 255, 0, 0.4)' }} />
                                <input
                                    type="number"
                                    value={rechargeAmount}
                                    onChange={(e) => setRechargeAmount(e.target.value)}
                                    placeholder="Amount to add"
                                    min="1"
                                    className="admin-input"
                                />
                            </div>
                        </div>

                        <div className="form-actions">
                            <button
                                onClick={handleFetchForRecharge}
                                disabled={!rechargeTicket.trim() || !rechargeAmount || fetchingUser}
                                className="admin-submit-btn"
                                style={{ background: 'linear-gradient(135deg, #ffff00, #ffcc00)' }}
                            >
                                {fetchingUser ? (
                                    <span style={{ animation: 'pulse 1.5s infinite' }}>FETCHING USER...</span>
                                ) : (
                                    <>
                                        <Search className="w-5 h-5 btn-icon" />
                                        FETCH & VERIFY
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* ═══ ALL USERS TAB ═══ */}
                {activeTab === 'users' && (
                    <div className="admin-form-card">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                            <h3 className="form-title" style={{ marginBottom: 0, paddingBottom: 0, borderBottom: 'none' }}>
                                <Users className="w-5 h-5" />
                                ALL USERS ({users.length})
                            </h3>
                            <button onClick={fetchUsers} className="admin-exit-btn" style={{ borderColor: 'rgba(255,255,0,0.3)', color: '#ffff00', background: 'rgba(255,255,0,0.05)' }}>
                                <RefreshCw className="w-4 h-4" />
                            </button>
                        </div>

                        {users.length === 0 ? (
                            <div className="empty-state">
                                <Users className="w-16 h-16 empty-icon" style={{ color: '#555577' }} />
                                <p className="empty-title">NO USERS FOUND</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(260px, 100%), 1fr))', gap: '16px', maxHeight: '60vh', overflowY: 'auto', paddingRight: '4px' }}>
                                {users.map((u, index) => (
                                    <div
                                        key={u.id}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '16px',
                                            background: 'linear-gradient(135deg, rgba(10,10,10,0.6), rgba(5,5,5,0.8))',
                                            border: '1px solid rgba(255,255,0,0.1)',
                                            borderRadius: '14px',
                                            animation: `slideUp 0.4s ease ${index * 0.03}s both`,
                                            transition: 'all 0.3s ease',
                                        }}
                                    >
                                        <div className="user-cell">
                                            <div
                                                style={{
                                                    width: '44px',
                                                    height: '44px',
                                                    borderRadius: '12px',
                                                    background: 'rgba(255,255,0,0.1)',
                                                    border: '1px solid rgba(255,255,0,0.2)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: '#ffff00',
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <User className="w-5 h-5" />
                                            </div>
                                            <div style={{ minWidth: 0 }}>
                                                <p style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '0.8125rem', color: '#ffff00', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.username}</p>
                                                <p style={{ color: '#888844', fontSize: '0.75rem', fontFamily: "'Share Tech Mono', monospace", marginTop: '2px' }}>{u.ticket_number}</p>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '12px' }}>
                                            <p style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '1.25rem', fontWeight: 800, color: '#ffff00', textShadow: '0 0 15px rgba(255,255,0,0.3)' }}>
                                                {u.balance_tokens}
                                            </p>
                                            <p style={{ color: '#888844', fontSize: '0.625rem', fontFamily: "'Rajdhani', sans-serif", fontWeight: 600 }}>TKN</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Recharge Confirmation Modal */}
            <RechargeConfirmModal
                data={rechargeData}
                onConfirm={handleConfirmRecharge}
                onCancel={() => setRechargeData(null)}
                loading={rechargeLoading}
            />
        </div>
    );
}
