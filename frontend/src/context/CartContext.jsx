import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({
    items: [],
    total_items: 0,
    subtotal: 0,
    tax: 0,
    total: 0
  });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart({ items: [], total_items: 0, subtotal: 0, tax: 0, total: 0 });
      return;
    }

    try {
      setLoading(true);
      const response = await api.get('/auth/me/cart');
      setCart(response.data);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (product, quantity = 1) => {
    if (!isAuthenticated) {
      showNotification('Please login to add items to cart', 'error');
      return false;
    }

    try {
      setLoading(true);
      const productId = product.id || product._id;
      const productName = product.title || product.name;
      const response = await api.post('/auth/me/cart', {
        product_id: productId,
        quantity
      });
      setCart(response.data);
      showNotification(`${productName} added to cart!`, 'success');
      return true;
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to add to cart';
      showNotification(message, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (!isAuthenticated) return false;

    try {
      setLoading(true);
      const response = await api.patch(`/auth/me/cart/${productId}`, { quantity });
      setCart(response.data);
      return true;
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to update cart';
      showNotification(message, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    if (!isAuthenticated) return false;

    try {
      setLoading(true);
      const response = await api.delete(`/auth/me/cart/${productId}`);
      setCart(response.data);
      showNotification('Item removed from cart', 'success');
      return true;
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to remove from cart';
      showNotification(message, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) return false;

    try {
      setLoading(true);
      const response = await api.delete('/auth/me/cart');
      setCart(response.data);
      showNotification('Cart cleared', 'success');
      return true;
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to clear cart';
      showNotification(message, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    cart,
    loading,
    notification,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart: fetchCart,
    cartCount: cart.total_items
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
