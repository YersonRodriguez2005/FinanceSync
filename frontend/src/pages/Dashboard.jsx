import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import { useAuthStore } from '../context/useAuthStore';
import { getDashboardSummary } from '../services/dashboardService';
import { BalanceCard } from '../components/BalanceCard';
import { BottomNav } from '../components/BottomNav';
import { TransactionItem } from '../components/TransactionItem';
import { TransactionModal } from '../components/TransactionModal';
import { getTransactions } from '../services/transactionService';

export const Dashboard = () => {
    const user = useAuthStore((state) => state.user);
    const navigate = useNavigate();

    // 🟢 CORRECCIÓN 1: Unificamos el nombre del estado para que coincida en todo el componente
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
    const [transactionToEdit, setTransactionToEdit] = useState(null);

    // 1. Petición para el Resumen (La tarjeta superior)
    const { data: summaryData, isLoading: isLoadingSummary, isError: isErrorSummary } = useQuery({
        queryKey: ['dashboardSummary'],
        queryFn: getDashboardSummary
    });

    // 2. Petición para el Historial Real
    const { data: txData } = useQuery({
        queryKey: ['transactions'],
        queryFn: () => getTransactions()
    });

    if (isLoadingSummary) return <div className="min-h-screen flex items-center justify-center text-navy font-bold animate-pulse">Sincronizando...</div>;
    if (isErrorSummary) return <div className="min-h-screen flex items-center justify-center text-expense font-bold">Error de conexión.</div>;

    const summary = summaryData?.summary || { total_income: 0, total_expense: 0, balance: 0 };

    // 3. Extraemos las transacciones reales y mostramos solo las últimas 5
    const recentTransactions = txData?.data?.slice(0, 5) || [];

    // 🟢 FUNCIÓN PARA EDITAR DESDE EL DASHBOARD
    const handleEditTransaction = (txData) => {
        setTransactionToEdit(txData);
        setIsTransactionModalOpen(true);
    };

    // 🟢 FUNCIÓN PARA CERRAR Y LIMPIAR
    const handleCloseModal = () => {
        setIsTransactionModalOpen(false);
        setTimeout(() => setTransactionToEdit(null), 300);
    };

    return (
        <div className="min-h-screen bg-background pb-28 pt-8 relative overflow-hidden animate-fade-in">
            <div className="absolute top-0 left-0 w-full h-180 bg-linear-to-b from-brand to-transparent z-0 pointer-events-none"></div>

            <div className="relative z-10 px-6">
                {/* Header Móvil */}
                <header className="flex justify-between items-center mb-8 animate-slide-up">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-surface shadow-soft rounded-full flex items-center justify-center font-extrabold text-xl text-brand border border-white">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                            <p className="text-textMuted text-xs font-semibold uppercase tracking-wider">Hola,</p>
                            <h1 className="text-xl font-extrabold text-navy leading-tight">{user?.name || 'Usuario'}</h1>
                        </div>
                    </div>
                    {/* Contenedor de botones de acción en el header */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/profile')}
                            title="Ir a mi perfil"
                            className="w-10 h-10 bg-surface shadow-soft rounded-full flex items-center justify-center text-navy active:shadow-soft-inset transition-shadow"
                        >
                            <User size={20} />
                        </button>
                    </div>
                </header>

                {/* Tarjeta Hero */}
                <div className="animate-slide-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
                    <BalanceCard
                        totalBalance={summary.balance}
                        income={summary.total_income}
                        expense={summary.total_expense}
                    />
                </div>

                {/* Movimientos Recientes */}
                <div className="mt-8 animate-slide-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
                    <div className="flex justify-between items-end mb-5">
                        <h3 className="text-lg font-extrabold text-navy">Movimientos Recientes</h3>
                        <button onClick={() => navigate('/history')} className="text-brand text-sm font-bold hover:text-brand-dark transition-colors">
                            Ver todos
                        </button>
                    </div>

                    <div className="flex flex-col">
                        {recentTransactions?.map((tx) => (
                            <TransactionItem
                                key={tx.id}
                                {...tx}
                                fullData={tx}
                                onEdit={handleEditTransaction}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Navigation (Glassmorphism) & FAB */}
            {/* 🟢 CORRECCIÓN 2: Nos aseguramos de limpiar el estado al tocar el botón de "Nuevo" */}
            <BottomNav onOpenModal={() => {
                setTransactionToEdit(null);
                setIsTransactionModalOpen(true);
            }} />

            {/* Modal Inteligente de Transacciones */}
            <TransactionModal
                isOpen={isTransactionModalOpen}
                onClose={handleCloseModal}
                editData={transactionToEdit}
            />
        </div>
    );
};