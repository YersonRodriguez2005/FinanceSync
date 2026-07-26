import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, ArrowLeft } from 'lucide-react';
import { getSavings, deleteSavingGoal } from '../services/savingService';
import { SavingCard } from '../components/SavingCard';
import { BottomNav } from '../components/BottomNav';
import { TransactionModal } from '../components/TransactionModal';
import { SavingModal } from '../components/SavingModal';

export const Savings = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Modal Global (FAB)
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

    // UNIFICACIÓN DEL MODAL DE AHORROS
    const [isSavingModalOpen, setIsSavingModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('CREATE');
    const [selectedGoal, setSelectedGoal] = useState(null);

    const { data: savingsData, isLoading } = useQuery({
        queryKey: ['savings'],
        queryFn: getSavings
    });

    const savingsList = savingsData?.data || [];
    const totalSaved = savingsList.reduce((acc, goal) => acc + parseFloat(goal.current_amount || 0), 0);

    // Mutación para eliminar meta (requerida por el Card)
    const deleteMutation = useMutation({
        mutationFn: deleteSavingGoal,
        onSuccess: () => queryClient.invalidateQueries(['savings'])
    });

    const handleDelete = (id) => {
        if (window.confirm('¿Seguro que deseas eliminar esta meta?')) {
            deleteMutation.mutate(id);
        }
    };

    // FUNCIONES DE CONTROL DEL MODAL MÚLTIPLE
    const handleCreateNewGoal = () => {
        setModalMode('CREATE');
        setSelectedGoal(null);
        setIsSavingModalOpen(true);
    };

    const handleEdit = (goalData) => {
        setModalMode('EDIT');
        setSelectedGoal(goalData);
        setIsSavingModalOpen(true);
    };

    const handleAddFunds = (goalId, goalName) => {
        setModalMode('ADD_FUNDS');
        setSelectedGoal({ id: goalId, name: goalName });
        setIsSavingModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsSavingModalOpen(false);
        setTimeout(() => setSelectedGoal(null), 300);
    };

    return (
        <div className="min-h-screen bg-background pb-28 pt-8 relative overflow-hidden animate-fade-in">
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
                        <h1 className="text-xl font-extrabold text-navy">Ahorros</h1>
                    </div>

                    <button
                        onClick={handleCreateNewGoal}
                        className="flex items-center gap-2 bg-navy text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-soft active:scale-95 transition-transform"
                    >
                        <Plus size={18} strokeWidth={3} />
                        Nueva Meta
                    </button>
                </div>

                {/* Tarjeta Hero */}
                <div className="bg-navy/95 backdrop-blur-glass border border-white/10 p-6 rounded-3xl relative overflow-hidden shadow-glass mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand/20 rounded-full blur-3xl pointer-events-none"></div>
                    <p className="text-slate-300 font-medium text-sm">Ahorro Total Acumulado</p>
                    <h2 className="text-4xl font-extrabold text-white mt-1">
                        ${totalSaved.toLocaleString('es-CO')}
                    </h2>
                </div>

                {/* Lista de Metas */}
                <div className="animate-slide-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
                    <h3 className="text-lg font-extrabold text-navy mb-4">Tus Metas</h3>

                    {!isLoading && savingsList.length === 0 && (
                        <div className="text-center mt-8 bg-surface p-8 shadow-soft rounded-3xl border border-white/50">
                            <p className="text-navy font-extrabold text-lg">No tienes metas aún</p>
                            <p className="text-textMuted text-sm mt-2">Crea tu primera meta y empieza a construir tu futuro.</p>
                        </div>
                    )}

                    {savingsList.map((goal) => (
                        <SavingCard
                            key={goal.id}
                            id={goal.id}
                            name={goal.name}
                            targetAmount={goal.target_amount}
                            currentAmount={goal.current_amount}
                            fullData={goal}
                            onEdit={handleEdit}
                            onAddFunds={handleAddFunds}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            </div>

            <BottomNav onOpenModal={() => setIsTransactionModalOpen(true)} />
            <TransactionModal isOpen={isTransactionModalOpen} onClose={() => setIsTransactionModalOpen(false)} />

            {/* Modal Inteligente Único */}
            <SavingModal
                isOpen={isSavingModalOpen}
                onClose={handleCloseModal}
                mode={modalMode}
                goalData={selectedGoal}
            />
        </div>
    );
};