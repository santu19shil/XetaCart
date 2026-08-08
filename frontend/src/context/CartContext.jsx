import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import supabase from '../lib/supabaseClient';
import { cartAPI } from '../api';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchCart = async () => {
    if (!user) return;
    setLoading(true);
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('cart_items')
          .select('*, products(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);
        const normalized = (data || []).map((ci) => ({
          cart_item_id: ci.id,
          quantity: ci.quantity,
          product_id: ci.product_id,
          ...ci.products,
        }));
        setCart(normalized);
      } else {
        const response = await cartAPI.get();
        setCart(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch cart', error);
      alert('Failed to load cart. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    if (!user) return false;
    try {
      if (supabase) {
        const { error } = await supabase
          .from('cart_items')
          .upsert(
            { user_id: user.id, product_id: productId, quantity },
            { onConflict: 'user_id,product_id' }
          );

        if (error) throw new Error(error.message);
      } else {
        await cartAPI.add({ product_id: productId, quantity });
      }
      await fetchCart();
      return true;
    } catch (error) {
      console.error('Failed to add to cart', error);
      alert('Failed to add to cart. Please try again.');
      return false;
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (!user) return;
    try {
      if (supabase) {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity })
          .eq('id', itemId)
          .eq('user_id', user.id);

        if (error) throw new Error(error.message);
      } else {
        await cartAPI.update(itemId, { quantity });
      }
      await fetchCart();
    } catch (error) {
      console.error('Failed to update cart', error);
      alert('Failed to update cart. Please try again.');
    }
  };

  const removeItem = async (itemId) => {
    if (!user) return;
    try {
      if (supabase) {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('id', itemId)
          .eq('user_id', user.id);

        if (error) throw new Error(error.message);
      } else {
        await cartAPI.remove(itemId);
      }
      await fetchCart();
    } catch (error) {
      console.error('Failed to remove item', error);
      alert('Failed to remove item. Please try again.');
    }
  };

  const clearCart = async () => {
    if (!user) return;
    try {
      if (supabase) {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id);

        if (error) throw new Error(error.message);
      } else {
        await cartAPI.clear();
      }
      setCart([]);
    } catch (error) {
      console.error('Failed to clear cart', error);
      alert('Failed to clear cart. Please try again.');
    }
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0);

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCart([]);
    }
  }, [user]);

  return (
    <CartContext.Provider value={{ cart, cartCount, cartTotal, loading, fetchCart, addToCart, updateQuantity, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
