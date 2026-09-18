"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { Clock, AlertTriangle, ArrowRight, ShieldCheck } from "lucide-react";

export default function ReservationTimer() {
  const { remainingSeconds, items, holdExpiresAt, openDrawer } = useCart();
  const router = useRouter();
  const [showTooltip, setShowTooltip] = useState(false);

  if (!holdExpiresAt || items.length === 0 || remainingSeconds <= 0) {
    return null;
  }

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const isUrgent = remainingSeconds < 120; // less than 2 minutes
  const isWarning = remainingSeconds < 300; // less than 5 minutes

  return (
    <div className="relative inline-flex items-center">
      <motion.button
        type="button"
        initial={{ opacity: 0, scale: 0.85, y: -5 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.85 }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => router.push("/checkout")}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl border text-xs font-heading font-extrabold flex items-center gap-2 shadow-lg backdrop-blur-xl transition-all duration-300 ${
          isUrgent
            ? "bg-rose-950/80 border-rose-500/60 text-rose-300 shadow-rose-900/40 animate-pulse"
            : isWarning
            ? "bg-amber-950/80 border-amber-500/60 text-amber-300 shadow-amber-900/40"
            : "bg-slate-900/80 border-purple-500/40 text-purple-300 shadow-purple-950/40"
        }`}
        title="10-minute temporary reservation hold active"
      >
        <div className="relative flex items-center justify-center">
          {isUrgent ? (
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 animate-bounce" />
          ) : (
            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          )}
          <span
            className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${
              isUrgent ? "bg-rose-500" : isWarning ? "bg-amber-400" : "bg-purple-400"
            } animate-ping`}
          />
        </div>

        <div className="flex items-baseline gap-1">
          <span className="tabular-nums tracking-wider text-white font-black text-xs sm:text-sm">
            {formattedTime}
          </span>
          <span className="hidden md:inline text-[10px] text-slate-300 font-semibold uppercase tracking-wider">
            Hold
          </span>
        </div>
      </motion.button>

      {/* Floating Info Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            className="absolute top-full right-0 mt-2 w-72 p-4 bg-slate-900/95 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-2xl z-50 pointer-events-none text-left space-y-2.5"
          >
            <div className="flex items-center justify-between text-xs font-bold text-amber-400 border-b border-white/10 pb-1.5">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Celebration Shift Locked
              </span>
              <span className="font-mono">{formattedTime}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Your venue slot is locked and cannot be booked by other guests. Complete booking before the timer expires!
            </p>
            <div className="text-[11px] text-purple-300 font-semibold flex items-center justify-between pt-1">
              <span>{items.length} celebration(s) in cart</span>
              <span className="text-amber-400 flex items-center gap-1">
                Checkout <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
