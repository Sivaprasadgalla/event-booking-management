"use client";

import React from "react";
import { formatPrice } from "@/lib/utils";
import { Sparkles, Plus, Minus } from "lucide-react";

export interface AddOnItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  maxPerBooking: number;
}

interface AddOnsSelectorProps {
  addOns: AddOnItem[];
  selectedAddOns: Record<string, number>; // addOnId -> quantity
  onChangeQuantity: (addOnId: string, quantity: number) => void;
}

export default function AddOnsSelector({
  addOns,
  selectedAddOns,
  onChangeQuantity,
}: AddOnsSelectorProps) {
  if (!addOns || addOns.length === 0) return null;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h3 className="text-base sm:text-lg font-heading font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-pink-400" />
            <span>3. Celebration Add-ons & Curated Enhancements</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Elevate your party with live performers, custom cakes, and bespoke decor
          </p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full">
          Optional
        </span>
      </div>

      <div className="space-y-3">
        {addOns.map((addon) => {
          const qty = selectedAddOns[addon.id] || 0;
          const isSelected = qty > 0;

          return (
            <div
              key={addon.id}
              className={`rounded-2xl p-4 border transition-all flex items-center justify-between gap-4 ${
                isSelected
                  ? "border-purple-500/60 bg-purple-500/15 shadow-md shadow-purple-900/20"
                  : "border-white/10 bg-white/5 hover:border-purple-500/30 hover:bg-white/10"
              }`}
            >
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-heading font-bold text-sm sm:text-base text-white">{addon.name}</h4>
                  <span className="text-xs sm:text-sm font-bold text-purple-300">
                    +{formatPrice(addon.price)}
                  </span>
                </div>
                {addon.description && (
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {addon.description}
                  </p>
                )}
              </div>

              {/* Counter */}
              <div className="flex items-center gap-2 bg-slate-950 border border-white/10 rounded-xl p-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => onChangeQuantity(addon.id, Math.max(0, qty - 1))}
                  disabled={qty === 0}
                  className="w-8 h-8 rounded-lg hover:bg-white/10 text-slate-300 disabled:opacity-30 font-bold text-sm flex items-center justify-center transition"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-7 text-center font-heading font-bold text-sm text-white">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    onChangeQuantity(addon.id, Math.min(addon.maxPerBooking || 5, qty + 1))
                  }
                  disabled={qty >= (addon.maxPerBooking || 5)}
                  className="w-8 h-8 rounded-lg hover:bg-white/10 text-slate-300 disabled:opacity-30 font-bold text-sm flex items-center justify-center transition"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
