import { useAuthStore } from '../context/useAuthStore';

export const CurrencyInput = ({ label, value, onChange, placeholder, required }) => {
    const currency = useAuthStore(state => state.currency);

    // Lógica de formateo según la región
    const locale = currency === 'USD' ? 'en-US' : currency === 'EUR' ? 'de-DE' : 'es-CO';
    const symbol = currency === 'EUR' ? '€' : '$';

    const handleChange = (e) => {
        // 1. Extraemos solo los números (eliminamos letras, puntos, etc.)
        const rawValue = e.target.value.replace(/\D/g, '');
        // 2. Le pasamos el valor limpio (Ej: "150000") al componente padre
        onChange({ target: { value: rawValue } });
    };

    // 3. Formateamos el valor limpio con puntos para mostrarlo en pantalla (Ej: "150.000")
    const displayValue = value ? new Intl.NumberFormat(locale).format(value) : '';

    return (
        <div className="flex flex-col mb-4">
            {label && <label className="mb-2 text-sm font-bold text-navy">{label}</label>}
            <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted font-bold text-lg">{symbol}</span>
                <input
                    type="text" inputMode="numeric" value={displayValue} onChange={handleChange} placeholder={placeholder} required={required}
                    className="w-full pl-10 pr-4 py-3 bg-background text-navy font-bold rounded-xl outline-none focus:ring-2 focus:ring-brand/60 shadow-soft-inset transition-all"
                />
            </div>
        </div>
    );
};