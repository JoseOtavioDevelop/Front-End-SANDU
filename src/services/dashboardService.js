import api from './api';

export const getDashboardMetrics = () => api.get('/dashboard/metrics');