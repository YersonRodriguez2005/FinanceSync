import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, ArrowLeft, Download, FileText } from 'lucide-react';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip as PieTooltip,
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as LineTooltip, Legend
} from 'recharts';
import { getDashboardSummary } from '../services/dashboardService';
import { downloadExtractPDF } from '../services/reportService';
import { BottomNav } from '../components/BottomNav';
import { TransactionModal } from '../components/TransactionModal';

export const Reports = () => {
    const navigate = useNavigate();

    const [currentDate, setCurrentDate] = useState(new Date());
    const [isDownloading, setIsDownloading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    const monthName = currentDate.toLocaleString('es-CO', { month: 'long', year: 'numeric' });

    const { data: summaryData, isLoading } = useQuery({
        queryKey: ['reports', currentMonth, currentYear],
        queryFn: () => getDashboardSummary(currentMonth, currentYear)
    });

    const responseData = summaryData?.data || summaryData || {};

    const chartData = responseData.chart_data || [];
    const trendData = responseData.trend_data || [];

    const hasData = chartData.length > 0 || trendData.length > 0;

    const COLORS = ['#00D09C', '#F43F5E', '#8B5CF6', '#3b82f6', '#f59e0b', '#ec4899'];

    const handlePrevMonth = () => setCurrentDate(new Date(currentYear, currentDate.getMonth() - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(currentYear, currentDate.getMonth() + 1, 1));

    const handleDownload = async () => {
        try {
            setIsDownloading(true);
            const blob = await downloadExtractPDF(currentMonth, currentYear);
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `FinanceSync_Extracto_${currentMonth}_${currentYear}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch {
            alert('Error al descargar el extracto.');
        } finally {
            setIsDownloading(false);
        }
    };

    // Renderizador personalizado para la leyenda del PieChart
    const renderCustomLegend = () => (
        <div className="flex flex-col gap-3 mt-6">
            {chartData.map((entry, index) => (
                <div key={`legend-${index}`} className="flex justify-between items-center bg-background/50 p-2 rounded-xl border border-white/50">
                    <div className="flex items-center gap-3">
                        {/* El puntito de color */}
                        <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>

                        {/* 🟢 EL FIX: Buscamos ambos posibles nombres de la base de datos */}
                        <span className="text-navy font-bold text-sm uppercase">
                            {entry.category_name || entry.name || 'Sin Categoría'}
                        </span>
                    </div>
                    <span className="font-extrabold text-navy">
                        ${parseFloat(entry.total).toLocaleString('es-CO')}
                    </span>
                </div>
            ))}
        </div>
    );

    return (
        <div className="min-h-screen bg-background pb-28 pt-8 relative overflow-hidden animate-fade-in">
            <div className="absolute top-0 left-0 w-full h-180 bg-linear-to-b from-brand to-transparent z-0 pointer-events-none"></div>

            <div className="relative z-10 px-6">

                <div className="flex items-center justify-between mb-8 animate-slide-up">
                    <button onClick={() => navigate('/dashboard')} className="w-10 h-10 bg-surface shadow-soft rounded-full flex items-center justify-center text-navy active:shadow-soft-inset">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-extrabold text-navy">Analítica</h1>
                    <div className="w-10"></div>
                </div>

                <div className="mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <div className="bg-surface shadow-soft rounded-2xl flex items-center justify-between p-2 border border-white/50">
                        <button onClick={handlePrevMonth} className="p-3 text-textMuted hover:text-brand rounded-xl">
                            <ChevronLeft size={24} />
                        </button>
                        <h2 className="text-navy font-bold uppercase tracking-wider text-sm">{monthName}</h2>
                        <button onClick={handleNextMonth} className="p-3 text-textMuted hover:text-brand rounded-xl">
                            <ChevronRight size={24} />
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <p className="text-center text-textMuted font-medium animate-pulse mt-10">Generando analíticas...</p>
                ) : !hasData ? (
                    <div className="text-center mt-10 bg-surface p-8 shadow-soft rounded-3xl">
                        <PieChart size={48} className="mx-auto mb-4 opacity-50 text-textMuted" />
                        <p className="text-navy font-extrabold text-lg">Sin datos</p>
                        <p className="text-textMuted text-sm">Registra movimientos para ver tus analíticas.</p>
                    </div>
                ) : (
                    <>
                        {/* 1. Gráfico de Anillo (Distribución de Gastos) */}
                        <div className="bg-surface/80 backdrop-blur-glass border border-white/50 shadow-glass rounded-3xl p-6 mb-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                            <h3 className="text-navy font-extrabold mb-2">Distribución de Gastos</h3>
                            <p className="text-xs text-textMuted mb-4">¿En qué se va tu dinero este mes?</p>

                            <div className="h-56 w-full relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            cx="50%" cy="50%"
                                            innerRadius={60} outerRadius={85}
                                            paddingAngle={4}
                                            dataKey="total"
                                        >
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <PieTooltip
                                            formatter={(value) => `$${parseFloat(value).toLocaleString('es-CO')}`}
                                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: 'var(--shadow-soft)' }}
                                            itemStyle={{ fontWeight: 'bold' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Leyenda Personalizada con Valores */}
                            {renderCustomLegend()}
                        </div>

                        {/* 2. NUEVO: Gráfico de Líneas (Tendencia Ingresos vs Gastos) */}
                        <div className="bg-surface/80 backdrop-blur-glass border border-white/50 shadow-glass rounded-3xl p-6 mb-8 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                            <h3 className="text-navy font-extrabold mb-2">Flujo de Caja Mensual</h3>
                            <p className="text-xs text-textMuted mb-6">Comparativa de ingresos frente a gastos por día.</p>

                            <div className="h-64 w-full -ml-4"> {/* Margen negativo para compensar el eje Y */}
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={trendData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                        <XAxis
                                            dataKey="day"
                                            tickFormatter={(val) => `Día ${val}`}
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 10, fill: '#64748B', fontWeight: 'bold' }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 10, fill: '#64748B' }}
                                            tickFormatter={(val) => `$${(val / 1000)}k`} // Formateo para que no ocupe tanto espacio
                                        />
                                        <LineTooltip
                                            formatter={(value) => `$${parseFloat(value).toLocaleString('es-CO')}`}
                                            labelFormatter={(label) => `Día ${label}`}
                                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: 'var(--shadow-glass)', backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
                                        />
                                        <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', paddingBottom: '10px' }} />

                                        {/* Línea Verde: Ingresos */}
                                        <Line
                                            type="monotone" // Esto hace que la línea sea curva y suave
                                            dataKey="income"
                                            name="Ingresos"
                                            stroke="var(--color-brand)"
                                            strokeWidth={4}
                                            dot={{ r: 4, strokeWidth: 2 }}
                                            activeDot={{ r: 6, stroke: 'var(--color-brand)', strokeWidth: 2, fill: '#fff' }}
                                        />

                                        {/* Línea Roja: Gastos */}
                                        <Line
                                            type="monotone"
                                            dataKey="expense"
                                            name="Gastos"
                                            stroke="var(--color-expense)"
                                            strokeWidth={4}
                                            dot={{ r: 4, strokeWidth: 2 }}
                                            activeDot={{ r: 6, stroke: 'var(--color-expense)', strokeWidth: 2, fill: '#fff' }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Botón Descargar Extracto */}
                        <div className="animate-slide-up mb-6" style={{ animationDelay: '0.4s' }}>
                            <button
                                onClick={handleDownload} disabled={isDownloading}
                                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-navy hover:bg-slate-800 text-white font-extrabold text-lg shadow-[0_10px_25px_rgba(26,35,58,0.3)] transition-all active:scale-95"
                            >
                                {isDownloading ? <span className="animate-pulse">Generando PDF...</span> : <><FileText size={24} /> Descargar Extracto <Download size={20} className="opacity-70" /></>}
                            </button>
                        </div>
                    </>
                )}
            </div>

            <BottomNav onOpenModal={() => setIsModalOpen(true)} />
            <TransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};