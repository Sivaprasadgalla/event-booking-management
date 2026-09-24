"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  PartyPopper,
  Sparkles,
  Ticket,
  FileText,
  User,
  LogOut,
  ChevronRight,
  Compass,
  Menu,
  X,
} from "lucide-react";

export default function CustomerSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    {
      title: "Celebration Lounge",
      href: "/customer/dashboard",
      icon: Sparkles,
      exact: true,
    },
    {
      title: "My Passes & QR Tickets",
      href: "/customer/bookings",
      icon: Ticket,
    },
    {
      title: "Invoices & Receipts",
      href: "/customer/invoices",
      icon: FileText,
    },
    {
      title: "Profile & Preferences",
      href: "/profile",
      icon: User,
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between bg-slate-950/95 border-r border-pink-500/10 text-slate-300">
      {/* Top Brand & User profile */}
      <div className="p-6 space-y-6">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 flex items-center justify-center text-white font-bold shadow-lg shadow-purple-900/40 group-hover:scale-105 transition">
            <PartyPopper className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-extrabold text-base text-white tracking-tight">
                Celebrate<span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Hub</span>
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-pink-300">
              Celebration Concierge
            </span>
          </div>
        </Link>

        {/* Member Profile Badge */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-900/30 to-pink-900/20 border border-purple-500/20 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" /> VIP Guest Member
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold">Active</span>
          </div>
          <div className="font-bold text-white text-sm truncate">{user?.name || "Celebration Guest"}</div>
          <div className="text-[11px] text-slate-400 truncate">{user?.email}</div>
        </div>

        {/* Navigation items */}
        <nav className="space-y-1.5 pt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact ? pathname === item.href : pathname?.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition ${
                  isActive
                    ? "bg-gradient-to-r from-purple-600/30 via-pink-600/20 to-transparent text-white border border-purple-500/30 shadow-lg shadow-purple-900/20 font-bold"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-pink-400" : "text-slate-500"}`} />
                  <span>{item.title}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-pink-400" />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions & Logout */}
      <div className="p-5 border-t border-white/5 space-y-3">
        <Link
          href="/events"
          className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 hover:from-purple-600/30 hover:to-pink-600/30 border border-purple-500/30 text-xs font-bold text-purple-200 transition"
        >
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-pink-400" />
            <span>Discover New Venues</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-pink-400" />
        </Link>

        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition text-left"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of Account</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block w-72 shrink-0 h-screen sticky top-0 z-30">
        {sidebarContent}
      </aside>

      <div className="lg:hidden flex items-center justify-between p-4 bg-slate-950 border-b border-pink-500/10 text-white">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-600 text-white flex items-center justify-center font-bold">
            <PartyPopper className="w-4 h-4" />
          </div>
          <span className="font-heading font-extrabold text-sm text-white">
            Celebrate<span className="text-pink-400">Concierge</span>
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-slate-400 hover:text-white rounded-xl bg-white/5"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}

