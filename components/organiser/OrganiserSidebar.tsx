"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  PartyPopper,
  LayoutDashboard,
  Building2,
  PlusCircle,
  Ticket,
  LogOut,
  Sparkles,
  ExternalLink,
  Menu,
  X,
  Wallet,
  ShieldCheck,
} from "lucide-react";

export default function OrganiserSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    {
      title: "Host Studio Overview",
      href: "/organiser/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "My Venues & Spaces",
      href: "/organiser/events",
      icon: Building2,
    },
    {
      title: "List Celebration Venue",
      href: "/organiser/events/new",
      icon: PlusCircle,
      highlight: true,
    },
    {
      title: "Guest Bookings & Check-in",
      href: "/organiser/bookings",
      icon: Ticket,
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between bg-slate-950/95 border-r border-purple-500/10 text-slate-300">
      {/* Top Brand & Host Info */}
      <div className="p-6 space-y-6">
        <Link href="/organiser/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg shadow-purple-900/40 group-hover:scale-105 transition">
            <PartyPopper className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-extrabold text-base text-white tracking-tight">
                Celebrate<span className="text-purple-400">Host</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300/80">
                Partner Studio
              </span>
            </div>
          </div>
        </Link>

        {/* Host Identity Card */}
        <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs space-y-1">
          <div className="text-[10px] uppercase font-bold text-purple-300 tracking-wider flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Verified Venue Host</span>
          </div>
          <div className="font-bold text-white text-sm truncate">
            {user?.companyName || user?.name || "Celebration Host"}
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5 pt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition ${
                  isActive
                    ? "bg-gradient-to-r from-purple-600/30 to-indigo-600/20 text-white border border-purple-500/40 shadow-lg shadow-purple-900/20 font-bold"
                    : item.highlight
                    ? "text-purple-300 hover:text-white bg-purple-500/5 hover:bg-purple-500/15 border border-purple-500/20"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-purple-400" : item.highlight ? "text-pink-400" : "text-slate-500"}`} />
                  <span>{item.title}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Payout info & User */}
      <div className="p-5 border-t border-white/5 space-y-4">
        {/* Host Earnings Guarantee */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 text-[11px] text-slate-400 space-y-1">
          <div className="flex items-center justify-between font-semibold text-slate-300">
            <span className="flex items-center gap-1 text-emerald-400">
              <Wallet className="w-3.5 h-3.5" /> 95% Net Payout
            </span>
            <span className="text-[10px] text-slate-500">Auto-Disbursed</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-snug">
            Platform collects only 5% fee on confirmed guest reservations.
          </p>
        </div>

        {/* View Public Storefront */}
        <Link
          href="/events"
          className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-300 border border-white/5 transition group"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span className="font-semibold text-white">Public Marketplace</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition" />
        </Link>

        {/* User profile & logout */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2.5 truncate">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-pink-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
              {user?.name?.charAt(0) || "H"}
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-white truncate">{user?.name}</div>
              <div className="text-[10px] text-purple-300 truncate">{user?.email}</div>
            </div>
          </div>
          <button
            onClick={() => logout()}
            title="Sign Out"
            className="p-2 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block w-72 shrink-0 h-screen sticky top-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Trigger */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-slate-950 border-b border-purple-500/10 text-white">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-600 text-white flex items-center justify-center font-bold">
            <PartyPopper className="w-4 h-4" />
          </div>
          <span className="font-heading font-extrabold text-sm text-white">
            Celebrate<span className="text-purple-400">Host Studio</span>
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
