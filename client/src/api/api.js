import axios from 'axios';

const API_BASE = 'http://localhost:8900/api';

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Product Catalog ───────────────────────────────────────────────────
export const getProducts = () => api.get('/catalog/products');
export const getProductById = (id) => api.get(`/catalog/products/${id}`);
export const getProductsByCategory = (category) =>
  api.get('/catalog/products', { params: { category } });
export const getProductsByName = (name) =>
  api.get('/catalog/products', { params: { name } });

// Admin product
export const addProduct = (product) => api.post('/catalog/admin/products', product);
export const deleteProduct = (id) => api.delete(`/catalog/admin/products/${id}`);

// ─── User / Auth ────────────────────────────────────────────────────────
export const registerUser = (user) => api.post('/accounts/registration', user);
export const getUsers = () => api.get('/accounts/users');
export const getUserById = (id) => api.get(`/accounts/users/${id}`);
export const getUserByName = (name) =>
  api.get('/accounts/users', { params: { name } });
export const deleteUser = (id) => api.delete(`/accounts/users/${id}`);

// ─── Cart ───────────────────────────────────────────────────────────────
export const getCart = (cartId) =>
  api.get('/shop/cart', { headers: { 'Cart-Id': cartId } });
export const addToCart = (cartId, productId, quantity) =>
  api.post('/shop/cart', null, {
    params: { productId, quantity },
    headers: { 'Cart-Id': cartId },
  });
export const removeFromCart = (cartId, productId) =>
  api.delete('/shop/cart', {
    params: { productId },
    headers: { 'Cart-Id': cartId },
  });
export const clearCartApi = (cartId) =>
  api.delete('/shop/cart/all', {
    headers: { 'Cart-Id': cartId },
  });

// ─── Order ──────────────────────────────────────────────────────────────
export const createOrder = (userId, cartId) =>
  api.post(`/shop/order/${userId}`, null, {
    headers: { 'Cart-Id': cartId },
  });
export const getAllOrders = () => api.get('/shop/admin/orders');

// ─── Recommendations ────────────────────────────────────────────────────
export const getRecommendations = (productName) =>
  api.get('/review/recommendations', { params: { name: productName } });
export const addRecommendation = (userId, productId, rating) =>
  api.post(`/review/${userId}/recommendations/${productId}`, null, {
    params: { rating },
  });
export const deleteRecommendation = (id) =>
  api.delete(`/review/recommendations/${id}`);
