"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartAddOn {
  addOnId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  total: number;
}

export interface CartItem {
  id: string; // unique item id in cart
  eventId: string;
  eventTitle: string;
  eventSlug: string;
  eventCoverImage: string;
  organiserName: string;
  venueName: string;
  city: string;
  packageDetails: {
    packageId: string;
    name: string;
    price: number;
  };
  guestsCount: number;
  selectedSlot: {
    slotId: string;
    date: string;
    startTime: string;
    endTime: string;
  };
  selectedAddOns: CartAddOn[];
  itemTotal: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "id" | "itemTotal">) => void;
  removeItem: (itemId: string) => void;
  updateGuests: (itemId: string, guests: number) => void;
  updateAddOn: (itemId: string, addOnId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  platformFee: number;
  taxAmount: number;
  totalAmount: number;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "eventhub_cart_v1";

function calculateItemTotal(
  packagePrice: number,
  guests: number,
  addOns: CartAddOn[]
): number {
  const pkgCost = packagePrice * guests;
  const addonsCost = addOns.reduce((sum, a) => sum + a.unitPrice * a.quantity, 0);
  return pkgCost + addonsCost;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load cart", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch (e) {
        console.error("Failed to save cart", e);
      }
    }
  }, [items, isLoaded]);

  const addItem = (itemData: Omit<CartItem, "id" | "itemTotal">) => {
    const itemTotal = calculateItemTotal(
      itemData.packageDetails.price,
      itemData.guestsCount,
      itemData.selectedAddOns
    );

    const newItem: CartItem = {
      ...itemData,
      id: `cart_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      itemTotal,
    };

    setItems((prev) => [...prev, newItem]);
    setIsDrawerOpen(true);
  };

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const updateGuests = (itemId: string, guests: number) => {
    if (guests < 1) return;
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const newTotal = calculateItemTotal(
            item.packageDetails.price,
            guests,
            item.selectedAddOns
          );
          return { ...item, guestsCount: guests, itemTotal: newTotal };
        }
        return item;
      })
    );
  };

  const updateAddOn = (itemId: string, addOnId: string, quantity: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const updatedAddOns = item.selectedAddOns
            .map((a) =>
              a.addOnId === addOnId
                ? { ...a, quantity: Math.max(0, quantity), total: a.unitPrice * Math.max(0, quantity) }
                : a
            )
            .filter((a) => a.quantity > 0);

          const newTotal = calculateItemTotal(
            item.packageDetails.price,
            item.guestsCount,
            updatedAddOns
          );
          return { ...item, selectedAddOns: updatedAddOns, itemTotal: newTotal };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemCount = items.length;
  const subtotal = items.reduce((sum, item) => sum + item.itemTotal, 0);
  const platformFee = Math.round((subtotal * 5) / 100);
  const taxAmount = Math.round(((subtotal + platformFee) * 18) / 100);
  const totalAmount = subtotal + platformFee + taxAmount;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateGuests,
        updateAddOn,
        clearCart,
        itemCount,
        subtotal,
        platformFee,
        taxAmount,
        totalAmount,
        isDrawerOpen,
        setIsDrawerOpen,
        openDrawer: () => setIsDrawerOpen(true),
        closeDrawer: () => setIsDrawerOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
