import api from './api';

export const getTransactions = () => api.get('/cash');
export const addTransaction = (data) => api.post('/cash', data);