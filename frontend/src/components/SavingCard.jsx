import { Target, PlusCircle, Trash2, Pencil } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteSavingGoal } from '../services/savingService';
import toast from 'react-hot-toast';

export const SavingCard = ({ id, name, targetAmount, currentAmount, onAddFunds, fullData, onEdit, onDelete }) => {
    const queryClient = useQueryClient();

    // 1. EL FIX MÁGICO: Convertir TODO a números reales (Float) antes de operar
    const current = parseFloat(currentAmount) || 0;
    const target = parseFloat(targetAmount) || 0;

    // 2. Cálculos precisos
    const rawPercentage = target > 0 ? (current / target) * 100 : 0;
    const progress = Math.min(rawPercentage, 100);
    const isCompleted = current >= target; // Ahora comparará números, no texto.

    // 3. NUEVO: Calcular cuánto falta para la meta
    const remainingAmount = Math.max(0, target - current);

    // Mutación para eliminar la meta
    const deleteMutation = useMutation({
        mutationFn: () => deleteSavingGoal(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['savings']);
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
                ¿Eliminar meta <span className="text-expense">{name}</span>?
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
                        onDelete(id);
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
        id: `delete-save-${id}` 
    });
};

    return (
        <div className="bg-surface shadow-soft rounded-3xl p-5 mb-4 border border-white/50 relative overflow-hidden transition-all hover:shadow-glass group">

            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-soft-inset ${isCompleted ? 'bg-brand text-white' : 'bg-background text-navy'}`}>
                        <Target size={24} />
                    </div>
                    <div>
                        <h3 className="font-extrabold text-navy text-lg">{name}</h3>
                        <p className={`text-xs font-extrabold uppercase tracking-wider ${isCompleted ? 'text-brand' : 'text-textMuted'}`}>
                            {isCompleted ? '¡Meta alcanzada!' : 'En progreso'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    {/* Botón de Eliminar */}
                    <button
                        onClick={() => onEdit(fullData)}
                        className="text-textMuted hover:text-brand p-2 transition-colors active:scale-95"
                    >
                        <Pencil size={20} />
                    </button>

                    <button
                        onClick={handleDelete}
                        disabled={deleteMutation.isPending}
                        className="text-expense/60 hover:text-expense hover:bg-expense/10 p-2 rounded-full transition-colors active:scale-95"
                        title="Eliminar Meta"
                    >
                        <Trash2 size={20} />
                    </button>

                    {/* Botón de Abonar (Ahora aparecerá correctamente si falta dinero) */}
                    {!isCompleted && (
                        <button
                            onClick={() => onAddFunds(id, name)}
                            className="text-brand hover:text-brand-dark p-2 rounded-full transition-colors active:scale-95"
                            title="Abonar a meta"
                        >
                            <PlusCircle size={28} strokeWidth={2.5} />
                        </button>
                    )}
                </div>
            </div>

            <div className="flex justify-between items-end mb-2">
                <p className="font-extrabold text-navy text-2xl">
                    ${current.toLocaleString('es-CO')}
                </p>
                <p className="text-sm text-textMuted font-medium">
                    de ${target.toLocaleString('es-CO')}
                </p>
            </div>

            {/* Barra de Progreso Soft UI */}
            <div className="w-full h-4 bg-background rounded-full overflow-hidden shadow-soft-inset">
                <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${isCompleted ? 'bg-brand shadow-[0_0_10px_rgba(0,208,156,0.5)]' : 'bg-brand'}`}
                    style={{ width: `${progress}%` }}
                ></div>
            </div>

            {/* NUEVO: Información de faltante y porcentaje */}
            <div className="flex justify-between items-center mt-2">
                <p className="text-xs font-bold text-expense">
                    {!isCompleted ? `Faltan $${remainingAmount.toLocaleString('es-CO')}` : ''}
                </p>
                <p className="text-xs font-bold text-navy">
                    {progress.toFixed(1)}% completado
                </p>
            </div>
        </div>
    );
};