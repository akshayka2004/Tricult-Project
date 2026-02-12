import { useState } from 'react';
import { X, Lock, Check, AlertTriangle, ShieldCheck } from 'lucide-react';
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

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/90 backdrop-blur-[14px] transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'animate-fade-in'}`}
            onClick={handleClose}
        >

            <div
                className={`relative w-full max-w-[380px] bg-gradient-to-b from-[#121212] to-[#0b0b0b] border border-[#ffff00]/15 rounded-3xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_40px_rgba(255,255,0,0.05)] transition-all duration-300 ${isClosing ? 'scale-95 opacity-0 translate-y-4' : 'animate-slide-up'}`}
                onClick={(e) => e.stopPropagation()}
            >

                {/* Accent Line */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#ffff00] to-[#ffcc00] opacity-60"></div>

                {/* Header */}
                <div className="flex items-center justify-between px-10 pt-10 pb-9 border-b border-[#ffff00]/10">

                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ffff00]/20 to-[#ffcc00]/10 border border-[#ffff00]/25 flex items-center justify-center text-[#ffff00] shadow-[0_0_15px_rgba(255,255,0,0.12)]">
                            <ShieldCheck className="w-6 h-6" />
                        </div>

                        <h2 className="font-['Orbitron'] text-xl font-semibold tracking-wider text-[#ffff00] uppercase">
                            Change Password
                        </h2>
                    </div>

                    <button
                        onClick={handleClose}
                        className="w-10 h-10 rounded-lg border border-white/10 bg-white/[0.02] text-[#666] flex items-center justify-center transition-all duration-300 hover:bg-[#ff3366]/10 hover:text-[#ff3366] hover:border-[#ff3366]/30"
                    >
                        <X className="w-5 h-5" />
                    </button>

                </div>

                {/* Body */}
                <div className="px-10 py-16">

                    {success ? (

                        <div className="flex flex-col items-center justify-center py-20 text-center animate-scale-in">

                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#ffff00]/20 to-[#ffcc00]/10 flex items-center justify-center mb-10 border border-[#ffff00]/30 shadow-[0_0_40px_rgba(255,255,0,0.18)]">
                                <Check className="w-12 h-12 text-[#ffff00]" />
                            </div>

                            <h3 className="font-['Orbitron'] text-2xl font-bold text-white mb-4 tracking-wide">
                                PASSWORD UPDATED
                            </h3>

                            <p className="text-[#888] text-base font-['Rajdhani']">
                                Your password has been changed successfully.
                            </p>

                        </div>

                    ) : (

                        <form onSubmit={handleSubmit} className="space-y-12">

                            {/* Current Password */}
                            <div className="space-y-4">
                                <label className="block text-xs font-bold font-['Share_Tech_Mono'] text-[#8a8a8a] uppercase tracking-[0.15em] ml-1">
                                    Current Password
                                </label>

                                <div className="relative group">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#555] group-focus-within:text-[#ffff00]" />

                                    <input
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="Enter current password"
                                        required
                                        className="w-full bg-[#0a0a0a] border border-[#242424] rounded-2xl py-[20px] pl-14 pr-6 text-white placeholder:text-[#444] focus:outline-none focus:border-[#ffff00]/40 focus:shadow-[0_0_0_3px_rgba(255,255,0,0.10),0_0_30px_rgba(255,255,0,0.10)] transition-all duration-300 font-['Rajdhani'] text-lg"
                                    />
                                </div>
                            </div>

                            {/* New Password */}
                            <div className="space-y-4">
                                <label className="block text-xs font-bold font-['Share_Tech_Mono'] text-[#8a8a8a] uppercase tracking-[0.15em] ml-1">
                                    New Password
                                </label>

                                <div className="relative group">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#555] group-focus-within:text-[#ffff00]" />

                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Enter new password"
                                        required
                                        className="w-full bg-[#0a0a0a] border border-[#242424] rounded-2xl py-[20px] pl-14 pr-6 text-white placeholder:text-[#444] focus:outline-none focus:border-[#ffff00]/40 focus:shadow-[0_0_0_3px_rgba(255,255,0,0.10),0_0_30px_rgba(255,255,0,0.10)] transition-all duration-300 font-['Rajdhani'] text-lg"
                                    />
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-4">
                                <label className="block text-xs font-bold font-['Share_Tech_Mono'] text-[#8a8a8a] uppercase tracking-[0.15em] ml-1">
                                    Confirm New Password
                                </label>

                                <div className="relative group">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#555] group-focus-within:text-[#ffff00]" />

                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm new password"
                                        required
                                        className="w-full bg-[#0a0a0a] border border-[#242424] rounded-2xl py-[20px] pl-14 pr-6 text-white placeholder:text-[#444] focus:outline-none focus:border-[#ffff00]/40 focus:shadow-[0_0_0_3px_rgba(255,255,0,0.10),0_0_30px_rgba(255,255,0,0.10)] transition-all duration-300 font-['Rajdhani'] text-lg"
                                    />
                                </div>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="flex items-start gap-4 p-6 rounded-xl bg-[#ff3366]/10 border border-[#ff3366]/20">
                                    <AlertTriangle className="w-6 h-6 text-[#ff3366] flex-shrink-0 mt-1" />
                                    <span className="text-[#ff3366] text-base font-['Rajdhani'] font-medium">
                                        {error}
                                    </span>
                                </div>
                            )}

                            {/* Submit */}
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full relative overflow-hidden group bg-gradient-to-r from-[#ffff00] to-[#ffcc00] text-black font-bold font-['Orbitron'] text-base tracking-wider uppercase py-[20px] rounded-2xl transition-all duration-300 hover:-translate-y-[1px] hover:shadow-[0_18px_45px_rgba(255,255,0,0.28)] disabled:opacity-50"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-3">
                                        {loading ? (
                                            <>
                                                <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></span>
                                                UPDATING...
                                            </>
                                        ) : (
                                            'UPDATE PASSWORD'
                                        )}
                                    </span>
                                </button>
                            </div>

                        </form>

                    )}

                </div>

            </div>
        </div>
    );
}
