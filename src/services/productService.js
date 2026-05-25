import api from './api';

export const getProducts = () => api.get('/products');
export const createProduct = (data) => api.post('/products', data);