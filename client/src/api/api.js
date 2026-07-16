import axios from 'axios';

const API_BASE = 'http://localhost:8900/api';

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const userStr = localStorage.getItem('rf_user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user && user.accessToken) {
        config.headers.Authorization = `Bearer ${user.accessToken}`;
      }
    } catch (e) {
      // Ignore
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    const url = response.config.url;
    if (!url) return response;
    
    // Check if this response contains product data
    if (url.includes('/catalog/products')) {
      const data = response.data;
      if (Array.isArray(data)) {
        data.forEach(p => {
          if (p && typeof p.price === 'number' && p.price < 1000) {
            p.price = p.price * 25000;
          }
        });
      } else if (data && typeof data.price === 'number' && data.price < 1000) {
        data.price = data.price * 25000;
      }
    }
    
    // Check if this response contains cart data
    if (url.includes('/shop/cart')) {
      const data = response.data;
      if (data) {
        const items = data.items || (Array.isArray(data) ? data : []);
        items.forEach(item => {
          if (item && item.product && typeof item.product.price === 'number' && item.product.price < 1000) {
            item.product.price = item.product.price * 25000;
          }
          if (item && typeof item.subTotal === 'number' && item.subTotal < 1000) {
            item.subTotal = item.subTotal * 25000;
          }
        });
        if (typeof data.totalPrice === 'number' && data.totalPrice < 1000) {
          data.totalPrice = data.totalPrice * 25000;
        }
      }
    }
    
    // Check if this response contains order data
    if (url.includes('/shop/order') || url.includes('/shop/admin/orders')) {
      const data = response.data;
      const processOrder = (order) => {
        if (!order) return;
        if (typeof order.total === 'number' && order.total < 1000) {
          order.total = order.total * 25000;
        }
        if (Array.isArray(order.items)) {
          order.items.forEach(item => {
            if (item && item.product && typeof item.product.price === 'number' && item.product.price < 1000) {
              item.product.price = item.product.price * 25000;
            }
            if (item && typeof item.subTotal === 'number' && item.subTotal < 1000) {
              item.subTotal = item.subTotal * 25000;
            }
          });
        }
      };
      
      if (Array.isArray(data)) {
        data.forEach(processOrder);
      } else {
        processOrder(data);
      }
    }
    
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('rf_user');
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin/login';
      } else {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Product Catalog ───────────────────────────────────────────────────
export const getProducts = () => api.get('/catalog/products');
export const getProductById = (id) => api.get(`/catalog/products/${id}`);
export const getProductsByCategory = (category) =>
  api.get('/catalog/products', { params: { category } });
export const getProductsByName = (name) =>
  api.get('/catalog/products', { params: { name } });

// Admin product
export const addProduct = (product) => api.post('/catalog/admin/products', product);
export const updateProduct = (id, product) => api.put(`/catalog/admin/products/${id}`, product);
export const deleteProduct = (id) => api.delete(`/catalog/admin/products/${id}`);

// ─── User / Auth ────────────────────────────────────────────────────────
export const loginUser = (credentials) => api.post('/auth/login', credentials);
export const registerUser = (user) => api.post('/auth/register', {
  username: user.userName,
  password: user.userPassword,
  firstName: user.userDetails.firstName,
  lastName: user.userDetails.lastName,
  email: user.userDetails.email,
  phoneNumber: user.userDetails.phoneNumber
});
export const getUsers = () => api.get('/accounts/users');
export const getUserById = (id) => api.get(`/accounts/users/${id}`);
export const getUserByName = (name) =>
  api.get('/accounts/users', { params: { name } });
export const addUser = (user) => api.post('/accounts/users', user);
export const updateUser = (id, user) => api.put(`/accounts/users/${id}`, user);
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
export const getUserOrders = (userId) => api.get(`/shop/order/user/${userId}`);
export const getAllOrders = () => api.get('/shop/admin/orders');

// VNPay
export const createVNPayPayment = (orderId) =>
  api.get('/shop/vnpay/create-payment', { params: { orderId } });
export const verifyVNPayPayment = (params) =>
  api.post('/shop/vnpay/verify-payment', params);

// ─── Recommendations ────────────────────────────────────────────────────
export const getRecommendations = (productName) =>
  api.get('/review/recommendations', { params: { name: productName } });
export const addRecommendation = (userId, productId, rating) =>
  api.post(`/review/${userId}/recommendations/${productId}`, null, {
    params: { rating },
  });
export const deleteRecommendation = (id) =>
  api.delete(`/review/recommendations/${id}`);

