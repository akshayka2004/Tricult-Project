import { X, Hash, Clock, Coins, Timer, CheckCircle, User } from 'lucide-react';

export default function BillModal({ bill, onClose }) {
    if (!bill) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-content animate-slide-up"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="glass-card overflow-hidden">
                    {/* Header */}
                    <div className="relative p-4 sm:p-6 bg-gradient-to-r from-cyber-cyan/10 to-cyber-magenta/10 border-b border-cyber-border">
                        <button onClick={onClose} className="modal-close absolute top-4 right-4">
                            <X className="w-4 h-4" />
                        </button>
                        <div className="flex items-center gap-3 mb-1">
                            <CheckCircle className="w-5 h-5 text-cyber-green" />
                            <h3 className="modal-title text-glow-cyan" style={{ color: '#00ffff' }}>
                                SESSION BILL
                            </h3>
                        </div>
                        <p className="text-cyber-muted text-[10px] font-['Share_Tech_Mono'] mt-2 tracking-wider ml-8">
                            Transaction Receipt
                        </p>
                    </div>

                    {/* Avatar & Username */}
                    <div className="p-4 sm:p-6 flex items-center gap-4 border-b border-cyber-border/30">
                        <div className="w-12 h-12 rounded-xl bg-cyber-bg/40 border border-cyber-cyan/30 flex items-center justify-center flex-shrink-0 text-cyber-cyan">
                            <User className="w-6 h-6" />
                        </div>
                        <div className="min-w-0">
                            <p className="font-['Orbitron'] text-sm text-cyber-text font-bold truncate">{bill.username}</p>
                            <p className="text-cyber-muted text-xs font-['Share_Tech_Mono'] mt-1">{bill.ticket_number}</p>
                        </div>
                    </div>

                    {/* Details */}
                    <div className="p-4 sm:p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2.5 text-cyber-muted font-['Rajdhani'] text-sm font-medium">
                                <Hash className="w-4 h-4 text-cyber-cyan" />
                                Hub Number
                            </span>
                            <span className="font-['Orbitron'] text-sm text-cyber-text font-bold">
                                #{bill.hub_number}
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2.5 text-cyber-muted font-['Rajdhani'] text-sm font-medium">
                                <Timer className="w-4 h-4 text-cyber-magenta" />
                                Duration
                            </span>
                            <span className="font-['Orbitron'] text-sm text-cyber-text font-bold">
                                {bill.duration}
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2.5 text-cyber-muted font-['Rajdhani'] text-sm font-medium">
                                <Clock className="w-4 h-4 text-cyber-yellow" />
                                Timestamp
                            </span>
                            <span className="font-['Share_Tech_Mono'] text-cyber-text text-xs">
                                {new Date(bill.timestamp).toLocaleString('en-IN', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </span>
                        </div>

                        <div className="cyber-divider my-2" />

                        <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2.5 text-cyber-muted font-['Rajdhani'] font-semibold">
                                <Coins className="w-4 h-4 text-cyber-red" />
                                Tokens Deducted
                            </span>
                            <span className="font-['Orbitron'] text-cyber-red text-xl font-bold">
                                -{bill.amount}
                            </span>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                        <button onClick={onClose} className="btn-base cyber-btn btn-full">
                            CLOSE
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
