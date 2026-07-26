import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getLoans } from '../services/loanService';
import { LoanCard } from '../components/LoanCard';
import { BottomNav } from '../components/BottomNav';
import { TransactionModal } from '../components/TransactionModal';
import { LoanModal } from '../components/LoanModal';

export const Loans = () => {
    const navigate = useNavigate();

    // Modal Principal FAB
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

    // UNIFICACIÓN DEL MODAL DE PRÉSTAMOS
    const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('CREATE');
    const [selectedLoan, setSelectedLoan] = useState(null);

    const { data: loansData, isLoading } = useQuery({
        queryKey: ['loans'],
        queryFn: getLoans
    });

    const loansList = loansData?.data || [];

    // Calcular Totales
    const totalOwedToMe = loansList
        .filter(l => (l.type || 'LENT') === 'LENT')
        .reduce((acc, l) => acc + Math.max(0, parseFloat(l.total_amount || 0) - parseFloat(l.amount_paid || 0)), 0);

    const totalIOwe = loansList
        .filter(l => l.type === 'BORROWED')
        .reduce((acc, l) => acc + Math.max(0, parseFloat(l.total_amount || 0) - parseFloat(l.amount_paid || 0)), 0);

    // FUNCIONES DE CONTROL DEL MODAL
    const handleCreateNew = () => {
        setModalMode('CREATE');
        setSelectedLoan(null);
        setIsLoanModalOpen(true);
    };

    const handleEdit = (loanData) => {
        setModalMode('EDIT');
        setSelectedLoan(loanData);
        setIsLoanModalOpen(true);
    };

    const handlePay = (id, name, isLent) => {
        setModalMode('PAY');
        setSelectedLoan({ id, name, isLent });
        setIsLoanModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsLoanModalOpen(false);
        setTimeout(() => setSelectedLoan(null), 300);
    };

    return (
        <div className="min-h-screen bg-background pb-28 pt-8 relative overflow-hidden animate-fade-in">
            <div className="absolute top-0 left-0 w-full h-180 bg-linear-to-b from-brand to-transparent z-0 pointer-events-none"></div>

            <div className="relative z-10 px-6">

                {/* Header */}
                <div className="flex items-center justify-between mb-8 animate-slide-up">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/dashboard')} className="w-10 h-10 bg-surface shadow-soft rounded-full flex items-center justify-center text-navy active:shadow-soft-inset transition-shadow">
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-xl font-extrabold text-navy">Préstamos</h1>
                    </div>
                    <button onClick={handleCreateNew} className="flex items-center gap-2 bg-navy text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-soft active:scale-95 transition-transform">
                        <Plus size={18} strokeWidth={3} />
                        Nuevo
                    </button>
                </div>

                {/* Tarjetas de Resumen Duales */}
                <div className="grid grid-cols-2 gap-4 mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <div className="bg-surface backdrop-blur-glass border border-white/50 p-4 rounded-3xl shadow-soft">
                        <p className="text-brand font-bold text-xs uppercase mb-1">Te deben</p>
                        <h2 className="text-xl font-extrabold text-navy">${totalOwedToMe.toLocaleString('es-CO')}</h2>
                    </div>
                    <div className="bg-surface backdrop-blur-glass border border-white/50 p-4 rounded-3xl shadow-soft">
                        <p className="text-expense font-bold text-xs uppercase mb-1">Tú debes</p>
                        <h2 className="text-xl font-extrabold text-navy">${totalIOwe.toLocaleString('es-CO')}</h2>
                    </div>
                </div>

                {/* Lista de Préstamos */}
                <div className="animate-slide-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
                    <h3 className="text-lg font-extrabold text-navy mb-4">Gestión Activa</h3>

                    {isLoading && <p className="text-center text-textMuted">Cargando préstamos...</p>}

                    {!isLoading && loansList.length === 0 && (
                        <div className="text-center mt-8 bg-surface p-8 shadow-soft rounded-3xl border border-white/50">
                            <p className="text-navy font-extrabold text-lg">Cuentas claras</p>
                            <p className="text-textMuted text-sm mt-2">No tienes deudas ni prestamos activos.</p>
                        </div>
                    )}

                    {loansList.map((loan) => (
                        <LoanCard
                            key={loan.id}
                            id={loan.id}
                            personName={loan.debtor_name}
                            totalAmount={loan.total_amount}
                            paidAmount={loan.amount_paid}
                            type={loan.type || 'LENT'}
                            fullData={loan}
                            onEdit={handleEdit}
                            onPay={handlePay}
                        />
                    ))}
                </div>
            </div>

            <BottomNav onOpenModal={() => setIsTransactionModalOpen(true)} />
            <TransactionModal isOpen={isTransactionModalOpen} onClose={() => setIsTransactionModalOpen(false)} />

            {/* Modal Inteligente Único */}
            <LoanModal
                isOpen={isLoanModalOpen}
                onClose={handleCloseModal}
                mode={modalMode}
                loanData={selectedLoan}
            />
        </div>
    );
};