import { ArrowUp, ArrowDown, Clock, Hash, Sparkles } from 'lucide-react';

export default function TransactionList({ transactions }) {
    if (!transactions || transactions.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="w-14 h-14 rounded-2xl bg-cyber-card/50 flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-7 h-7 text-cyber-muted/30" />
                </div>
                <div className="text-cyber-muted/40 font-['Share_Tech_Mono'] text-sm">
                    NO TRANSACTIONS YET
                </div>
                <p className="text-cyber-muted/25 text-xs mt-2 font-['Rajdhani']">
                    Your transaction history will appear here
                </p>
            </div>
        );
    }

    const getTypeConfig = (type) => {
        switch (type) {
            case 'recharge':
                return { icon: ArrowUp, label: 'RECHARGE', prefix: '+', rowClass: 'tx-recharge' };
            case 'deduction':
                return { icon: ArrowDown, label: 'DEDUCTION', prefix: '-', rowClass: 'tx-deduction' };
            case 'creation':
                return { icon: Sparkles, label: 'INITIAL', prefix: '+', rowClass: 'tx-creation' };
            default:
                return { icon: ArrowDown, label: type?.toUpperCase(), prefix: '', rowClass: '' };
        }
    };

    return (
        <div className="transaction-list">
            {transactions.map((tx, index) => {
                const config = getTypeConfig(tx.type);
                const Icon = config.icon;
                const date = new Date(tx.created_at);

                return (
                    <div
                        key={tx.id}
                        className={`transaction-item ${config.rowClass} animate-slide-up`}
                        style={{ animationDelay: `${index * 0.04}s` }}
                    >
                        <div className="tx-icon">
                            <Icon className="w-4.5 h-4.5" />
                        </div>
                        <div className="tx-details">
                            <p className="tx-type">{config.label}</p>
                            <div className="tx-meta">
                                <span className="flex items-center gap-1">
                                    <Clock className="w-2.5 h-2.5" />
                                    {date.toLocaleString('en-IN', {
                                        day: '2-digit',
                                        month: 'short',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </span>
                                {tx.hub_number && (
                                    <span className="flex items-center gap-1">
                                        <Hash className="w-2.5 h-2.5" />
                                        Hub {tx.hub_number}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="tx-amount">
                            {config.prefix}{tx.amount}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
