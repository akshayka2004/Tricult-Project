import { X, Hash, Clock, Coins, Timer, CheckCircle, User, AlertTriangle, Gamepad2 } from 'lucide-react';

export default function BillModal({ bill, onClose, onConfirm, type = 'receipt' }) {
    if (!bill) return null;

    const isConfirmation = type === 'confirmation';

    // ─── Styles ───
    const styles = {
        overlay: {
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            background: 'rgba(0, 0, 0, 0.92)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
        },
        card: {
            width: '100%',
            maxWidth: '380px',
            background: 'rgba(10, 10, 26, 0.95)',
            border: '1px solid rgba(42, 42, 94, 0.5)',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 0 50px rgba(0, 0, 0, 0.8)',
            position: 'relative',
            animation: 'slideUp 0.3s ease-out forwards',
        },
        header: {
            padding: '24px',
            background: 'linear-gradient(90deg, rgba(0, 255, 255, 0.05) 0%, rgba(255, 0, 255, 0.05) 100%)',
            borderBottom: '1px solid rgba(42, 42, 94, 0.5)',
            position: 'relative',
        },
        closeBtn: {
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'transparent',
            border: 'none',
            color: 'rgba(136, 136, 170, 0.5)',
            cursor: 'pointer',
            padding: '8px',
        },
        titleRow: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '4px',
        },
        title: {
            fontFamily: "'Orbitron', sans-serif",
            fontSize: '18px',
            fontWeight: 700,
            color: isConfirmation ? '#ffcc00' : '#00ffff',
            letterSpacing: '1px',
            textShadow: isConfirmation ? '0 0 10px rgba(255, 204, 0, 0.3)' : '0 0 10px rgba(0, 255, 255, 0.3)',
        },
        subtitle: {
            fontFamily: "'Share_Tech_Mono', monospace",
            fontSize: '11px',
            color: 'rgba(136, 136, 170, 0.6)',
            letterSpacing: '1px',
            marginLeft: '32px',
        },
        body: {
            padding: '24px',
        },
        userInfo: {
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '24px',
            paddingBottom: '24px',
            borderBottom: '1px solid rgba(42, 42, 94, 0.3)',
        },
        avatar: {
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(0, 255, 255, 0.05)',
            border: '1px solid rgba(0, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#00ffff',
        },
        userName: {
            fontFamily: "'Orbitron', sans-serif",
            fontSize: '15px',
            fontWeight: 700,
            color: '#ffffff',
            marginBottom: '4px',
        },
        ticketNum: {
            fontFamily: "'Share_Tech_Mono', monospace",
            fontSize: '12px',
            color: 'rgba(136, 136, 170, 0.8)',
        },
        row: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
        },
        label: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: '15px',
            fontWeight: 600,
            color: '#8888aa',
        },
        value: {
            fontFamily: "'Orbitron', sans-serif",
            fontSize: '15px',
            fontWeight: 700,
            color: '#ffffff',
        },
        divider: {
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(42, 42, 94, 0.5), transparent)',
            margin: '20px 0',
        },
        totalLabel: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: '16px',
            fontWeight: 700,
            color: '#8888aa',
        },
        totalValue: {
            fontFamily: "'Orbitron', sans-serif",
            fontSize: '24px',
            fontWeight: 700,
            color: '#ff0055',
            textShadow: '0 0 15px rgba(255, 0, 85, 0.3)',
        },
        footer: {
            padding: '24px',
            display: 'flex',
            gap: '12px',
        },
        btnPrimary: {
            flex: 1,
            padding: '16px',
            borderRadius: '12px',
            border: isConfirmation ? '1px solid rgba(255, 204, 0, 0.3)' : '1px solid rgba(0, 255, 255, 0.3)',
            outline: 'none',
            background: isConfirmation
                ? 'linear-gradient(90deg, rgba(255, 204, 0, 0.1), rgba(255, 204, 0, 0.2))'
                : 'linear-gradient(90deg, rgba(0, 255, 255, 0.1), rgba(0, 255, 255, 0.2))',
            color: isConfirmation ? '#ffcc00' : '#00ffff',
            fontFamily: "'Orbitron', sans-serif",
            fontSize: '14px',
            fontWeight: 700,
            letterSpacing: '1px',
            cursor: 'pointer',
            boxShadow: isConfirmation ? '0 0 15px rgba(255, 204, 0, 0.1)' : '0 0 15px rgba(0, 255, 255, 0.1)',
        },
        btnSecondary: {
            flex: 1,
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid rgba(136, 136, 170, 0.3)',
            background: 'transparent',
            color: '#8888aa',
            fontFamily: "'Orbitron', sans-serif",
            fontSize: '14px',
            fontWeight: 700,
            letterSpacing: '1px',
            cursor: 'pointer',
        },
        typeBadge: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: 700,
            fontFamily: "'Rajdhani', sans-serif",
            letterSpacing: '1px',
            textTransform: 'uppercase',
            background: bill.is_timed ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 170, 0, 0.1)',
            color: bill.is_timed ? '#00ff88' : '#ffaa00',
            border: bill.is_timed ? '1px solid rgba(0, 255, 136, 0.3)' : '1px solid rgba(255, 170, 0, 0.3)',
        },
    };

    return (
        <div style={styles.overlay} onClick={onClose}>
            <style>
                {`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                `}
            </style>
            <div style={styles.card} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div style={styles.header}>
                    <button onClick={onClose} style={styles.closeBtn}>
                        <X size={18} />
                    </button>
                    <div style={styles.titleRow}>
                        {isConfirmation ? (
                            <AlertTriangle size={20} color="#ffcc00" />
                        ) : (
                            <CheckCircle size={20} color="#00ffff" />
                        )}
                        <h3 style={styles.title}>
                            {isConfirmation ? 'CONFIRM SESSION' : 'TRANSACTION RECEIPT'}
                        </h3>
                    </div>
                    <p style={styles.subtitle}>
                        {isConfirmation ? 'Please review details' : 'Transaction Successful'}
                    </p>
                </div>

                {/* Body */}
                <div style={styles.body}>
                    {/* User Info */}
                    <div style={styles.userInfo}>
                        <div style={styles.avatar}>
                            <User size={24} />
                        </div>
                        <div>
                            <p style={styles.userName}>{bill.username}</p>
                            <p style={styles.ticketNum}>{bill.ticket_number}</p>
                        </div>
                    </div>

                    {/* Activity Name */}
                    <div style={styles.row}>
                        <span style={styles.label}>
                            <Gamepad2 size={16} color="#00ffff" /> Activity
                        </span>
                        <span style={styles.value}>{bill.activity_name}</span>
                    </div>

                    {/* Duration (only for timed activities) */}
                    {bill.is_timed && bill.duration_mins && (
                        <div style={styles.row}>
                            <span style={styles.label}>
                                <Timer size={16} color="#ff00ff" /> Duration
                            </span>
                            <span style={styles.value}>{bill.duration_mins} min</span>
                        </div>
                    )}

                    {/* Type badge */}
                    <div style={{ ...styles.row, justifyContent: 'flex-start' }}>
                        <span style={styles.typeBadge}>
                            {bill.is_timed ? '⏱ Timed Session' : '⚡ Instant Deduction'}
                        </span>
                    </div>

                    {/* Timestamp (only on receipt) */}
                    {bill.timestamp && (
                        <div style={styles.row}>
                            <span style={styles.label}>
                                <Clock size={16} color="#ffff00" /> Timestamp
                            </span>
                            <span style={{ ...styles.value, fontFamily: "'Share_Tech_Mono', monospace", fontSize: '13px' }}>
                                {new Date(bill.timestamp).toLocaleString('en-IN', {
                                    hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short'
                                })}
                            </span>
                        </div>
                    )}

                    <div style={styles.divider} />

                    {/* Total Tokens */}
                    <div style={styles.row}>
                        <span style={styles.totalLabel}>
                            <Coins size={18} color="#ff0055" /> TOKENS
                        </span>
                        <span style={styles.totalValue}>-{bill.amount}</span>
                    </div>
                </div>

                {/* Footer */}
                <div style={styles.footer}>
                    {isConfirmation ? (
                        <>
                            <button onClick={onClose} style={styles.btnSecondary}>
                                CANCEL
                            </button>
                            <button onClick={onConfirm} style={styles.btnPrimary}>
                                CONFIRM & PLAY
                            </button>
                        </>
                    ) : (
                        <button onClick={onClose} style={{ ...styles.btnPrimary, width: '100%' }}>
                            CLOSE RECEIPT
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
