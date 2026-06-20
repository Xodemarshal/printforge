"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/useToast";

interface WishlistContextType {
  items: string[];
  toggle: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<string[]>([]);
  const { success, info } = useToast();

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem("printforge-wishlist");
    if (savedWishlist) {
      try {
        setItems(JSON.parse(savedWishlist));
      } catch (error) {
        console.error("Failed to parse wishlist from localStorage:", error);
      }
    }
  }, []);

  // Save wishlist to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem("printforge-wishlist", JSON.stringify(items));
  }, [items]);

  const toggle = (productId: string) => {
    const isCurrentlyInWishlist = items.includes(productId);
    setItems(currentItems =>
      isCurrentlyInWishlist
        ? currentItems.filter(id => id !== productId)
        : [...currentItems, productId]
    );

    if (isCurrentlyInWishlist) {
      info("Removed from Wishlist", "Item removed from your wishlist");
    } else {
      success("Added to Wishlist", "Item saved to your wishlist");
    }
  };

  const isInWishlist = (productId: string) => {
    return items.includes(productId);
  };

  const clearWishlist = () => {
    setItems([]);
    info("Wishlist Cleared", "All items removed from wishlist");
  };

  return (
    <WishlistContext.Provider value={{ items, toggle, isInWishlist, clearWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
