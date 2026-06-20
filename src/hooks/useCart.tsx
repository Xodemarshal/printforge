"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/useToast";

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { success, info } = useToast();

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("printforge-cart");
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error("Failed to parse cart from localStorage:", error);
      }
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem("printforge-cart", JSON.stringify(items));
  }, [items]);

  const addItem = (product: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    const existingItem = items.find(item => item.productId === product.productId);
    if (existingItem) {
      const newQuantity = existingItem.quantity + (product.quantity || 1);
      setItems(currentItems =>
        currentItems.map(item =>
          item.productId === product.productId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
      success("Cart Updated", `${product.name} quantity updated to ${newQuantity}`);
      return;
    }

    const newItem: CartItem = {
      ...product,
      quantity: product.quantity || 1
    };
    setItems(currentItems => [...currentItems, newItem]);
    success("Added to Cart", `${product.name} added to your cart`);
  };

  const removeItem = (productId: string) => {
    const item = items.find(item => item.productId === productId);
    setItems(currentItems => currentItems.filter(item => item.productId !== productId));
    if (item) {
      info("Item Removed", `${item.name} removed from cart`);
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setItems(currentItems =>
      currentItems.map(item =>
        item.productId === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    info("Cart Cleared", "All items removed from cart");
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getTotalItems,
      getTotalPrice,
      isOpen,
      openCart,
      closeCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
