import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { addToCart, removeFromCart, getCart, clearCartApi } from '../api/api';
import { useToast } from './ToastContext';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { showToast } = useToast();
  // cartId = session identifier sent in Cart-Id header
  const [cartId] = useState(() => {
    const saved = localStorage.getItem('cartId');
    if (saved) return saved;
    const newId = Date.now().toString();
    localStorage.setItem('cartId', newId);
    return newId;
  });
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);

  // Sync with backend on mount
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await getCart(cartId);
        if (res.data && Array.isArray(res.data)) {
          setCartItems(res.data);
          const count = res.data.reduce((sum, item) => sum + item.quantity, 0);
          setCartCount(count);
        }
      } catch (err) {
        console.error('Failed to fetch cart:', err);
      }
    };
    fetchCart();
  }, [cartId]);

  const addItem = useCallback(async (product, quantity = 1) => {
    // 1. Update UI immediately (Optimistic Update)
    setCartItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + quantity, subTotal: (i.quantity + quantity) * Number(product.price) }
            : i
        );
      }
      return [...prev, { product, quantity, subTotal: quantity * Number(product.price) }];
    });
    setCartCount((c) => c + quantity);
    
    // Show success notification toast
    showToast(`Đã thêm ${product.productName} vào giỏ hàng!`, 'success');

    // 2. Sync with backend in background
    try {
      const res = await addToCart(cartId, product.id, quantity);
      // If backend returns different data (e.g. server-side validation), sync it
      if (res.data && Array.isArray(res.data)) {
        setCartItems(res.data);
        const count = res.data.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(count);
      }
    } catch (err) {
      console.error('Failed to sync cart with backend:', err);
      // Optional: rollback or show error if critical
    }
  }, [cartId]);

  const removeItem = useCallback(async (productId) => {
    // 1. Update UI immediately
    setCartItems((prev) => {
      const item = prev.find((i) => i.product.id === productId);
      if (item) setCartCount((c) => Math.max(0, c - item.quantity));
      return prev.filter((i) => i.product.id !== productId);
    });

    // 2. Sync with backend
    try {
      await removeFromCart(cartId, productId);
      const res = await getCart(cartId);
      if (res.data && Array.isArray(res.data)) {
        setCartItems(res.data);
        const count = res.data.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(count);
      }
    } catch (err) {
      console.error('Failed to sync cart removal:', err);
    }
  }, [cartId]);

  const clearCart = useCallback(async () => {
    try {
      await clearCartApi(cartId);
      setCartItems([]);
      setCartCount(0);
    } catch (err) {
      console.error('Failed to clear cart:', err);
    }
  }, [cartId]);

  const total = cartItems.reduce((sum, i) => sum + (Number(i.subTotal) || 0), 0);

  return (
    <CartContext.Provider value={{ cartId, cartItems, cartCount, total, addItem, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
