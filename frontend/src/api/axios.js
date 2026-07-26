// src/api/axios.js
import axios from 'axios';

// Creamos una instancia maestra de Axios
const api = axios.create({
    baseURL: 'http://localhost:4000/api',
    timeout: 10000,
});

// INTERCEPTOR DE PETICIÓN: El "Guardia de Salida"
api.interceptors.request.use(
    (config) => {
        // Buscamos el token que guardamos en el localStorage al hacer login
        const token = localStorage.getItem('token');
        
        // Si hay token, se lo pegamos a las cabeceras (headers)
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// INTERCEPTOR DE RESPUESTA: El "Guardia de Entrada"
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Si el backend nos responde un 401 (Token expirado de 15 días)
        if (error.response && error.response.status === 401) {
            console.error('La sesión expiró o es inválida.');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Aquí podríamos forzar una redirección al login
            window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);

export default api;