import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, User,
    CircleHelp, LogOut, ChevronRight, Globe
} from 'lucide-react';
import { useAuthStore } from '../context/useAuthStore';
import { BottomNav } from '../components/BottomNav';
import { TransactionModal } from '../components/TransactionModal';

// CORRECCIÓN PRINCIPAL: El componente interno se declara AFUERA para que React lo compile una sola vez
const MenuItem = ({ icon: Icon, title, subtitle, onClick, isDanger }) => (
    <button
        onClick={onClick}
        className="w-full flex items-center justify-between p-4 bg-surface shadow-soft rounded-2xl mb-4 transition-all active:shadow-soft-inset"
    >
        <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-soft-inset ${isDanger ? 'bg-expense/10 text-expense' : 'bg-background text-brand'}`}>
                <Icon size={24} />
            </div>
            <div className="text-left">
                <h3 className={`font-bold ${isDanger ? 'text-expense' : 'text-navy'}`}>{title}</h3>
                {subtitle && <p className="text-xs text-textMuted font-medium mt-0.5">{subtitle}</p>}
            </div>
        </div>
        <ChevronRight size={20} className={isDanger ? 'text-expense/50' : 'text-textMuted/50'} />
    </button>
);

export const Profile = () => {
    const navigate = useNavigate();

    // Obtenemos el usuario y la función de logout desde nuestro estado global
    // RECUERDA: Si antes tuvimos el detalle del nombre, asegúrate si en tu store se llama 'logout' o 'setLogout'
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout || state.setLogout);
    const { currency, setCurrency } = useAuthStore();

    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

    const handleLogout = () => {
        if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
            logout(); // Limpia el token y el estado
            navigate('/login'); // Redirige al login
        }
    };

    return (
        <div className="min-h-screen bg-background pb-28 pt-8 relative overflow-hidden animate-fade-in">
            {/* Halo Difuminado */}
            <div className="absolute top-0 left-0 w-full h-180 bg-linear-to-b from-brand to-transparent z-0 pointer-events-none"></div>

            <div className="relative z-10 px-6">

                {/* Header */}
                <div className="flex items-center justify-between mb-8 animate-slide-up">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="w-10 h-10 bg-surface shadow-soft rounded-full flex items-center justify-center text-navy active:shadow-soft-inset transition-shadow"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-xl font-extrabold text-navy">Mi Perfil</h1>
                    </div>
                </div>

                {/* Tarjeta Principal del Usuario */}
                <div className="bg-surface/80 backdrop-blur-glass border border-white/50 shadow-glass rounded-3xl p-6 mb-8 text-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <div className="w-24 h-24 bg-brand text-white text-4xl font-extrabold rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_10px_25px_rgba(0,208,156,0.4)] border-4 border-white">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <h2 className="text-2xl font-extrabold text-navy">{user?.name || 'Usuario FinanceSync'}</h2>
                    <p className="text-sm font-medium text-textMuted mt-1">{user?.email || 'usuario@correo.com'}</p>

                    <div className="mt-6 inline-block bg-brand/10 text-brand px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                        Cuenta Activa
                    </div>
                </div>

                {/* Menú de Opciones */}
                <div className="animate-slide-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
                    <h3 className="text-lg font-extrabold text-navy mb-4 pl-2">Ajustes Generales</h3>

                    {/* 🟢 NUEVO: Selector de Moneda Integrado */}
                    <div className="bg-surface shadow-soft rounded-2xl p-4 mb-4 flex items-center justify-between border border-white/50">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-soft-inset bg-background text-brand">
                                <Globe size={24} />
                            </div>
                            <div className="text-left">
                                <h3 className="font-bold text-navy">Moneda Principal</h3>
                                <p className="text-xs text-textMuted mt-0.5">Aplica para toda la app</p>
                            </div>
                        </div>
                        <select
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            className="bg-background text-navy font-bold py-2 px-3 rounded-xl outline-none focus:ring-2 focus:ring-brand/60 appearance-none text-center cursor-pointer shadow-soft-inset"
                        >
                            <option value="COP">COP ($)</option>
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                        </select>
                    </div>

                    <MenuItem
                        icon={User}
                        title="Datos Personales"
                        subtitle="Actualiza tu nombre o correo"
                        onClick={() => navigate('/profile/personal-data')}
                    />

                    <MenuItem
                        icon={CircleHelp}
                        title="Ayuda y Soporte"
                        subtitle="Preguntas frecuentes y contacto"
                        onClick={() => navigate('/profile/support')}
                    />

                    <div className="mt-8">
                        <MenuItem
                            icon={LogOut}
                            title="Cerrar Sesión"
                            isDanger={true}
                            onClick={handleLogout}
                        />
                    </div>
                </div>

                {/* Pie de página con versión */}
                <div className="mt-12 mb-6 text-center animate-slide-up" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
                    <p className="text-xs font-bold text-textMuted">FinanceSync v1.0.0</p>
                    <p className="text-[10px] font-medium text-textMuted/60 mt-1">Hecho con ♥ por Yerson Rodriguez - para tu libertad financiera</p>
                </div>

            </div>

            {/* Bottom Nav y Modal integrados para no perder la navegación */}
            <BottomNav onOpenModal={() => setIsTransactionModalOpen(true)} />
            <TransactionModal isOpen={isTransactionModalOpen} onClose={() => setIsTransactionModalOpen(false)} />
        </div>
    );
};
