import { useState } from 'react';
import { X, Lock, Check, AlertTriangle, ShieldCheck, Eye, EyeOff, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import bcrypt from 'bcryptjs';

export default function ChangePasswordModal({ user, onClose }) {

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [focused, setFocused] = useState(null);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(onClose, 300);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError("New passwords don't match");
            return;
        }

        if (newPassword.length < 4) {
            setError("Password must be at least 4 characters");
            return;
        }

        setLoading(true);

        try {
            const { data: profile, error: fetchError } = await supabase
                .from('profiles')
                .select('password')
                .eq('id', user.id)
                .single();

            if (fetchError || !profile) throw new Error("Failed to verify user");

            const valid = bcrypt.compareSync(currentPassword, profile.password);
            if (!valid) throw new Error("Current password is incorrect");

            const newHash = bcrypt.hashSync(newPassword, 10);

            const { error: updateError } = await supabase
                .from('profiles')
                .update({ password: newHash })
                .eq('id', user.id);

            if (updateError) throw updateError;

            setSuccess(true);
            setTimeout(handleClose, 2000);

        } catch (err) {
            setError(err.message || "Failed to update password");
        } finally {
            setLoading(false);
        }
    };

    // ── All styles defined as objects ──
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
            transition: 'opacity 0.3s ease',
            opacity: isClosing ? 0 : 1,
        },
        card: {
            position: 'relative',
            width: '100%',
            maxWidth: '380px',
            maxHeight: '92vh',
            overflowY: 'auto',
            background: 'linear-gradient(180deg, #111111, #0a0a0a)',
            border: '1px solid rgba(255, 255, 0, 0.12)',
            borderRadius: '20px',
            boxShadow: '0 24px 60px rgba(0,0,0,0.85), 0 0 40px rgba(255,255,0,0.04)',
            transition: 'all 0.3s ease',
            transform: isClosing ? 'scale(0.95) translateY(16px)' : 'scale(1) translateY(0)',
            opacity: isClosing ? 0 : 1,
        },
        accentLine: {
            position: 'absolute',
            top: 0, left: 0, right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, transparent, #ffff00, #ffcc00, transparent)',
            opacity: 0.7,
        },
        header: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 20px',
            borderBottom: '1px solid rgba(255, 255, 0, 0.08)',
        },
        headerLeft: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
        },
        headerIcon: {
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(255,255,0,0.12), rgba(255,204,0,0.06))',
            border: '1px solid rgba(255,255,0,0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffff00',
            flexShrink: 0,
        },
        headerTitle: {
            fontFamily: "'Orbitron', sans-serif",
            fontSize: '14px',
            fontWeight: 700,
            letterSpacing: '1.5px',
            color: '#ffff00',
            textTransform: 'uppercase',
        },
        closeBtn: {
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.02)',
            color: '#666',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            flexShrink: 0,
        },
        body: {
            padding: '20px',
        },
        fieldWrapper: {
            marginBottom: '16px',
        },
        label: {
            display: 'block',
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: '14px',
            fontWeight: 600,
            color: '#b0b0b0',
            marginBottom: '8px',
            letterSpacing: '0.3px',
        },
        inputWrapper: {
            position: 'relative',
        },
        lockIcon: (isFocused) => ({
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '18px',
            height: '18px',
            color: isFocused ? '#ffff00' : '#555',
            transition: 'color 0.2s ease',
            pointerEvents: 'none',
        }),
        input: (isFocused) => ({
            width: '100%',
            boxSizing: 'border-box',
            background: '#080808',
            border: isFocused ? '1.5px solid rgba(255,255,0,0.4)' : '1.5px solid #222',
            borderRadius: '12px',
            padding: '14px 44px 14px 42px',
            color: '#e8e8e8',
            fontSize: '15px',
            fontFamily: "'Rajdhani', sans-serif",
            fontWeight: 500,
            outline: 'none',
            transition: 'all 0.2s ease',
            boxShadow: isFocused ? '0 0 0 3px rgba(255,255,0,0.06), 0 0 20px rgba(255,255,0,0.06)' : 'none',
        }),
        eyeBtn: {
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            color: '#555',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        sectionDivider: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            margin: '20px 0 16px',
        },
        dividerLine: {
            flex: 1,
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,0,0.1))',
        },
        dividerLineReverse: {
            flex: 1,
            height: '1px',
            background: 'linear-gradient(90deg, rgba(255,255,0,0.1), transparent)',
        },
        dividerText: {
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '2px',
            color: '#555',
            textTransform: 'uppercase',
        },
        errorBox: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 14px',
            borderRadius: '12px',
            background: 'rgba(255,51,102,0.08)',
            border: '1px solid rgba(255,51,102,0.15)',
            marginTop: '8px',
            marginBottom: '4px',
        },
        errorText: {
            color: '#ff6688',
            fontSize: '14px',
            fontFamily: "'Rajdhani', sans-serif",
            fontWeight: 600,
        },
        footer: {
            display: 'flex',
            gap: '10px',
            padding: '4px 20px 20px',
        },
        cancelBtn: {
            flex: 1,
            padding: '14px 0',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#888',
            fontFamily: "'Orbitron', sans-serif",
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
        },
        submitBtn: {
            flex: 1.6,
            padding: '14px 0',
            borderRadius: '12px',
            background: 'linear-gradient(90deg, #ffff00, #ffcc00)',
            border: 'none',
            color: '#000',
            fontFamily: "'Orbitron', sans-serif",
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            opacity: loading ? 0.5 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
        },
        // Success screen 
        successContainer: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 20px',
            textAlign: 'center',
        },
        successIcon: {
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(255,255,0,0.12), rgba(255,204,0,0.06))',
            border: '1.5px solid rgba(255,255,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            color: '#ffff00',
            boxShadow: '0 0 30px rgba(255,255,0,0.1)',
        },
        successTitle: {
            fontFamily: "'Orbitron', sans-serif",
            fontSize: '18px',
            fontWeight: 700,
            color: '#fff',
            letterSpacing: '1px',
            marginBottom: '8px',
        },
        successDesc: {
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: '14px',
            color: '#888',
            fontWeight: 500,
        },
    };

    const PasswordField = ({ id, label, value, onChange, placeholder, show, toggleShow }) => (
        <div style={styles.fieldWrapper}>
            <label style={styles.label}>{label}</label>
            <div style={styles.inputWrapper}>
                <Lock style={styles.lockIcon(focused === id)} />
                <input
                    type={show ? 'text' : 'password'}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required
                    onFocus={() => setFocused(id)}
                    onBlur={() => setFocused(null)}
                    style={styles.input(focused === id)}
                />
                <button
                    type="button"
                    onClick={toggleShow}
                    style={styles.eyeBtn}
                    tabIndex={-1}
                >
                    {show ? <EyeOff style={{ width: 18, height: 18 }} /> : <Eye style={{ width: 18, height: 18 }} />}
                </button>
            </div>
        </div>
    );

    return (
        <div style={styles.overlay} onClick={handleClose}>
            <div style={styles.card} onClick={(e) => e.stopPropagation()}>

                {/* Accent */}
                <div style={styles.accentLine}></div>

                {/* Header */}
                <div style={styles.header}>
                    <div style={styles.headerLeft}>
                        <div style={styles.headerIcon}>
                            <ShieldCheck style={{ width: 20, height: 20 }} />
                        </div>
                        <span style={styles.headerTitle}>Change Password</span>
                    </div>
                    <button
                        onClick={handleClose}
                        style={styles.closeBtn}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,51,102,0.1)'; e.currentTarget.style.color = '#ff3366'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.color = '#666'; }}
                    >
                        <X style={{ width: 16, height: 16 }} />
                    </button>
                </div>

                {success ? (
                    <div style={styles.successContainer}>
                        <div style={styles.successIcon}>
                            <Check style={{ width: 36, height: 36 }} />
                        </div>
                        <div style={styles.successTitle}>PASSWORD UPDATED</div>
                        <div style={styles.successDesc}>Your password has been changed successfully.</div>
                    </div>
                ) : (
                    <>
                        {/* Body */}
                        <form onSubmit={handleSubmit}>
                            <div style={styles.body}>

                                {/* Section: Current */}
                                <div style={styles.sectionDivider}>
                                    <div style={styles.dividerLine}></div>
                                    <span style={styles.dividerText}>Verify Identity</span>
                                    <div style={styles.dividerLineReverse}></div>
                                </div>

                                <PasswordField
                                    id="current"
                                    label="Current Password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="Enter current password"
                                    show={showCurrent}
                                    toggleShow={() => setShowCurrent(!showCurrent)}
                                />

                                {/* Section: New */}
                                <div style={styles.sectionDivider}>
                                    <div style={styles.dividerLine}></div>
                                    <span style={styles.dividerText}>Set New Password</span>
                                    <div style={styles.dividerLineReverse}></div>
                                </div>

                                <PasswordField
                                    id="new"
                                    label="New Password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password"
                                    show={showNew}
                                    toggleShow={() => setShowNew(!showNew)}
                                />

                                <PasswordField
                                    id="confirm"
                                    label="Confirm New Password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Re-enter new password"
                                    show={showConfirm}
                                    toggleShow={() => setShowConfirm(!showConfirm)}
                                />

                                {/* Error */}
                                {error && (
                                    <div style={styles.errorBox}>
                                        <AlertTriangle style={{ width: 18, height: 18, color: '#ff3366', flexShrink: 0 }} />
                                        <span style={styles.errorText}>{error}</span>
                                    </div>
                                )}
                            </div>

                            {/* Footer Buttons */}
                            <div style={styles.footer}>
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    style={styles.cancelBtn}
                                    onMouseEnter={(e) => { e.currentTarget.style.color = '#ccc'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.color = '#888'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={styles.submitBtn}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="animate-spin" style={{ width: 16, height: 16 }} />
                                            UPDATING...
                                        </>
                                    ) : (
                                        <>
                                            <ShieldCheck style={{ width: 16, height: 16 }} />
                                            UPDATE
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </>
                )}

            </div>
        </div>
    );
}
