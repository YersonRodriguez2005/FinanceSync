import { useNavigate, useLocation } from 'react-router-dom';
import { Home, PieChart, Plus, PiggyBank, HandCoins } from 'lucide-react';

export const BottomNav = ({ onOpenModal }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const isActive = (path) => location.pathname === path;

    return (
        <div className="fixed bottom-0 left-0 w-full px-6 pb-6 z-40">
            <div className="bg-white/70 backdrop-blur-glass border border-white/40 shadow-glass rounded-3xl flex justify-between items-center px-6 py-4 relative">
                
                {/* 1. Dashboard */}
                <button onClick={() => navigate('/dashboard')} className={`flex flex-col items-center gap-1 transition-colors ${isActive('/dashboard') ? 'text-brand' : 'text-textMuted hover:text-navy'}`}>
                    <Home size={24} strokeWidth={isActive('/dashboard') ? 2.5 : 2} />
                </button>
                
                {/* 2. Ahorros */}
                <button onClick={() => navigate('/savings')} className={`flex flex-col items-center gap-1 transition-colors ${isActive('/savings') ? 'text-brand' : 'text-textMuted hover:text-navy'}`}>
                    <PiggyBank size={24} strokeWidth={isActive('/savings') ? 2.5 : 2} />
                </button>

                {/* 3. FAB (Botón Central Agregar Movimiento) */}
                <div className="relative -top-8">
                    <button onClick={onOpenModal} className="w-16 h-16 bg-brand hover:bg-brand-dark text-white rounded-full flex items-center justify-center shadow-[0_10px_25px_rgba(0,208,156,0.4)] transition-transform active:scale-95">
                        <Plus size={32} strokeWidth={3} />
                    </button>
                </div>

                {/* 4. Préstamos (NUEVO) */}
                <button onClick={() => navigate('/loans')} className={`flex flex-col items-center gap-1 transition-colors ${isActive('/loans') ? 'text-brand' : 'text-textMuted hover:text-navy'}`}>
                    <HandCoins size={24} strokeWidth={isActive('/loans') ? 2.5 : 2} />
                </button>

                {/* 5. Reportes / Analítica */}
                <button onClick={() => navigate('/reports')} className={`flex flex-col items-center gap-1 transition-colors ${isActive('/reports') ? 'text-brand' : 'text-textMuted hover:text-navy'}`}>
                    <PieChart size={24} strokeWidth={isActive('/reports') ? 2.5 : 2} />
                </button>
            </div>
        </div>
    );
};