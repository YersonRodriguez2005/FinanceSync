import api from '../api/axios';

export const getLoans = async () => {
    const { data } = await api.get('/loans');
    return data;
};

export const createLoan = async (loanData) => {
    const { data } = await api.post('/loans', loanData);
    return data;
};

// Pagar o abonar a un préstamo
export const payLoan = async (id, amount) => {
    const { data } = await api.patch(`/loans/${id}/pay`, { amount });
    return data;
};

export const deleteLoan = async (id) => {
    const { data } = await api.delete(`/loans/${id}`);
    return data;
};

export const updateLoan = async (id, loanData) => {
    const { data } = await api.put(`/loans/${id}`, loanData);
    return data;
};