import api from '../api/axios';

export const getTransactions = async (month, year, page = 1, limit = 10) => {
    let url = `/transactions?page=${page}&limit=${limit}`;
    
    if (month) url += `&month=${month}`;
    if (year) url += `&year=${year}`;

    const { data } = await api.get(url);
    return data;
};

export const createTransaction = async (transactionData) => {
    const { data } = await api.post('/transactions', transactionData);
    return data;
};

export const deleteTransaction = async (id) => {
    const { data } = await api.delete(`/transactions/${id}`);
    return data;
};

export const updateTransaction = async (id, transactionData) => {
    const { data } = await api.put(`/transactions/${id}`, transactionData);
    return data;
};