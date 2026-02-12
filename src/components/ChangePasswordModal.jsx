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

    const PasswordField = ({ label, value, onChange, placeholder, show, toggleShow }) => (
        <div className="space-y-2">
            <label className="block text-sm font-semibold font-['Rajdhani'] text-[#aaa] tracking-wide">
                {label}
            </label>
            <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#555] group-focus-within:text-[#ffff00] transition-colors" />
                <input
                    type={show ? 'text' : 'password'}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required
                    className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl py-3.5 pl-11 pr-12 text-[#e8e8e8] text-[15px] placeholder:text-[#3a3a3a] focus:outline-none focus:border-[#ffff00]/40 focus:shadow-[0_0_0_3px_rgba(255,255,0,0.08)] transition-all duration-200 font-['Rajdhani'] font-medium"
                />
                <button
                    type="button"
                    onClick={toggleShow}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#ffff00] transition-colors"
                    tabIndex={-1}
                >
                    {show ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                </button>
            </div>
        </div>
    );

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'animate-fade-in'}`}
            onClick={handleClose}
        >
            <div
                className={`relative w-full max-w-[400px] bg-gradient-to-b from-[#111] to-[#0a0a0a] border border-[#ffff00]/12 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(255,255,0,0.04)] transition-all duration-300 max-h-[95vh] overflow-y-auto ${isClosing ? 'scale-95 opacity-0 translate-y-4' : 'animate-slide-up'}`}
                onClick={(e) => e.stopPropagation()}
            >

                {/* Top Accent */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#ffff00] to-[#ffcc00] opacity-60"></div>

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 sm:px-6 sm:py-5 border-b border-[#ffff00]/8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ffff00]/15 to-[#ffcc00]/8 border border-[#ffff00]/20 flex items-center justify-center text-[#ffff00]">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <h2 className="font-['Orbitron'] text-sm sm:text-base font-bold tracking-wider text-[#ffff00] uppercase">
                            Change Password
                        </h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="w-9 h-9 rounded-lg border border-white/8 bg-white/[0.02] text-[#666] flex items-center justify-center transition-all duration-200 hover:bg-[#ff3366]/10 hover:text-[#ff3366] hover:border-[#ff3366]/25"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-5 py-5 sm:px-6 sm:py-6">

                    {success ? (

                        <div className="flex flex-col items-center justify-center py-10 text-center animate-scale-in">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#ffff00]/15 to-[#ffcc00]/8 flex items-center justify-center mb-5 border border-[#ffff00]/25 shadow-[0_0_30px_rgba(255,255,0,0.12)]">
                                <Check className="w-10 h-10 text-[#ffff00]" />
                            </div>
                            <h3 className="font-['Orbitron'] text-lg font-bold text-white mb-2 tracking-wide">
                                PASSWORD UPDATED
                            </h3>
                            <p className="text-[#888] text-sm font-['Rajdhani'] font-medium">
                                Your password has been changed successfully.
                            </p>
                        </div>

                    ) : (

                        <form onSubmit={handleSubmit} className="space-y-5">

                            {/* Divider Label */}
                            <div className="flex items-center gap-3 mb-1">
                                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#ffff00]/10"></div>
                                <span className="text-[11px] font-bold font-['Share_Tech_Mono'] text-[#555] tracking-[0.2em] uppercase">Security</span>
                                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#ffff00]/10"></div>
                            </div>

                            <PasswordField
                                label="Current Password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="Enter current password"
                                show={showCurrent}
                                toggleShow={() => setShowCurrent(!showCurrent)}
                            />

                            {/* Divider Label */}
                            <div className="flex items-center gap-3 pt-2">
                                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#ffff00]/10"></div>
                                <span className="text-[11px] font-bold font-['Share_Tech_Mono'] text-[#555] tracking-[0.2em] uppercase">New Password</span>
                                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#ffff00]/10"></div>
                            </div>

                            <PasswordField
                                label="New Password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                                show={showNew}
                                toggleShow={() => setShowNew(!showNew)}
                            />

                            <PasswordField
                                label="Confirm New Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Re-enter new password"
                                show={showConfirm}
                                toggleShow={() => setShowConfirm(!showConfirm)}
                            />

                            {/* Error */}
                            {error && (
                                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#ff3366]/8 border border-[#ff3366]/15">
                                    <AlertTriangle className="w-5 h-5 text-[#ff3366] flex-shrink-0" />
                                    <span className="text-[#ff6688] text-sm font-['Rajdhani'] font-semibold">
                                        {error}
                                    </span>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="flex-1 py-3.5 rounded-xl bg-white/[0.04] border border-white/8 text-[#888] font-['Orbitron'] text-[11px] font-bold tracking-wider uppercase transition-all duration-200 hover:bg-white/[0.06] hover:text-[#ccc]"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-[1.5] relative overflow-hidden group bg-gradient-to-r from-[#ffff00] to-[#ffcc00] text-black font-bold font-['Orbitron'] text-[11px] tracking-wider uppercase py-3.5 rounded-xl transition-all duration-300 hover:-translate-y-[1px] hover:shadow-[0_12px_30px_rgba(255,255,0,0.25)] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                UPDATING...
                                            </>
                                        ) : (
                                            <>
                                                <ShieldCheck className="w-4 h-4" />
                                                UPDATE
                                            </>
                                        )}
                                    </span>
                                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent"></div>
                                </button>
                            </div>

                        </form>

                    )}

                </div>

            </div>
        </div>
    );
}
