import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '@/data/categories';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './AuthContext';

export interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const { user } = useAuth();

  // Load cart from Firestore or localStorage
  useEffect(() => {
    const loadCart = async () => {
      if (user) {
        try {
          const cartDoc = await getDoc(doc(db, 'carts', user.id));
          if (cartDoc.exists()) {
            setItems(cartDoc.data().items || []);
          }
        } catch (error) {
          console.error('Error loading cart:', error);
          // Fallback to localStorage
          const saved = localStorage.getItem('cart');
          if (saved) {
            setItems(JSON.parse(saved));
          }
        }
      } else {
        const saved = localStorage.getItem('cart');
        if (saved) {
          setItems(JSON.parse(saved));
        }
      }
    };

    loadCart();
  }, [user]);

  // Save cart to Firestore or localStorage
  useEffect(() => {
    if (user) {
      // Save to Firestore
      setDoc(doc(db, 'carts', user.id), {
        items,
        updatedAt: serverTimestamp(),
      }).catch(console.error);
    } else {
      // Save to localStorage
      localStorage.setItem('cart', JSON.stringify(items));
    }
  }, [items, user]);

  const addToCart = (product: Product, quantity: number = 1) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      
      return [...prevItems, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId: number) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotal = (): number => {
    return items.reduce((total, item) => {
      const price = item.discountPrice || item.price;
      return total + price * item.quantity;
    }, 0);
  };

  const getItemCount = (): number => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotal,
        getItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

