import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Target, PlusCircle, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import { createSavingGoal, addFundsToSaving, updateSavingGoal } from '../services/savingService';
import { Input } from './Input';
import { Button } from './Button';
import { CurrencyInput } from './CurrencyInput';

export const SavingModal = ({ isOpen, onClose, mode, goalData }) => {
    const queryClient = useQueryClient();
    const [name, setName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [amountToAdd, setAmountToAdd] = useState('');

    const isCreateMode = mode === 'CREATE';
    const isEditMode = mode === 'EDIT';
    const isAddFundsMode = mode === 'ADD_FUNDS';

    // Rellenamos o limpiamos según el modo
    useEffect(() => {
        if (isOpen) {
            if (isEditMode && goalData) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setName(goalData.name);
                setTargetAmount(goalData.target_amount.toString());
                setAmountToAdd('');
            } else {
                setName('');
                setTargetAmount('');
                setAmountToAdd('');
            }
        }
    }, [isOpen, mode, goalData, isEditMode]);

    // Llama a la API correspondiente según el estado
    const mutation = useMutation({
        mutationFn: (data) => {
            if (isEditMode) return updateSavingGoal(goalData.id, data);
            if (isAddFundsMode) return addFundsToSaving(goalData.id, data.amount);
            return createSavingGoal(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['savings']);
            queryClient.invalidateQueries(['dashboard']);
            toast.success(isEditMode ? 'Ahorro actualizado' : 'Ahorro registrado');
            onClose();
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Ocurrió un error inesperado');
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // Si estamos creando o editando, validamos nombre y meta
        if (isCreateMode || isEditMode) {
            if (!name || !targetAmount) return;
            mutation.mutate({ name, target_amount: parseFloat(targetAmount) });
        } 
        // Si estamos abonando dinero, validamos el monto
        else if (isAddFundsMode) {
            if (!amountToAdd) return;
            mutation.mutate({ amount: parseFloat(amountToAdd) });
        }
    };

    // Configuración visual según el modo
    const modalTitle = isEditMode ? 'Editar Meta' : isCreateMode ? 'Nueva Meta' : `Abonar a ${goalData?.name}`;
    const ModalIcon = isEditMode ? Pencil : isCreateMode ? Target : PlusCircle;

    return (
        <div className={`fixed inset-0 z-50 flex items-end justify-center transition-all duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
            <div className="absolute inset-0 bg-navy/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

            <div className={`w-full max-w-md bg-surface rounded-t-3xl p-6 relative z-10 transform transition-transform duration-300 ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>

                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand/10 text-brand rounded-full flex items-center justify-center">
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
                    {/* Renderizado condicional del formulario */}
                    {isCreateMode || isEditMode ? (
                        <>
                            <Input
                                label="¿Para qué estás ahorrando?"
                                type="text"
                                placeholder="Ej. Viaje a Cancún"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                            <CurrencyInput
                                label="¿Cuánto necesitas reunir?"
                                placeholder="Ej. 2.000.000"
                                value={targetAmount}
                                onChange={(e) => setTargetAmount(e.target.value)}
                                required
                            />
                        </>
                    ) : (
                        <CurrencyInput
                            label="¿Cuánto dinero quieres abonar?"
                            placeholder="Ej. 150.000"
                            value={amountToAdd}
                            onChange={(e) => setAmountToAdd(e.target.value)}
                            required
                        />
                    )}

                    <div className="mt-6">
                        <Button type="submit" isLoading={mutation.isPending}>
                            {isEditMode ? 'Guardar Cambios' : isCreateMode ? 'Crear Meta' : 'Realizar Abono'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};