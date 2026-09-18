"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { formatPrice, formatEventDate } from "@/lib/utils";
import {
  X,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

export default function CartDrawer() {
  const {
    items,
    isDrawerOpen,
    closeDrawer,
    removeItem,
    updateGuests,
    clearCart,
    subtotal,
    platformFee,
    taxAmount,
    totalAmount,
  } = useCart();
  const { toast } = useToast();
  const router = useRouter();

  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop */}
      <div
        onClick={closeDrawer}
        className="absolute inset-0 bg-black/75 backdrop-blur-md transition-opacity duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-slate-950 border-l border-white/10 shadow-2xl flex flex-col text-slate-100">
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-slate-900/80 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-heading font-extrabold text-white">Your Celebration Cart</h2>
                <p className="text-xs text-slate-400 font-medium">
                  {items.length} {items.length === 1 ? "venue pass" : "venue passes"} selected
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {items.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-slate-400 hover:text-rose-400 transition px-2 py-1 font-medium"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={closeDrawer}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition"
                aria-label="Close cart drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-18 h-18 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500">
                  <ShoppingBag className="w-9 h-9" />
                </div>
                <h3 className="text-lg font-heading font-bold text-white">Your cart is empty</h3>
                <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
                  Discover luxury rooftops, private villas, farmhouses, and banquet lawns to start planning.
                </p>
                <button
                  onClick={() => {
                    closeDrawer();
                    router.push("/events");
                  }}
                  className="mt-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-sm font-heading font-bold rounded-xl shadow-lg shadow-amber-500/20 transition"
                >
                  Explore Venues
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="border border-white/10 rounded-2xl p-4 bg-slate-900/80 backdrop-blur-xl shadow-lg space-y-3 relative group transition hover:border-amber-400/30"
                >
                  {/* Event details row */}
                  <div className="flex gap-3.5">
                    <img
                      src={item.eventCoverImage}
                      alt={item.eventTitle}
                      className="w-20 h-20 rounded-xl object-cover shrink-0 border border-white/10"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-sm font-heading font-bold text-white line-clamp-1">
                          {item.eventTitle}
                        </h4>
                        <button
                          onClick={() => {
                            removeItem(item.id);
                            toast.info(`Removed "${item.eventTitle}" from cart`);
                          }}
                          className="text-slate-400 hover:text-rose-400 transition p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-400">
                        <span className="font-semibold text-amber-300 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">
                          {item.packageDetails.name}
                        </span>
                        <span>•</span>
                        <span className="text-slate-300">{formatPrice(item.packageDetails.price)} / guest</span>
                      </div>

                      <div className="mt-2 text-xs text-slate-400 flex flex-wrap gap-x-3 gap-y-1">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-amber-400" />
                          {formatEventDate(item.selectedSlot.date, "dd MMM yyyy")}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          {item.selectedSlot.startTime} - {item.selectedSlot.endTime}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Add-ons summary if any */}
                  {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                    <div className="bg-white/5 rounded-xl p-3 text-xs text-slate-300 space-y-1.5 border border-white/5">
                      <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Included Add-ons:
                      </span>
                      {item.selectedAddOns.map((addon) => (
                        <div key={addon.addOnId} className="flex justify-between pl-4 text-slate-300">
                          <span>
                            {addon.name} × {addon.quantity}
                          </span>
                          <span className="font-medium text-white">
                            {formatPrice(addon.total)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Guests counter & Item total */}
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="text-slate-400 font-medium">Guests:</span>
                      <div className="flex items-center border border-white/10 rounded-xl bg-white/5 p-0.5">
                        <button
                          onClick={() => updateGuests(item.id, item.guestsCount - 1)}
                          disabled={item.guestsCount <= 1}
                          className="w-6 h-6 flex items-center justify-center hover:bg-white/10 text-slate-200 disabled:opacity-30 rounded-lg transition"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 font-bold text-white text-xs">
                          {item.guestsCount}
                        </span>
                        <button
                          onClick={() => updateGuests(item.id, item.guestsCount + 1)}
                          className="w-6 h-6 flex items-center justify-center hover:bg-white/10 text-slate-200 rounded-lg transition"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-slate-400 block font-medium">Total</span>
                      <span className="text-base font-heading font-black text-amber-400">
                        {formatPrice(item.itemTotal)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout button */}
          {items.length > 0 && (
            <div className="p-5 sm:p-6 border-t border-white/10 bg-slate-900/90 backdrop-blur-xl space-y-4">
              <div className="space-y-2 text-sm text-slate-300">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-white">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Platform Fee (5%)</span>
                  <span className="font-medium text-slate-300">{formatPrice(platformFee)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Estimated Taxes (GST 18%)</span>
                  <span className="font-medium text-slate-300">{formatPrice(taxAmount)}</span>
                </div>
                <div className="border-t border-white/10 pt-2.5 flex justify-between text-base font-heading font-black text-white">
                  <span>Total Amount</span>
                  <span className="text-amber-400 text-lg">{formatPrice(totalAmount)}</span>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <Link
                  href="/cart"
                  onClick={closeDrawer}
                  className="flex-1 py-3 px-4 text-center text-sm font-heading font-bold text-white bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl transition"
                >
                  View Full Cart
                </Link>

                <button
                  onClick={() => {
                    closeDrawer();
                    router.push("/checkout");
                  }}
                  className="flex-1 py-3 px-4 text-center text-sm font-heading font-bold text-slate-950 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 rounded-xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition"
                >
                  Checkout
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
