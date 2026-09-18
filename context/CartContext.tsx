"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/context/ToastContext";

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
  sessionId: string;
  holdExpiresAt: number | null;
  remainingSeconds: number;
  addItem: (item: Omit<CartItem, "id" | "itemTotal">) => Promise<{ success: boolean; error?: string }>;
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
const SESSION_STORAGE_KEY = "celebratehub_cart_session_v1";
const HOLD_EXPIRES_KEY = "celebratehub_hold_expires_v1";

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
  const { toast } = useToast();
  const [items, setItems] = useState<CartItem[]>([]);
  const [sessionId, setSessionId] = useState<string>("");
  const [holdExpiresAt, setHoldExpiresAt] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize or retrieve Session ID
  useEffect(() => {
    try {
      let currentSessionId = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!currentSessionId) {
        currentSessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
        localStorage.setItem(SESSION_STORAGE_KEY, currentSessionId);
      }
      setSessionId(currentSessionId);

      // Load hold expiration
      const storedExpires = localStorage.getItem(HOLD_EXPIRES_KEY);
      if (storedExpires) {
        const expTimestamp = Number(storedExpires);
        if (expTimestamp > Date.now()) {
          setHoldExpiresAt(expTimestamp);
          setRemainingSeconds(Math.max(0, Math.ceil((expTimestamp - Date.now()) / 1000)));
        } else {
          // Already expired
          localStorage.removeItem(HOLD_EXPIRES_KEY);
          localStorage.removeItem(CART_STORAGE_KEY);
          setHoldExpiresAt(null);
        }
      }

      // Load cart items
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored && storedExpires && Number(storedExpires) > Date.now()) {
        setItems(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to initialize cart session", e);
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

  // 1-second countdown timer for the 10-minute hold
  useEffect(() => {
    if (!holdExpiresAt || items.length === 0) {
      setRemainingSeconds(0);
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, Math.ceil((holdExpiresAt - now) / 1000));
      setRemainingSeconds(diff);

      if (diff <= 0) {
        clearInterval(interval);
        // Automatic expiration: release hold and clear cart
        if (sessionId) {
          fetch(`/api/cart/hold?sessionId=${sessionId}`, { method: "DELETE" }).catch(console.error);
        }
        setItems([]);
        setHoldExpiresAt(null);
        try {
          localStorage.removeItem(HOLD_EXPIRES_KEY);
          localStorage.removeItem(CART_STORAGE_KEY);
        } catch (e) {}

        toast.warning(
          "Your 10-minute celebration reservation hold has expired. The time slot has been released for other guests.",
          "Hold Expired",
          7000
        );
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [holdExpiresAt, items.length, sessionId, toast]);

  const addItem = async (
    itemData: Omit<CartItem, "id" | "itemTotal">
  ): Promise<{ success: boolean; error?: string }> => {
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      currentSessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      setSessionId(currentSessionId);
      try {
        localStorage.setItem(SESSION_STORAGE_KEY, currentSessionId);
      } catch (e) {}
    }

    try {
      // 1. Lock slot hold in database
      const res = await fetch("/api/cart/hold", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: itemData.eventId,
          slotId: itemData.selectedSlot.slotId,
          date: itemData.selectedSlot.date,
          sessionId: currentSessionId,
          guestsCount: itemData.guestsCount,
        }),
      });

      const holdData = await res.json();
      if (!res.ok) {
        return {
          success: false,
          error: holdData.error || "This time slot is currently reserved by another guest.",
        };
      }

      // 2. Set/update hold expiration timestamp (10 minutes)
      const expiresTimestamp = holdData.expiresAtTimestamp || (Date.now() + 10 * 60 * 1000);
      setHoldExpiresAt(expiresTimestamp);
      try {
        localStorage.setItem(HOLD_EXPIRES_KEY, String(expiresTimestamp));
      } catch (e) {}

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
      return { success: true };
    } catch (err: any) {
      console.error("Failed to reserve slot hold:", err);
      return { success: false, error: err.message || "Failed to reserve slot hold" };
    }
  };

  const removeItem = (itemId: string) => {
    const itemToRemove = items.find((i) => i.id === itemId);
    if (itemToRemove && sessionId) {
      fetch(
        `/api/cart/hold?sessionId=${sessionId}&eventId=${itemToRemove.eventId}&slotId=${itemToRemove.selectedSlot.slotId}&date=${itemToRemove.selectedSlot.date}`,
        { method: "DELETE" }
      ).catch(console.error);
    }

    setItems((prev) => {
      const next = prev.filter((item) => item.id !== itemId);
      if (next.length === 0) {
        setHoldExpiresAt(null);
        try {
          localStorage.removeItem(HOLD_EXPIRES_KEY);
        } catch (e) {}
      }
      return next;
    });
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
    if (sessionId) {
      fetch(`/api/cart/hold?sessionId=${sessionId}`, { method: "DELETE" }).catch(console.error);
    }
    setItems([]);
    setHoldExpiresAt(null);
    try {
      localStorage.removeItem(HOLD_EXPIRES_KEY);
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (e) {}
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
        sessionId,
        holdExpiresAt,
        remainingSeconds,
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
