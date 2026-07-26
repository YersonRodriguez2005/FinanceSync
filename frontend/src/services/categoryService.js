import api from '../api/axios';

export const getCategories = async () => {
    const { data } = await api.get('/categories');
    return data;
};