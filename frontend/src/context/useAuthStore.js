import { create } from 'zustand';

// Creamos nuestra "bóveda" global
export const useAuthStore = create((set) => ({
    // Estado inicial: Buscamos si ya hay datos guardados en el celular
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,

    // Estado de la moneda (Por defecto COP)
    currency: localStorage.getItem('currency') || 'COP',
    
    // Si hay un token, el usuario está autenticado
    isAuthenticated: !!localStorage.getItem('token'),

    // Acción para iniciar sesión (Guardamos en bóveda y en celular)
    setLogin: (userData, token) => {
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token);
        set({ user: userData, token: token, isAuthenticated: true });
    },

    // Acción para cerrar sesión (Limpiamos todo)
    setLogout: () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
    },

    updateUser: (newUserData) => {
        set((state) => {
            const updatedUser = { ...state.user, ...newUserData };
            localStorage.setItem('user', JSON.stringify(updatedUser)); // Guardar en local
            return { user: updatedUser };
        });
    },

    // Función para actualizar la moneda
    setCurrency: (newCurrency) => {
        localStorage.setItem('currency', newCurrency);
        set({ currency: newCurrency });
    }
}));