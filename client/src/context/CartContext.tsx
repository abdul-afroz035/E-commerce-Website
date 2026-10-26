import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, CartSummary } from '../types';
import { cartApi, wishlistApi } from '../services/api';
import { useAuth } from './AuthContext';

interface CartContextType {
  items: CartItem[];
  summary: CartSummary;
  wishlistIds: Set<number>;
  isLoading: boolean;
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  refreshCart: () => Promise<void>;
  toggleWishlist: (productId: number) => Promise<boolean>;
  isWishlisted: (productId: number) => boolean;
}

const defaultSummary: CartSummary = {
  itemCount: 0,
  originalTotal: 0,
  totalDiscount: 0,
  deliveryFee: 0,
  finalAmount: 0,
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [summary, setSummary] = useState<CartSummary>(defaultSummary);
  const [wishlistIds, setWishlistIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      refreshCart();
      refreshWishlist();
    } else {
      setItems([]);
      setSummary(defaultSummary);
      setWishlistIds(new Set());
    }
  }, [isAuthenticated]);

  const refreshCart = async () => {
    if (!isAuthenticated) return;
    try {
      setIsLoading(true);
      const res = await cartApi.getCart();
      setItems(res.items);
      setSummary(res.summary);
    } catch (err) {
      console.error('Failed to load cart:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshWishlist = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await wishlistApi.getWishlist();
      const ids = new Set(res.items.map((item) => item.id || (item as any).product_id));
      setWishlistIds(ids);
    } catch (err) {
      console.error('Failed to load wishlist:', err);
    }
  };

  const addToCart = async (productId: number, quantity: number = 1) => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    try {
      await cartApi.addToCart(productId, quantity);
      await refreshCart();
    } catch (err) {
      console.error('Failed to add to cart:', err);
    }
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    if (!isAuthenticated) return;
    try {
      await cartApi.updateQuantity(productId, quantity);
      await refreshCart();
    } catch (err) {
      console.error('Failed to update quantity:', err);
    }
  };

  const removeFromCart = async (productId: number) => {
    if (!isAuthenticated) return;
    try {
      await cartApi.removeItem(productId);
      await refreshCart();
    } catch (err) {
      console.error('Failed to remove item:', err);
    }
  };

  const toggleWishlist = async (productId: number): Promise<boolean> => {
    if (!isAuthenticated) {
      openAuthModal();
      return false;
    }
    try {
      const res = await wishlistApi.toggleWishlist(productId);
      setWishlistIds((prev) => {
        const next = new Set(prev);
        if (res.inWishlist) {
          next.add(productId);
        } else {
          next.delete(productId);
        }
        return next;
      });
      return res.inWishlist;
    } catch (err) {
      console.error('Failed to toggle wishlist:', err);
      return false;
    }
  };

  const isWishlisted = (productId: number) => wishlistIds.has(productId);

  return (
    <CartContext.Provider
      value={{
        items,
        summary,
        wishlistIds,
        isLoading,
        addToCart,
        updateQuantity,
        removeFromCart,
        refreshCart,
        toggleWishlist,
        isWishlisted,
      }}
    >
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
