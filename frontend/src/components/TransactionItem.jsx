import { ArrowUpRight, ArrowDownRight, Trash2, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteTransaction } from '../services/transactionService';

export const TransactionItem = ({ id, description, amount, type, category_type, date, category_name, fullData, onEdit }) => { 
    const queryClient = useQueryClient();
    
    // Validamos tanto 'type' como 'category_type' según lo que envíe tu SQL
    const transactionType = category_type || type; 
    const isIncome = transactionType === 'INCOME';
    const Icon = isIncome ? ArrowUpRight : ArrowDownRight;

    // Mutación para eliminar sin recargar la página
    const deleteMutation = useMutation({
        mutationFn: () => deleteTransaction(id),
        onSuccess: () => {
            // Recargamos el historial y la tarjeta de balance al borrar
            queryClient.invalidateQueries(['transactions']);
            queryClient.invalidateQueries(['dashboard']);

            toast.success('Registro eliminado', { duration: 3000 });
        },
        onError: () => {
            toast.error('No se pudo eliminar el registro', { duration: 3000 });
        }
    });

    const handleDelete = () => {
    toast((t) => (
        <div className="flex flex-col gap-3 min-w-55">
            <p className="font-bold text-navy text-center text-sm">
                ¿Eliminar <span className="text-expense">{category_name}</span>?
            </p>
            <div className="flex gap-2 mt-1">
                <button 
                    onClick={() => toast.dismiss(t.id)}
                    className="flex-1 py-2 bg-background text-textMuted font-bold rounded-xl text-xs active:scale-95 transition-transform"
                >
                    Cancelar
                </button>
                <button 
                    onClick={() => {
                        deleteMutation.mutate();
                        toast.dismiss(t.id);
                    }}
                    className="flex-1 py-2 bg-expense text-white font-bold rounded-xl text-xs active:scale-95 transition-transform shadow-soft"
                >
                    Eliminar
                </button>
            </div>
        </div>
    ), { 
        duration: Infinity, // No se cierra automáticamente
        id: `delete-tx-${id}` // Evita que se abran varios a la vez
    });
};
    
    return (
        <div className="flex items-center justify-between p-4 mb-3 bg-surface rounded-2xl shadow-sm border border-slate-100 active:shadow-soft-inset transition-all relative group overflow-hidden">
            <div className="flex items-center gap-4 z-10">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-soft ${isIncome ? 'text-brand bg-brand/10' : 'text-expense bg-expense/10'}`}>
                    <Icon size={24} strokeWidth={2.5} />
                </div>
                <div>
                    <p className="font-bold text-navy">{category_name}</p>
                    <p className="text-xs text-textMuted">{description || 'Sin descripción'}</p>
                </div>
            </div>
            
            <div className="text-right z-10 flex items-center gap-3">
                <div>
                    {/* El Bug negativo solucionado */}
                    <p className={`font-extrabold ${isIncome ? 'text-brand' : 'text-navy'}`}>
                        {isIncome ? '+' : '-'}${parseFloat(amount).toLocaleString('es-CO')}
                    </p>
                    <p className="text-xs text-textMuted font-medium">
                        {new Date(date).toLocaleDateString()}
                    </p>
                </div>

                {/* onEdit(fullData) para pasar toda la información al Modal */}
                <button 
                    onClick={() => onEdit(fullData)} 
                    className="text-textMuted hover:text-brand p-2 transition-colors active:scale-95"
                    title="Editar registro"
                >
                    <Pencil size={20} />
                </button>

                {/* Botón de Eliminar (Icono de Basura) */}
                <button 
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending}
                    className="p-2 text-expense/60 hover:text-expense hover:bg-expense/10 rounded-full transition-colors"
                    title="Eliminar registro"
                >
                    <Trash2 size={20} />
                </button>
            </div>
        </div>
    );
};