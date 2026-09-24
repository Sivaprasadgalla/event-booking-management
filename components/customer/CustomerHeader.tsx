"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import {
  Sparkles,
  ShoppingBag,
  Compass,
  Ticket,
  FileText,
  User,
  LogOut,
  ChevronDown,
  Clock,
  ExternalLink,
} from "lucide-react";

export default function CustomerHeader() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { items, remainingSeconds } = useCart();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getPageTitle = () => {
    if (pathname.includes("/customer/bookings")) return "My Passes & Gate Entry Tickets";
    if (pathname.includes("/customer/invoices")) return "Booking Receipts & Tax Invoices";
    if (pathname.includes("/profile")) return "Account & Profile Preferences";
    return "Celebration Lounge & Quick Access";
  };

  const formatHoldTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <header className="sticky top-0 z-20 bg-[#080914]/85 backdrop-blur-xl border-b border-pink-500/10 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
      {/* Page Title & Breadcrumb */}
      <div>
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          <span>Celebration Portal</span>
          <span>/</span>
          <span className="text-pink-400">{getPageTitle()}</span>
        </div>
        <h1 className="text-base sm:text-lg font-heading font-black text-white">
          {getPageTitle()}
        </h1>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Slot Hold Timer if cart active */}
        {remainingSeconds > 0 && items.length > 0 && (
          <Link
            href="/cart"
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold animate-pulse"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Holds Expire: {formatHoldTimer(remainingSeconds)}</span>
          </Link>
        )}

        {/* Explore Venues */}
        <Link
          href="/events"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/20 text-purple-300 text-xs font-bold transition"
        >
          <Compass className="w-3.5 h-3.5 text-pink-400" />
          <span>Explore Venues</span>
        </Link>

        {/* Celebration Bag / Cart */}
        <Link
          href="/cart"
          className="relative p-2 rounded-xl bg-slate-900 border border-white/10 hover:border-pink-500/30 text-slate-300 hover:text-white transition flex items-center justify-center"
          aria-label="View Cart"
        >
          <ShoppingBag className="w-4 h-4 text-pink-400" />
          {items.length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-[10px] flex items-center justify-center shadow-lg shadow-pink-900/50">
              {items.length}
            </span>
          )}
        </Link>

        {/* Customer Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 pl-3 rounded-full bg-slate-900 border border-white/10 hover:border-pink-500/30 transition text-left"
          >
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-white leading-tight">{user?.name || "VIP Guest"}</div>
              <div className="text-[10px] text-pink-400 font-mono">Celebration Member</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-pink-600 text-white font-bold flex items-center justify-center text-xs shadow-md shadow-pink-900/40">
              {user?.name?.charAt(0) || "U"}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-pink-500/20 rounded-2xl shadow-2xl p-2 z-50 text-xs space-y-1">
                <div className="p-2.5 border-b border-white/10">
                  <div className="font-bold text-white truncate">{user?.name}</div>
                  <div className="text-slate-400 text-[11px] truncate">{user?.email}</div>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 font-bold text-[10px] uppercase">
                    VIP Member
                  </span>
                </div>

                <Link
                  href="/customer/bookings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition"
                >
                  <Ticket className="w-3.5 h-3.5 text-purple-400" />
                  <span>My Passes & QR Tickets</span>
                </Link>

                <Link
                  href="/customer/invoices"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition"
                >
                  <FileText className="w-3.5 h-3.5 text-pink-400" />
                  <span>Invoices & Receipts</span>
                </Link>

                <Link
                  href="/events"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition"
                >
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                    <span>Public Marketplace</span>
                  </div>
                </Link>

                <div className="pt-1 border-t border-white/10">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

