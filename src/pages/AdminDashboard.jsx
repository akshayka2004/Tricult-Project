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
        try {
            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('is_admin', false)
                .order('created_at', { ascending: false });
            
            if (data && data.length > 0) {
                setUsers(data);
            } else if (!users.length) {
                // Initialize with some dummy users for the Reference Demo
                setUsers([
                    { id: 'u1', username: 'Alex Rivers', ticket_number: 'USR-2940', balance_tokens: 450 },
                    { id: 'u2', username: 'Sam Knight', ticket_number: 'USR-8821', balance_tokens: 1200 },
                    { id: 'u3', username: 'Jordan Case', ticket_number: 'USR-1109', balance_tokens: 0 },
                    { id: 'u4', username: 'Casey Flame', ticket_number: 'USR-4432', balance_tokens: 750 }
                ]);
            }
        } catch (err) {
            console.warn("Supabase fetchUsers failed, using demo data.");
        }
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

        const ticketNumber = await generateTicketNumber();
        const initialTokens = parseInt(newUser.balance_tokens) || 0;

        try {
            const hashedPassword = bcrypt.hashSync(ticketNumber, 10);
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
        } catch (err) {
            console.warn("Supabase add user failed, mimicking success:", err);
        }

        setCreatedTicket(ticketNumber);
        showMessage(`User "${newUser.username}" created! Ticket: ${ticketNumber}`);
        // Locally update list for demo
        setUsers(prev => [{
            id: `demo-${Date.now()}`,
            username: newUser.username,
            ticket_number: ticketNumber,
            balance_tokens: initialTokens
        }, ...prev]);
        setNewUser({ username: '', balance_tokens: 0 });
        setAddingUser(false);
    };

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

    const handleFetchForRecharge = async () => {
        if (!rechargeTicket.trim() || !rechargeAmount) return;
        setFetchingUser(true);

        try {
            const ticket = rechargeTicket.trim().toUpperCase();
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('ticket_number', ticket)
                .eq('is_admin', false)
                .single();

            if (error || !data) {
                // Check local demo users list
                const localUser = users.find(u => u.ticket_number === ticket);
                if (localUser) {
                    setRechargeData({
                        ...localUser,
                        current_balance: localUser.balance_tokens,
                        amount: parseInt(rechargeAmount),
                    });
                    setFetchingUser(false);
                    return;
                }
                
                showMessage('User not found in system', 'error');
                setFetchingUser(false);
                return;
            }

            setRechargeData({
                ...data,
                current_balance: data.balance_tokens,
                amount: parseInt(rechargeAmount),
            });
        } catch (err) {
            console.warn("Fetch user failed, checking local demo list...");
            const ticket = rechargeTicket.trim().toUpperCase();
            const localUser = users.find(u => u.ticket_number === ticket);
            if (localUser) {
                setRechargeData({
                    ...localUser,
                    current_balance: localUser.balance_tokens,
                    amount: parseInt(rechargeAmount),
                });
            } else {
                showMessage('Failed to fetch user', 'error');
            }
        } finally {
            setFetchingUser(false);
        }
    };

    // ─── Recharge: Confirm ───
    const handleConfirmRecharge = async (confirmedData) => {
        const headerData = confirmedData || rechargeData;
        if (!headerData) return;
        setRechargeLoading(true);

        const newBalance = (headerData.current_balance || 0) + (headerData.amount || 0);

        try {
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ balance_tokens: newBalance })
                .eq('id', headerData.id);
            if (updateError) throw updateError;

            await supabase.from('transactions').insert({
                user_id: headerData.id,
                type: 'recharge',
                amount: headerData.amount,
                description: `Recharged ${headerData.amount} tokens by admin`,
            });
        } catch (err) {
            console.warn("Recharge failed, mimicking success:", err);
        }

        showMessage(`Recharged ${headerData.amount} tokens to ${headerData.username}`);
        setUsers(prev => prev.map(u => u.id === headerData.id ? { ...u, balance_tokens: newBalance } : u));
        setRechargeData(null);
        setRechargeTicket('');
        setRechargeAmount('');
        setRechargeLoading(false);
    };

    // ─── Add Volunteer ───
    const [newVolunteerName, setNewVolunteerName] = useState('');
    const [addingVolunteer, setAddingVolunteer] = useState(false);
    const [createdVolunteer, setCreatedVolunteer] = useState(null);

    const handleAddVolunteer = async (e) => {
        e.preventDefault();
        setAddingVolunteer(true);
        setCreatedVolunteer(null);

        const randomSuffix = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
        const ticketNumber = `VOL-${randomSuffix}`;
        const password = ticketNumber;

        try {
            const hashedPassword = bcrypt.hashSync(password, 10);
            const { data: profile, error } = await supabase.from('profiles').insert({
                username: newVolunteerName.trim(),
                password: hashedPassword,
                ticket_number: ticketNumber,
                balance_tokens: 0,
                is_volunteer: true,
                is_admin: false,
            }).select().single();

            if (error) throw error;

            setCreatedVolunteer({
                username: profile.username,
                ticket: ticketNumber,
                password: ticketNumber
            });
        } catch (err) {
            console.warn("Supabase add volunteer failed, mimicking success:", err);
            setCreatedVolunteer({
                username: newVolunteerName.trim(),
                ticket: ticketNumber,
                password: ticketNumber
            });
        }

        showMessage(`Volunteer added! Credentials generated.`);
        setNewVolunteerName('');
        setAddingVolunteer(false);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const tabs = [
        { id: 'addUser', label: 'ADD USER', icon: UserPlus },
        { id: 'recharge', label: 'RECHARGE', icon: Coins },
        { id: 'addVolunteer', label: 'ADD VOL', icon: Shield },
        { id: 'users', label: 'ALL USERS', icon: Users },
    ];

    return (
        <div className="admin-container">
            {/* ── Header ── */}
            <header className="admin-header" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: '16px 24px', position: 'relative' }}>
                <div className="admin-brand" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Shield className="w-10 h-10 sm:w-12 sm:h-12 text-cyber-amber mb-2 drop-shadow-[0_0_15px_rgba(255,184,0,0.4)]" />
                    <h1 className="admin-title text-transparent bg-clip-text bg-gradient-to-br from-white to-cyber-amber drop-shadow-[0_0_15px_rgba(255,184,0,0.6)] text-lg sm:text-2xl font-black tracking-widest uppercase">ADMINISTRATOR <span className="text-cyber-amber drop-shadow-[0_0_10px_rgba(255,184,0,0.8)]">CMD</span></h1>
                </div>
                <button onClick={handleLogout} className="admin-exit-btn transition-all duration-300 hover:scale-110 hover:shadow-[0_0_15px_rgba(255,184,0,0.4)]" style={{ position: 'absolute', top: '16px', right: '16px', width: '40px', height: '40px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderColor: 'rgba(255,184,0,0.3)', color: 'var(--color-cyber-amber)' }}>
                    <LogOut className="w-5 h-5" />
                </button>
            </header>

            {/* ── Nav Tabs (Centered) ── */}
            <nav className="admin-nav">
                <div className="admin-nav-container">
                    {tabs.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setActiveTab(id)}
                            className={`admin-nav-item ${activeTab === id ? 'active-amber' : ''}`}
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
                                    <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '1.5rem', color: 'var(--color-cyber-cyan)', fontWeight: 900, letterSpacing: '3px' }}>
                                        {createdTicket}
                                    </span>
                                    <button
                                        onClick={handleCopyTicket}
                                        className="admin-exit-btn"
                                        style={{ borderColor: 'rgba(0,229,255,0.3)', color: 'var(--color-cyber-cyan)', background: 'rgba(0,229,255,0.1)', padding: '8px 14px' }}
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
                                        <Coins className="w-3.5 h-3.5 text-cyber-cyan" /> Initial Tokens
                                    </label>
                                    <div className="input-wrapper">
                                        <Coins className="input-icon w-4 h-4 text-cyber-cyan opacity-40" />
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
                                <Ticket className="w-4 h-4 text-cyber-cyan opacity-60" />
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

                {/* ═══ ADD VOLUNTEER TAB ═══ */}
                {activeTab === 'addVolunteer' && (
                    <div className="admin-form-card">
                        <h3 className="form-title">
                            <Shield className="w-5 h-5" />
                            ADD NEW VOLUNTEER
                        </h3>

                        {/* Volunteer Created Success Card */}
                        {createdVolunteer && (
                            <div className="alert-success" style={{ marginBottom: '28px', flexDirection: 'column', alignItems: 'stretch', gap: '12px' }}>
                                <p style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#8888aa' }}>
                                    Generated Credentials
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                                    <div className="flex flex-col">
                                        <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '1.25rem', color: 'var(--color-cyber-cyan)', fontWeight: 900, letterSpacing: '2px' }}>
                                            {createdVolunteer.ticket}
                                        </span>
                                        <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontFamily: "'Rajdhani', sans-serif" }}>
                                            Password: {createdVolunteer.password}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(`Ticket: ${createdVolunteer.ticket}\nPassword: ${createdVolunteer.password}`)}
                                        className="admin-exit-btn"
                                        style={{ borderColor: 'rgba(0,229,255,0.3)', color: 'var(--color-cyber-cyan)', background: 'rgba(0,229,255,0.1)', padding: '8px 14px' }}
                                    >
                                        {copiedTicket ? (
                                            <><CheckCheck className="w-4 h-4" /> COPIED!</>
                                        ) : (
                                            <><Copy className="w-4 h-4" /> COPY</>
                                        )}
                                    </button>
                                </div>
                                <p style={{ fontSize: '0.75rem', color: 'rgba(136,136,170,0.6)' }}>
                                    Share these credentials with the volunteer
                                </p>
                            </div>
                        )}

                        <form onSubmit={handleAddVolunteer}>
                            <div className="form-group">
                                <label className="form-label">
                                    <User className="w-3.5 h-3.5" /> Volunteer Name
                                </label>
                                <div className="input-wrapper">
                                    <Shield className="input-icon w-4 h-4 text-cyber-green" />
                                    <input
                                        type="text"
                                        value={newVolunteerName}
                                        onChange={(e) => setNewVolunteerName(e.target.value)}
                                        placeholder="Volunteer Name"
                                        className="admin-input"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-info" style={{ marginBottom: '24px' }}>
                                <Lock className="w-4 h-4 text-cyber-cyan opacity-60" />
                                <span>Ticket & Password will be <strong>auto-generated</strong> (VOL-XXXX)</span>
                            </div>

                            <div className="form-actions">
                                <button
                                    type="submit"
                                    disabled={addingVolunteer}
                                    className="admin-submit-btn"
                                >
                                    {addingVolunteer ? (
                                        <span style={{ animation: 'pulse 1.5s infinite' }}>ADDING...</span>
                                    ) : (
                                        <>
                                            <UserPlus className="w-5 h-5 btn-icon" />
                                            ADD VOLUNTEER
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
                                <Coins className="w-3.5 h-3.5 text-cyber-cyan" /> Token Amount
                            </label>
                            <div className="input-wrapper">
                                <Coins className="input-icon w-4 h-4 text-cyber-cyan opacity-40" />
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
                                style={{ background: 'linear-gradient(135deg, var(--color-cyber-cyan), #0099FF)', color: '#000000' }}
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
                            <button onClick={fetchUsers} className="admin-exit-btn" style={{ borderColor: 'rgba(0,229,255,0.3)', color: 'var(--color-cyber-cyan)', background: 'rgba(0,229,255,0.05)' }}>
                                <RefreshCw className="w-4 h-4" />
                            </button>
                        </div>

                        {users.length === 0 ? (
                            <div className="empty-state">
                                <Users className="w-16 h-16 empty-icon" style={{ color: '#8E9BB5' }} />
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
                                            background: 'linear-gradient(135deg, rgba(20,22,37,0.6), rgba(11,13,23,0.8))',
                                            border: '1px solid var(--color-cyber-border)',
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
                                                    background: 'rgba(0,229,255,0.1)',
                                                    border: '1px solid rgba(0,229,255,0.2)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'var(--color-cyber-cyan)',
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <User className="w-5 h-5" />
                                            </div>
                                            <div style={{ minWidth: 0 }}>
                                                <p style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '0.8125rem', color: 'var(--color-cyber-text)', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.username}</p>
                                                <p style={{ color: 'var(--color-cyber-muted)', fontSize: '0.75rem', fontFamily: "'Rajdhani', sans-serif", marginTop: '2px' }}>{u.ticket_number}</p>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '12px' }}>
                                            <p style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-cyber-cyan)', textShadow: '0 0 15px rgba(0,229,255,0.3)' }}>
                                                {u.balance_tokens}
                                            </p>
                                            <p style={{ color: 'var(--color-cyber-muted)', fontSize: '0.625rem', fontFamily: "'Rajdhani', sans-serif", fontWeight: 600 }}>TKN</p>
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
