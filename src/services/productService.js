// frontend/src/services/productService.js
import api from './api';

// Lista todos os produtos cadastrados
export const getProducts = () => api.get('/products');

// Cadastra um novo produto no banco
export const createProduct = (data) => api.post('/products', data);

// Atualiza os dados de um produto existente (PUT)
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);

// Remove/Inativa um produto do banco de dados (DELETE)
export const deleteProduct = (id) => api.delete(`/products/${id}`);