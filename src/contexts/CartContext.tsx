import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { validateVoucher, calculateDiscountedTotal, VoucherValidationResult } from '@/utils/voucherValidation';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  type: 'item' | 'game_item';
  category?: string;
  category_id?: number;
  game?: string;
  game_id?: number;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  // Voucher functionality
  appliedVoucher: any;
  voucherValidation: VoucherValidationResult | null;
  applyVoucher: (voucherCode: string) => Promise<VoucherValidationResult>;
  removeVoucher: () => void;
  getDiscountedTotal: () => { originalTotal: number; discountAmount: number; finalTotal: number };
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
  const [voucherValidation, setVoucherValidation] = useState<VoucherValidationResult | null>(null);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('sky-glow-cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sky-glow-cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(cartItem => cartItem.id === item.id);
      
      if (existingItem) {
        // If item already exists, increase quantity
        return prevItems.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        // Add new item with quantity 1
        return [...prevItems, { ...item, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Voucher functions
  const applyVoucher = async (voucherCode: string): Promise<VoucherValidationResult> => {
    const result = await validateVoucher(voucherCode, cartItems);
    setVoucherValidation(result);
    
    if (result.isValid && result.voucher) {
      setAppliedVoucher(result.voucher);
    }
    
    return result;
  };

  const removeVoucher = () => {
    setAppliedVoucher(null);
    setVoucherValidation(null);
  };

  const getDiscountedTotal = () => {
    return calculateDiscountedTotal(cartItems, appliedVoucher);
  };

  const value: CartContextType = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    appliedVoucher,
    voucherValidation,
    applyVoucher,
    removeVoucher,
    getDiscountedTotal
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
