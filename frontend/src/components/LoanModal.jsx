import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, HandCoins, PlusCircle, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import { createLoan, payLoan, updateLoan } from '../services/loanService';
import { Input } from './Input';
import { Button } from './Button';
import { CurrencyInput } from './CurrencyInput';

export const LoanModal = ({ isOpen, onClose, mode, loanData }) => {
    const queryClient = useQueryClient();

    const [personName, setPersonName] = useState('');
    const [totalAmount, setTotalAmount] = useState('');
    const [type, setType] = useState('LENT');
    const [amountToPay, setAmountToPay] = useState('');

    const isCreateMode = mode === 'CREATE';
    const isEditMode = mode === 'EDIT';
    const isPayMode = mode === 'PAY';

    // Rellenamos campos si estamos en modo edición
    useEffect(() => {
        if (isOpen) {
            if (isEditMode && loanData) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setPersonName(loanData.debtor_name);
                setTotalAmount(loanData.total_amount.toString());
                setType(loanData.type || 'LENT');
                setAmountToPay('');
            } else {
                setPersonName(''); 
                setTotalAmount(''); 
                setAmountToPay(''); 
                setType('LENT');
            }
        }
    }, [isOpen, mode, loanData, isEditMode]);

    const mutation = useMutation({
        mutationFn: (data) => {
            if (isEditMode) return updateLoan(loanData.id, data);
            if (isPayMode) return payLoan(loanData.id, data.amount);
            return createLoan(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['loans']);
            queryClient.invalidateQueries(['dashboard']);
            toast.success(isEditMode ? 'Prestamo actualizado' : 'Prestamo registrado');
            onClose();
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Ocurrió un error inesperado');
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isCreateMode || isEditMode) {
            if (!personName || !totalAmount) return;
            mutation.mutate({ person_name: personName, total_amount: parseFloat(totalAmount), type });
        } else if (isPayMode) {
            if (!amountToPay) return;
            mutation.mutate({ amount: parseFloat(amountToPay) });
        }
    };

    // Configuración visual
    const modalTitle = isEditMode ? 'Editar Préstamo' : isCreateMode ? 'Nuevo Préstamo' : `Abonar a ${loanData?.name}`;
    const ModalIcon = isEditMode ? Pencil : isCreateMode ? HandCoins : PlusCircle;

    return (
        <div className={`fixed inset-0 z-50 flex items-end justify-center transition-all duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
            <div className="absolute inset-0 bg-navy/40 backdrop-blur-sm" onClick={onClose}></div>

            <div className={`w-full max-w-md bg-surface rounded-t-3xl p-6 relative z-10 transform transition-transform duration-300 ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>

                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-background text-navy rounded-full flex items-center justify-center shadow-soft-inset">
                            <ModalIcon size={20} />
                        </div>
                        <h2 className="text-xl font-extrabold text-navy">
                            {modalTitle}
                        </h2>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-background rounded-full text-textMuted active:scale-95 transition-transform">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-2 pb-6">
                    {/* Renderizado Condicional del Formulario */}
                    {isCreateMode || isEditMode ? (
                        <>
                            {/* Switch Tipo de Préstamo */}
                            <div className="flex p-1 bg-background rounded-xl mb-4 shadow-soft-inset">
                                <button type="button" onClick={() => setType('LENT')}
                                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${type === 'LENT' ? 'bg-white text-brand shadow-sm' : 'text-textMuted hover:text-navy'}`}>
                                    Me deben dinero
                                </button>
                                <button type="button" onClick={() => setType('BORROWED')}
                                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${type === 'BORROWED' ? 'bg-white text-expense shadow-sm' : 'text-textMuted hover:text-navy'}`}>
                                    Yo debo dinero
                                </button>
                            </div>

                            <Input 
                                label={type === 'LENT' ? '¿Quién te debe?' : '¿A quién le debes?'} 
                                type="text" 
                                placeholder="Ej. Carlos Pérez" 
                                value={personName} 
                                onChange={(e) => setPersonName(e.target.value)} 
                                required 
                            />
                            <CurrencyInput
                                label="Monto Total"
                                placeholder="Ej. 500.000"
                                value={totalAmount}
                                onChange={(e) => setTotalAmount(e.target.value)}
                                required
                            />
                        </>
                    ) : (
                        <CurrencyInput
                            label={loanData?.isLent ? '¿Cuánto te pagó?' : '¿Cuánto vas a abonar?'}
                            placeholder="Ej. 50.000"
                            value={amountToPay}
                            onChange={(e) => setAmountToPay(e.target.value)}
                            required
                        />
                    )}

                    <div className="mt-6">
                        <Button type="submit" isLoading={mutation.isPending}>
                            {isEditMode ? 'Guardar Cambios' : isCreateMode ? 'Registrar' : 'Confirmar Abono'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};