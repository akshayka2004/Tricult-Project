import { X, Coins, Check, ArrowRight, User, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function RechargeConfirmModal({ data, onConfirm, onCancel, loading }) {
    const [amount, setAmount] = useState(data?.amount || 500);
    const [isClosing, setIsClosing] = useState(false);

    // Update amount if data changes
    useEffect(() => {
        if (data?.amount) setAmount(data.amount);
    }, [data]);

    const handleAmountChange = (e) => {
        const val = parseInt(e.target.value) || 0;
        setAmount(val);
    };

    const handleQuickAmount = (val) => {
        setAmount(val);
    };

    const handleConfirm = () => {
        onConfirm({ ...data, amount });
    };

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(onCancel, 300);
    };

    if (!data) return null;

    const currentBalance = data.current_balance || 0;
    const newBalance = currentBalance + amount;

    return (
        <div className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/95 backdrop-blur-[12px] transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'animate-fade-in'}`} onClick={handleClose}>
            <div
                className={`relative w-full max-w-[420px] bg-gradient-to-br from-[#0f0f0f] to-[#080808] border-[1.5px] border-[#ffff00]/25 rounded-[24px] overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,0,0.1),0_0_60px_rgba(255,255,0,0.1)] transition-all duration-300 ${isClosing ? 'scale-95 opacity-0 translate-y-4' : 'animate-slide-up'}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Top Accent Line */}
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#ffff00] to-[#ffcc00] opacity-80"></div>

                {/* Header */}
                <div className="flex items-center justify-between px-7 pt-6 pb-5 border-b border-[#ffff00]/10">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#ffff00]/15 to-[#ffcc00]/10 border border-[#ffff00]/30 flex items-center justify-center text-[#ffff00] shadow-[0_0_20px_rgba(255,255,0,0.15)] text-lg">
                            ⚡
                        </div>
                        <span className="font-['Orbitron'] text-lg font-bold uppercase tracking-wider text-[#ffff00]">
                            Confirm Recharge
                        </span>
                    </div>
                    <button
                        onClick={handleClose}
                        className="w-9 h-9 rounded-lg border border-white/10 bg-white/[0.03] text-[#666] flex items-center justify-center hover:bg-[#ff3366]/15 hover:text-[#ff3366] hover:border-[#ff3366]/30 hover:rotate-90 transition-all duration-200"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-7 py-7 flex flex-col gap-6">
                    {/* User Card */}
                    <div className="flex items-center gap-4 p-5 bg-gradient-to-br from-[#ffff00]/5 to-[#ffcc00]/[0.03] border border-[#ffff00]/15 rounded-2xl relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#ffff00] to-[#ffcc00]"></div>
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#ffff00]/20 to-[#ffcc00]/10 border-2 border-[#ffff00]/30 flex items-center justify-center text-2xl shadow-[0_4px_15px_rgba(255,255,0,0.1)] flex-shrink-0 text-[#ffff00]">
                            <User className="w-7 h-7" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="font-['Orbitron'] text-lg font-bold text-[#ffff00] truncate mb-1">
                                {data.username}
                            </div>
                            <div className="font-['Share_Tech_Mono'] text-sm text-[#888844] flex items-center gap-1.5">
                                <span className="text-[#555]">ID:</span>
                                {data.ticket_number}
                            </div>
                        </div>
                    </div>

                    {/* Current Balance */}
                    <div className="text-center p-5 bg-black/60 rounded-2xl border border-white/5">
                        <div className="text-[11px] font-bold tracking-[2px] uppercase text-[#666] mb-2">
                            Current Balance
                        </div>
                        <div className="font-['Orbitron'] text-3xl font-extrabold text-[#ffff00] drop-shadow-[0_0_20px_rgba(255,255,0,0.3)]">
                            {currentBalance}
                            <span className="text-sm font-sans font-normal text-[#884] ml-1">TKN</span>
                        </div>
                    </div>

                    {/* Amount Input */}
                    <div className="flex flex-col gap-3">
                        <div className="text-[11px] font-bold tracking-[2px] uppercase text-[#884] text-center">
                            Recharge Amount
                        </div>
                        <div className="relative flex items-center">
                            <span className="absolute left-5 font-['Orbitron'] text-2xl font-bold text-[#884] pointer-events-none">+</span>
                            <input
                                type="number"
                                className="w-full py-5 pl-12 pr-6 bg-black/80 border-2 border-[#ffff00]/20 rounded-2xl font-['Orbitron'] text-3xl font-bold text-[#ffff00] text-center outline-none transition-all duration-300 focus:border-[#ffff00]/50 focus:bg-black/95 focus:shadow-[0_0_0_4px_rgba(255,255,0,0.1),0_0_30px_rgba(255,255,0,0.15)] placeholder:text-[#333]"
                                value={amount}
                                onChange={handleAmountChange}
                            />
                        </div>

                        {/* Quick Amounts */}
                        <div className="grid grid-cols-4 gap-2.5">
                            {[100, 250, 500, 1000].map((val) => (
                                <button
                                    key={val}
                                    className={`py-3 px-2 rounded-xl border font-['Rajdhani'] text-sm font-semibold transition-all duration-200 ${amount === val
                                            ? 'bg-[#ffff00]/20 border-[#ffff00] text-[#ffff00] shadow-[0_4px_15px_rgba(255,255,0,0.2)]'
                                            : 'bg-[#ffff00]/5 border-[#ffff00]/15 text-[#884] hover:bg-[#ffff00]/10 hover:border-[#ffff00]/30 hover:text-[#ffff00] hover:-translate-y-0.5'
                                        }`}
                                    onClick={() => handleQuickAmount(val)}
                                >
                                    {val}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="p-5 bg-black/60 rounded-2xl border border-[#ffff00]/10 flex flex-col gap-3">
                        <div className="flex justify-between items-center text-[15px]">
                            <span className="text-[#666] font-medium">Current</span>
                            <span className="font-['Orbitron'] font-semibold text-[#e0e0e0]">{currentBalance} TKN</span>
                        </div>
                        <div className="flex justify-between items-center text-[15px]">
                            <span className="text-[#666] font-medium">Add</span>
                            <span className="font-['Orbitron'] font-semibold text-[#ccff00]">+{amount} TKN</span>
                        </div>
                        <div className="h-px bg-gradient-to-r from-transparent via-[#ffff00]/20 to-transparent my-1"></div>
                        <div className="flex justify-between items-center pt-1">
                            <span className="font-['Orbitron'] text-sm font-bold tracking-wider text-[#ffff00] uppercase">New Total</span>
                            <span className="font-['Orbitron'] text-2xl font-extrabold text-[#ffff00] drop-shadow-[0_0_15px_rgba(255,255,0,0.4)]">
                                {newBalance} TKN
                            </span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 px-7 pb-7 pt-0">
                    <button
                        onClick={handleClose}
                        className="flex-1 py-4 rounded-xl bg-white/[0.05] border border-white/10 text-[#888] font-['Orbitron'] text-[13px] font-bold tracking-wider uppercase transition-all duration-300 hover:bg-white/[0.08] hover:border-white/20 hover:text-[#e0e0e0]"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={loading}
                        className="flex-1 py-4 rounded-xl bg-gradient-to-r from-[#ffff00] to-[#ffcc00] text-black font-['Orbitron'] text-[13px] font-bold tracking-wider uppercase shadow-[0_4px_20px_rgba(255,255,0,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(255,255,0,0.5)] active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin w-4 h-4" />
                                    PROCESSING...
                                </>
                            ) : (
                                <>
                                    CONFIRM RECHARGE
                                </>
                            )}
                        </span>
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                    </button>
                </div>
            </div>
        </div>
    );
}
