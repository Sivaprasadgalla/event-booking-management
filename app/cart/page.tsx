"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { formatPrice, formatEventDate, isSlotStarted } from "@/lib/utils";
import {
  ShoppingBag,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  Plus,
  Minus,
  ArrowRight,
  Sparkles,
  Ticket,
  ShieldCheck,
  Building2,
  AlertCircle,
} from "lucide-react";

export default function CartPage() {
  const {
    items,
    removeItem,
    updateGuests,
    clearCart,
    subtotal,
    platformFee,
    taxAmount,
    totalAmount,
  } = useCart();
  const router = useRouter();
  const { toast } = useToast();

  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [discount, setDiscount] = useState(0);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === "CELEBRATE2026") {
      setPromoApplied(true);
      setDiscount(Math.round(subtotal * 0.1)); // 10% discount
      toast.success("Promo code 'CELEBRATE2026' applied! 10% discount deducted.", "Coupon Applied");
    } else {
      toast.error("Invalid coupon code. Try 'CELEBRATE2026' for a 10% promotional discount!", "Invalid Coupon");
    }
  };

  const finalTotal = Math.max(0, totalAmount - discount);
  const hasExpiredItems = items.some((i) =>
    isSlotStarted(i.selectedSlot?.date, i.selectedSlot?.startTime)
  );

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-28 text-center space-y-5">
        <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-400">
          <ShoppingBag className="w-10 h-10 text-amber-400" />
        </div>
        <h2 className="text-3xl font-heading font-extrabold text-white">Your Cart is Empty</h2>
        <p className="text-sm sm:text-base text-slate-400 max-w-md mx-auto leading-relaxed">
          You haven&apos;t reserved any celebration venues yet. Explore luxury rooftop lounges, private villas, beachfront lawns, and banquet estates.
        </p>
        <Link
          href="/events"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-heading font-bold text-sm shadow-lg shadow-amber-500/20 transition"
        >
          <span>Discover Celebration Venues</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-white tracking-tight">
            Celebration Cart
          </h1>
          <p className="text-sm sm:text-base text-slate-400 mt-1">
            {items.length} venue experience(s) selected
          </p>
        </div>

        <button
          onClick={() => {
            clearCart();
            toast.info("Cart has been cleared");
          }}
          className="text-xs font-semibold text-rose-400 hover:text-rose-300 transition self-start sm:self-auto"
        >
          Clear Entire Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items list */}
        <div className="lg:col-span-2 space-y-5">
          {hasExpiredItems && (
            <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <div>
                <div className="font-bold text-rose-300">Action Required: Shift Started</div>
                <div className="text-[11px] text-slate-300">
                  One or more celebration shifts in your cart have already started. Please remove them to proceed to checkout.
                </div>
              </div>
            </div>
          )}

          {items.map((item) => {
            const isItemExpired = isSlotStarted(
              item.selectedSlot?.date,
              item.selectedSlot?.startTime
            );

            return (
              <div
                key={item.id}
                className={`border rounded-3xl p-6 backdrop-blur-xl shadow-xl space-y-5 relative transition ${
                  isItemExpired
                    ? "bg-rose-950/20 border-rose-500/30"
                    : "bg-slate-900/60 border-white/10 hover:border-amber-400/20"
                }`}
              >
                {isItemExpired && (
                  <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 font-bold">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      This celebration shift has already started and cannot be booked.
                    </span>
                    <button
                      onClick={() => {
                        removeItem(item.id);
                        toast.info(`Removed expired shift "${item.eventTitle}"`);
                      }}
                      className="px-3 py-1 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-200 font-bold text-xs transition shrink-0"
                    >
                      Remove Shift
                    </button>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex gap-4 sm:gap-5">
                    <img
                      src={item.eventCoverImage}
                      alt={item.eventTitle}
                      className="w-24 h-24 rounded-2xl object-cover border border-white/10 shrink-0"
                    />
                    <div className="space-y-1.5">
                      <div className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5" />
                        Hosted by {item.organiserName}
                      </div>
                      <Link href={`/events/${item.eventSlug}`}>
                        <h3 className={`font-heading font-bold text-lg hover:text-amber-400 transition line-clamp-1 ${isItemExpired ? "text-slate-400 line-through" : "text-white"}`}>
                          {item.eventTitle}
                        </h3>
                      </Link>
                      <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-400 pt-1">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          {item.venueName}, {item.city}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          {formatEventDate(item.selectedSlot.date, "EEE, dd MMM yyyy")}
                        </span>
                        <span className={`flex items-center gap-1.5 ${isItemExpired ? "text-rose-400 font-bold" : "text-slate-400"}`}>
                          <Clock className="w-4 h-4" />
                          {item.selectedSlot.startTime} - {item.selectedSlot.endTime}
                        </span>
                      </div>
                    </div>
                  </div>

                <button
                  onClick={() => {
                    removeItem(item.id);
                    toast.info(`Removed "${item.eventTitle}" from cart`);
                  }}
                  className="self-end sm:self-start p-2.5 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-white/5 transition"
                  title="Remove from cart"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              {/* Package & Addons breakdown */}
              <div className="bg-white/5 rounded-2xl p-4 sm:p-5 space-y-3 text-sm border border-white/5">
                <div className="flex items-center justify-between font-semibold text-white">
                  <span>
                    Celebration Package: <span className="text-amber-300 font-bold">{item.packageDetails.name}</span>{" "}
                    <span className="text-xs text-slate-400 font-normal">(Flat Celebration Tier Fee)</span>
                  </span>
                  <span className="font-heading font-bold text-white">
                    {formatPrice(item.packageDetails.price)}
                  </span>
                </div>

                {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                  <div className="pt-3 border-t border-white/10 space-y-2">
                    <span className="text-xs uppercase font-bold text-slate-400 block tracking-wider">
                      Selected Add-ons & Amenities
                    </span>
                    {item.selectedAddOns.map((addon) => (
                      <div key={addon.addOnId} className="flex justify-between text-slate-300 pl-2 text-xs sm:text-sm">
                        <span>
                          {addon.name} × {addon.quantity}
                        </span>
                        <span className="font-semibold text-white">
                          {formatPrice(addon.total)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Guest Counter and Total */}
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-slate-300">Guests / Attendees:</span>
                  <div className="flex items-center border border-white/10 rounded-xl bg-slate-950 p-0.5">
                    <button
                      onClick={() => updateGuests(item.id, item.guestsCount - 1)}
                      disabled={item.guestsCount <= 1}
                      className="w-8 h-8 flex items-center justify-center hover:bg-white/10 text-slate-200 disabled:opacity-30 rounded-lg transition"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center text-sm font-bold text-white">
                      {item.guestsCount}
                    </span>
                    <button
                      onClick={() => updateGuests(item.id, item.guestsCount + 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-white/10 text-slate-200 rounded-lg transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 uppercase font-semibold block">
                    Venue Pass Subtotal
                  </span>
                  <span className="text-xl font-heading font-black text-amber-400">
                    {formatPrice(item.itemTotal)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

        {/* Order Summary Card */}
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 sm:p-7 backdrop-blur-xl shadow-xl space-y-6 sticky top-24">
            <h2 className="text-lg font-heading font-bold text-white pb-3 border-b border-white/10">
              Celebration Summary
            </h2>

            {/* Promo Code Input */}
            <form onSubmit={handleApplyPromo} className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Promo Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. CELEBRATE2026"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  disabled={promoApplied}
                  className="flex-1 p-3 rounded-xl bg-slate-950 border border-white/10 text-xs sm:text-sm uppercase font-semibold tracking-wider text-white placeholder-slate-500 outline-none focus:border-amber-400 transition disabled:bg-white/5"
                />
                <button
                  type="submit"
                  disabled={promoApplied || !promoCode.trim()}
                  className="px-4 py-3 bg-white/10 hover:bg-white/15 disabled:opacity-40 text-white rounded-xl text-xs font-heading font-bold transition"
                >
                  {promoApplied ? "Applied ✓" : "Apply"}
                </button>
              </div>
              {promoApplied && (
                <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1 pt-1">
                  <Sparkles className="w-3.5 h-3.5" /> 10% Celebration discount applied!
                </p>
              )}
            </form>

            {/* Summary lines */}
            <div className="space-y-3 text-sm text-slate-300 pt-3 border-t border-white/10">
              <div className="flex justify-between">
                <span>Venue Passes Subtotal</span>
                <span className="font-semibold text-white">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Platform Facilitation Fee (5%)</span>
                <span className="font-medium text-slate-300">{formatPrice(platformFee)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>GST & Hospitality Taxes (18%)</span>
                <span className="font-medium text-slate-300">{formatPrice(taxAmount)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-400 font-bold">
                  <span>Promotional Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}

              <div className="border-t border-white/10 pt-4 flex justify-between text-lg font-heading font-black text-white">
                <span>Total Due</span>
                <span className="text-amber-400 text-xl">{formatPrice(finalTotal)}</span>
              </div>
            </div>

            <button
              onClick={() => {
                if (hasExpiredItems) {
                  toast.error(
                    "Please remove expired shift(s) from your cart before proceeding to checkout.",
                    "Expired Shift"
                  );
                  return;
                }
                router.push("/checkout");
              }}
              disabled={hasExpiredItems}
              className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-heading font-bold text-sm shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{hasExpiredItems ? "Remove Expired Shift(s) to Proceed" : "Proceed to Checkout"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Razorpay 256-Bit Bank Encrypted Payment</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
