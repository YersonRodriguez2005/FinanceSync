// Importamos Pencil
import { User, PlusCircle, Trash2, ArrowUpRight, ArrowDownRight, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteLoan } from '../services/loanService';

// Añadimos fullData y onEdit a los props
export const LoanCard = ({ id, personName, totalAmount, paidAmount, type, fullData, onEdit, onPay }) => {
    const queryClient = useQueryClient();
    // Convertimos a números para evitar el "Bug de Coerción"
    const total = parseFloat(totalAmount) || 0;
    const paid = parseFloat(paidAmount) || 0;
    const remainingAmount = Math.max(0, total - paid);
    const rawPercentage = total > 0 ? (paid / total) * 100 : 0;
    const progress = Math.min(rawPercentage, 100);
    const isCompleted = paid >= total;
    // Configuración visual según el tipo de préstamo
    const isLent = type === 'LENT';
    const themeColor = isLent ? 'text-brand' : 'text-expense';
    const bgThemeColor = isLent ? 'bg-brand' : 'bg-expense';
    const TypeIcon = isLent ? ArrowDownRight : ArrowUpRight;

    const deleteMutation = useMutation({
        mutationFn: () => deleteLoan(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['loans'])
            toast.success('Registro eliminado', { duration: 3000 });
        },
        onError: () => {
            toast.error('No se pudo eliminar el registro', { duration: 3000 });
        }
    });

    const handleDelete = () => {
    toast((t) => (
        <div className="flex flex-col gap-3 min-w-55">
            <p className="font-bold text-navy text-center text-sm leading-tight">
                ¿Eliminar deuda de <br/> <span className="text-expense">{personName}</span>?
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
        duration: Infinity, 
        id: `delete-loan-${id}` 
    });
};

    return (
        <div className="bg-surface shadow-soft rounded-3xl p-5 mb-4 border border-white/50 relative overflow-hidden transition-all hover:shadow-glass group">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-soft-inset ${isCompleted ? 'bg-background text-textMuted' : `bg-background ${themeColor}`}`}>
                        <User size={24} />
                        <TypeIcon size={12} className="absolute bottom-2 right-2 opacity-80" />
                    </div>
                    <div>
                        <h3 className="font-extrabold text-navy text-lg">{personName}</h3>
                        <p className={`text-xs font-extrabold uppercase tracking-wider ${isCompleted ? 'text-textMuted' : themeColor}`}>
                            {isCompleted ? 'Liquidado' : (isLent ? 'Te debe' : 'Tú debes')}
                        </p>
                    </div>
                </div>

                {/* Botones de Acción Agrupados */}
                <div className="flex items-center gap-1">

                    {/* Botón Editar */}
                    <button
                        onClick={() => onEdit(fullData)}
                        className="text-textMuted hover:text-navy p-2 rounded-full transition-colors active:scale-95"
                    >
                        <Pencil size={18} />
                    </button>

                    {/* Botón Eliminar */}
                    <button
                        onClick={handleDelete} disabled={deleteMutation.isPending}
                        className="text-expense/60 hover:text-expense hover:bg-expense/10 p-2 rounded-full transition-colors active:scale-95"
                    >
                        <Trash2 size={18} />
                    </button>

                    {/* Botón Abonar */}
                    {!isCompleted && (
                        <button
                            onClick={() => onPay(id, personName, isLent)}
                            className={`${themeColor} hover:opacity-80 p-2 rounded-full transition-colors active:scale-95 ml-1`}
                        >
                            <PlusCircle size={26} strokeWidth={2.5} />
                        </button>
                    )}
                </div>
            </div>

            <div className="flex justify-between items-end mb-2">
                <p className="font-extrabold text-navy text-2xl">
                    ${remainingAmount.toLocaleString('es-CO')}
                </p>
                <p className="text-sm text-textMuted font-medium">
                    de ${total.toLocaleString('es-CO')}
                </p>
            </div>

            {/* Barra de Progreso */}
            <div className="w-full h-4 bg-background rounded-full overflow-hidden shadow-soft-inset">
                <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${isCompleted ? 'bg-slate-300' : bgThemeColor}`}
                    style={{ width: `${progress}%` }}
                ></div>
            </div>

            <div className="flex justify-between items-center mt-2">
                <p className="text-xs font-bold text-textMuted">
                    Llevas pagado: ${paid.toLocaleString('es-CO')}
                </p>
                <p className={`text-xs font-bold ${themeColor}`}>
                    {progress.toFixed(1)}% liquidado
                </p>
            </div>
        </div>
    );
};