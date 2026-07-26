import api from '../api/axios';

export const getDashboardSummary = async (month, year) => {
    const { data } = await api.get('/dashboard', {
        params: {
            month: month || undefined,
            year: year || undefined
        }
    });

    return data;
};
