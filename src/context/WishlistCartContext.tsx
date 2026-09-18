import React, { createContext, useContext, useState, useEffect } from 'react';
import { WishlistItem, CartItem, Bike } from '../types.js';
import { api } from '../services/api.js';
import { useAuth } from './AuthContext.js';

interface WishlistCartContextType {
  wishlist: WishlistItem[];
  cart: CartItem[];
  isInWishlist: (bikeId: string) => boolean;
  isInCart: (bikeId: string) => boolean;
  toggleWishlist: (bike: Bike) => Promise<void>;
  addToCart: (bike: Bike, options?: Partial<CartItem>) => Promise<void>;
  removeFromCart: (bikeId: string) => Promise<void>;
  refreshWishlist: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const WishlistCartContext = createContext<WishlistCartContextType | undefined>(undefined);

export const WishlistCartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

  const refreshWishlist = async () => {
    if (!user) {
      setWishlist([]);
      return;
    }
    try {
      const { wishlist } = await api.getWishlist();
      setWishlist(wishlist);
    } catch (err) {
      console.warn('Failed to fetch wishlist:', err);
    }
  };

  const refreshCart = async () => {
    if (!user) {
      setCart([]);
      return;
    }
    try {
      const { cart } = await api.getCart();
      setCart(cart);
    } catch (err) {
      console.warn('Failed to fetch cart:', err);
    }
  };

  useEffect(() => {
    refreshWishlist();
    refreshCart();
  }, [user]);

  const isInWishlist = (bikeId: string) => {
    return wishlist.some((item) => item.bikeId === bikeId);
  };

  const isInCart = (bikeId: string) => {
    return cart.some((item) => item.bikeId === bikeId);
  };

  const toggleWishlist = async (bike: Bike) => {
    if (!user) {
      throw new Error('Please log in to add items to your wishlist.');
    }
    const alreadySaved = isInWishlist(bike.id);
    if (alreadySaved) {
      await api.removeFromWishlist(bike.id);
      setWishlist((prev) => prev.filter((item) => item.bikeId !== bike.id));
    } else {
      const { item } = await api.addToWishlist(bike.id);
      setWishlist((prev) => [...prev, { ...item, bike }]);
    }
  };

  const addToCart = async (bike: Bike, options?: Partial<CartItem>) => {
    if (!user) {
      throw new Error('Please log in to add items to your rental cart.');
    }
    const { item } = await api.addToCart({
      bikeId: bike.id,
      rentalType: options?.rentalType || 'hourly',
      pickupDate: options?.pickupDate,
      pickupTime: options?.pickupTime,
      returnDate: options?.returnDate,
      returnTime: options?.returnTime,
      pickupLocation: options?.pickupLocation || bike.location,
    });
    setCart((prev) => [...prev.filter((c) => c.bikeId !== bike.id), { ...item, bike }]);
  };

  const removeFromCart = async (bikeId: string) => {
    if (!user) return;
    await api.removeFromCart(bikeId);
    setCart((prev) => prev.filter((item) => item.bikeId !== bikeId));
  };

  return (
    <WishlistCartContext.Provider
      value={{
        wishlist,
        cart,
        isInWishlist,
        isInCart,
        toggleWishlist,
        addToCart,
        removeFromCart,
        refreshWishlist,
        refreshCart,
      }}
    >
      {children}
    </WishlistCartContext.Provider>
  );
};

export function useWishlistCart() {
  const context = useContext(WishlistCartContext);
  if (!context) {
    throw new Error('useWishlistCart must be used within a WishlistCartProvider');
  }
  return context;
}
