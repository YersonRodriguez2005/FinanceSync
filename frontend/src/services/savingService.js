import api from '../api/axios';

// Obtener todas las metas de ahorro del usuario
export const getSavings = async () => {
    const { data } = await api.get('/savings');
    return data;
};

// Crear una nueva meta
export const createSavingGoal = async (goalData) => {
    const { data } = await api.post('/savings', goalData);
    return data;
};

// Agregar dinero a una meta existente (Abono)
export const addFundsToSaving = async (id, amount) => {
    const { data } = await api.patch(`/savings/${id}/add-funds`, { amount });
    return data;
};

// Eliminar una meta de ahorro
export const deleteSavingGoal = async (id) => {
    const { data } = await api.delete(`/savings/${id}`);
    return data;
};

export const updateSavingGoal = async (id, goalData) => {
    const { data } = await api.put(`/savings/${id}`, goalData);
    return data;
};