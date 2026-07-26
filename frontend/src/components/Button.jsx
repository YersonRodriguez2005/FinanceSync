export const Button = ({ children, type = 'button', onClick, isLoading }) => {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={isLoading}
            // Aquí usamos bg-brand, shadow-soft y cambiamos a bg-brand-dark en el hover
            className={`w-full py-4 font-extrabold text-white rounded-xl shadow-soft active:shadow-soft-inset transition-all duration-200 bg-brand hover:bg-brand-dark ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
            {isLoading ? 'Sincronizando...' : children}
        </button>
    );
};