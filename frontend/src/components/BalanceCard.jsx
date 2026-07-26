import { TrendingUp, TrendingDown } from 'lucide-react';

export const BalanceCard = ({ totalBalance, income, expense }) => {
    return (
        <div className="bg-navy/95 backdrop-blur-glass border border-white/10 p-6 rounded-3xl relative overflow-hidden shadow-glass">
            {/* Orbes internos para el efecto Glass/Glow */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-brandDark/20 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="relative z-10">
                <p className="text-slate-300 font-medium text-sm">Balance Total</p>
                <h2 className="text-4xl font-extrabold text-white mt-1 mb-8">
                    ${totalBalance.toLocaleString('es-CO')}
                </h2>

                <div className="flex justify-between border-t border-white/10 pt-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-brand">
                            <TrendingUp size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 font-medium">Ingresos</p>
                            <p className="text-sm font-bold text-white">+${income.toLocaleString('es-CO')}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-expense">
                            <TrendingDown size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 font-medium">Gastos</p>
                            <p className="text-sm font-bold text-white">-${expense.toLocaleString('es-CO')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};