import api from '../api/axios';

export const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
};

export const register = async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    return data;
};

export const updateProfile = async (userData) => {
    const { data } = await api.put('/auth/profile', userData);
    return data;
};

export const resetPasswordDirect = async (email, newPassword) => {
    const { data } = await api.post('/auth/reset-password-direct', { email, newPassword });
    return data;
};