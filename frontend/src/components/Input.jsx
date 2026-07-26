import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export const Input = ({
    label,
    icon: Icon,
    isPassword = false,
    error,
    type = 'text',
    className = '',
    wrapperClassName = '',
    ...props
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const resolvedType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
        <div className={`flex flex-col mb-4 ${wrapperClassName}`}>
            {label && (
                <label className="mb-2 text-sm font-semibold text-navy/90">
                    {label}
                </label>
            )}

            <div className="relative flex items-center">
                {Icon && (
                    <Icon
                        size={18}
                        strokeWidth={2}
                        className="pointer-events-none absolute left-4 text-text-muted"
                    />
                )}

                <input
                    type={resolvedType}
                    {...props}
                    className={`w-full ${Icon ? 'pl-11' : 'pl-4'} ${isPassword ? 'pr-11' : 'pr-4'} py-3.5 bg-background text-navy placeholder:text-text-muted/60 rounded-xl outline-none shadow-soft-inset focus:ring-2 focus:ring-brand/50 transition-all duration-200 ${
                        error ? 'ring-2 ring-expense/50' : ''
                    } ${className}`}
                />

                {isPassword && (
                    <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-4 text-text-muted hover:text-navy transition-colors"
                        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                )}
            </div>

            {error && <span className="mt-1.5 text-xs font-medium text-expense">{error}</span>}
        </div>
    );
};