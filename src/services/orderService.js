import api from './api';

export const createOrder = (data) => api.post('/orders', data);
export const getOrders = () => api.get('/orders');
export const approveOrder = (id) => api.put(`/orders/${id}/approve`);
export const cancelOrder = (id) => api.put(`/orders/${id}/cancel`);