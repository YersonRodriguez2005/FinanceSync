import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { getCategories } from '../services/categoryService';
import { createTransaction, updateTransaction } from '../services/transactionService';
import { Input } from './Input';
import { Button } from './Button';
import { CurrencyInput } from './CurrencyInput';

export const TransactionModal = ({ isOpen, onClose, editData }) => {
    const queryClient = useQueryClient();

    // Variable para saber si estamos editando
    const isEditMode = !!editData;

    // Estado del formulario
    const [type, setType] = useState('EXPENSE');
    const [amount, setAmount] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [description, setDescription] = useState('');

    const today = new Date().toISOString().split('T')[0];
    const [date, setDate] = useState(today);

    // Rellena los datos automáticamente si estamos en modo edición
    useEffect(() => {
        if (isOpen) {
            if (isEditMode && editData) {
                // Detectar si es ingreso o gasto
                const txType = editData.category_type || editData.type || 'EXPENSE';
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setType(txType);
                
                // Llenar el resto de los campos
                setAmount(editData.amount.toString());
                setCategoryId(editData.category_id);
                setDescription(editData.description || '');
                
                // Formatear la fecha para que el input type="date" la reconozca
                const formattedDate = new Date(editData.date).toISOString().split('T')[0];
                setDate(formattedDate);
            } else {
                // Si es modo crear, limpiamos los campos
                setType('EXPENSE');
                setAmount('');
                setCategoryId('');
                setDescription('');
                setDate(today);
            }
        }
    }, [isOpen, editData, isEditMode, today]);

    // Traemos las categorías de la base de datos
    const { data: categoriesData } = useQuery({
        queryKey: ['categories'],
        queryFn: getCategories,
        enabled: isOpen,
    });

    // Filtramos las categorías según la pestaña seleccionada (Ingreso/Gasto)
    const filteredCategories = categoriesData?.data?.filter(cat => cat.type === type) || [];

    // MUTACIÓN INTELIGENTE: Si isEditMode es true, actualiza. Si no, crea.
    const mutation = useMutation({
        mutationFn: (data) => isEditMode ? updateTransaction(editData.id, data) : createTransaction(data),
        onSuccess: () => {
            // Actualizamos todo en la app para reflejar los cambios
            queryClient.invalidateQueries(['dashboardSummary']);
            queryClient.invalidateQueries(['transactions']);
            queryClient.invalidateQueries(['dashboard']);

            toast.success(isEditMode ? 'Movimiento actualizado' : 'Movimiento registrado');
            onClose();
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Ocurrió un error inesperado');
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!amount || !categoryId || !date) return;

        mutation.mutate({
            amount: parseFloat(amount),
            category_id: categoryId,
            date,
            description,
            is_recurring: false
        });
    };

    return (
        <div
            className={`fixed inset-0 z-50 flex items-end justify-center transition-all duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        >
            <div
                className="absolute inset-0 bg-navy/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            <div
                className={`w-full max-w-md bg-surface rounded-t-3xl p-6 relative z-10 transform transition-transform duration-300 ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
            >
                <div className="flex justify-between items-center mb-6">
                    {/* Título dinámico */}
                    <h2 className="text-xl font-extrabold text-navy">
                        {isEditMode ? 'Editar Movimiento' : 'Nuevo Movimiento'}
                    </h2>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-background rounded-full text-textMuted active:scale-95 transition-transform">
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs Selector */}
                <div className="flex p-1 bg-background rounded-xl mb-6 shadow-soft-inset">
                    <button
                        type="button"
                        onClick={() => { setType('EXPENSE'); setCategoryId(''); }}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${type === 'EXPENSE' ? 'bg-white text-expense shadow-sm' : 'text-textMuted hover:text-navy'}`}
                    >
                        Gasto
                    </button>
                    <button
                        type="button"
                        onClick={() => { setType('INCOME'); setCategoryId(''); }}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${type === 'INCOME' ? 'bg-white text-brand shadow-sm' : 'text-textMuted hover:text-navy'}`}
                    >
                        Ingreso
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-2 pb-6">
                    <CurrencyInput
                        label="Monto"
                        placeholder="Ej. 150.000"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                    />

                    <div className="flex flex-col mb-4">
                        <label className="mb-2 text-sm font-bold text-navy">Categoría</label>
                        <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            required
                            className="px-4 py-3 bg-background text-navy rounded-xl outline-none focus:ring-2 focus:ring-brand/60 shadow-soft-inset transition-all appearance-none"
                        >
                            <option value="" disabled>Selecciona una categoría</option>
                            {filteredCategories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Fecha"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                        />
                        <Input
                            label="Descripción"
                            type="text"
                            placeholder="Opcional"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="mt-4">
                        <Button type="submit" isLoading={mutation.isPending}>
                            {/* Botón dinámico */}
                            {isEditMode ? 'Guardar Cambios' : 'Guardar Movimiento'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};