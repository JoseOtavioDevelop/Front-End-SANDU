import api from './api';

export const getEmployees = () => api.get('/employees');
export const createEmployee = (data) => api.post('/employees', data);