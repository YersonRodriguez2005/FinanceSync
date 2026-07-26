import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, ArrowLeft, RefreshCw } from 'lucide-react';
import { getTransactions } from '../services/transactionService';
import { TransactionItem } from '../components/TransactionItem';
import { TransactionModal } from '../components/TransactionModal';

export const History = () => {
    const navigate = useNavigate();
    const [currentDate, setCurrentDate] = useState(new Date());
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    // Estados del Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [transactionToEdit, setTransactionToEdit] = useState(null);

    // ESTADOS DE PAGINACIÓN
    const [page, setPage] = useState(1);
    const [allTransactions, setAllTransactions] = useState([]);

    // CONSULTA REACT QUERY ACTUALIZADA
    const { data: txResponse, isLoading, isError, isFetching } = useQuery({
        queryKey: ['transactions', currentMonth, currentYear, page],
        queryFn: () => getTransactions(currentMonth, currentYear, page, 20),
        keepPreviousData: true
    });

    // ACUMULAR TRANSACCIONES
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setAllTransactions([]);
        setPage(1);
    }, [currentMonth, currentYear]);

    useEffect(() => {
        if (txResponse?.data) {
            if (page === 1) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setAllTransactions(txResponse.data);
            } else {
                // Filtramos duplicados por seguridad y unimos
                setAllTransactions(prev => {
                    const newItems = txResponse.data.filter(newItem => !prev.some(p => p.id === newItem.id));
                    return [...prev, ...newItems];
                });
            }
        }
    }, [txResponse, page]);

    const hasMore = txResponse?.pagination?.hasMore;

    const handlePrevMonth = () => setCurrentDate(new Date(currentYear, currentDate.getMonth() - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(currentYear, currentDate.getMonth() + 1, 1));
    const monthName = currentDate.toLocaleString('es-CO', { month: 'long', year: 'numeric' });

    // Función que se activa al tocar el lápiz en la tarjeta
    const handleEdit = (transactionData) => {
        setTransactionToEdit(transactionData);
        setIsModalOpen(true);
    };

    // Al cerrar el modal, limpiamos el estado
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setTransactionToEdit(null);
    };

    return (
        <div className="min-h-screen bg-background pb-10 pt-8 relative overflow-hidden animate-fade-in">
            <div className="absolute top-0 left-0 w-full h-180 bg-linear-to-b from-brand to-transparent z-0 pointer-events-none"></div>

            <div className="relative z-10 px-6">

                {/* Header */}
                <div className="flex items-center justify-between mb-8 animate-slide-up">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-10 h-10 bg-surface shadow-soft rounded-full flex items-center justify-center text-navy active:shadow-soft-inset transition-shadow"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-extrabold text-navy">Historial</h1>
                    <div className="w-10"></div>
                </div>

                {/* Selector de Meses Premium */}
                <div className="mb-8 animate-slide-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
                    <div className="bg-surface shadow-soft rounded-2xl flex items-center justify-between p-2 border border-white/50">
                        <button onClick={handlePrevMonth} className="p-3 text-textMuted hover:text-brand transition-colors rounded-xl active:shadow-soft-inset">
                            <ChevronLeft size={24} />
                        </button>
                        <h2 className="text-navy font-bold uppercase tracking-wider text-sm">
                            {monthName}
                        </h2>
                        <button onClick={handleNextMonth} className="p-3 text-textMuted hover:text-brand transition-colors rounded-xl active:shadow-soft-inset">
                            <ChevronRight size={24} />
                        </button>
                    </div>
                </div>

                {/* Lista de Transacciones */}
                <div className="flex flex-col animate-slide-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
                    {isLoading && page === 1 && <p className="text-center text-textMuted font-medium animate-pulse mt-10">Cargando movimientos...</p>}

                    {isError && <p className="text-center text-expense font-medium mt-10">Error al cargar el historial.</p>}

                    {!isLoading && !isError && allTransactions.length === 0 && (
                        <div className="text-center mt-16 bg-surface p-8 shadow-soft rounded-3xl border border-white/50">
                            <div className="w-20 h-20 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-4 text-brand">
                                <span className="text-3xl">📭</span>
                            </div>
                            <p className="text-navy font-extrabold text-xl">Sin movimientos</p>
                            <p className="text-textMuted text-sm mt-2">No registraste actividad en este mes.</p>
                        </div>
                    )}

                    {!isError && allTransactions.map((tx) => (
                        <TransactionItem
                            key={tx.id}
                            {...tx}
                            fullData={tx}
                            onEdit={handleEdit}
                        />
                    ))}

                    {/* BOTÓN CARGAR MÁS */}
                    {hasMore && (
                        <div className="flex justify-center mt-6 mb-10">
                            <button
                                onClick={() => setPage(old => old + 1)}
                                disabled={isFetching}
                                className="flex items-center gap-2 bg-surface border border-white/50 shadow-soft text-navy font-bold py-3 px-6 rounded-xl active:shadow-soft-inset transition-all hover:text-brand"
                            >
                                {isFetching ? <RefreshCw size={20} className="animate-spin" /> : 'Cargar movimientos anteriores'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* RENDERIZAMOS EL MODAL AL FINAL DEL COMPONENTE */}
            <TransactionModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                editData={transactionToEdit}
            />
        </div>
    );
};