"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  PartyPopper,
  PlusCircle,
  Ticket,
  LogOut,
  ExternalLink,
  ChevronDown,
  Building2,
  Calendar,
} from "lucide-react";

export default function OrganiserHeader() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getPageTitle = () => {
    if (pathname === "/organiser/events/new") return "List New Celebration Venue";
    if (pathname.includes("/organiser/events")) return "Manage Venue Spaces";
    if (pathname.includes("/organiser/bookings")) return "Guest Check-In & Admissions";
    return "Venue Host Studio Dashboard";
  };

  return (
    <header className="sticky top-0 z-20 bg-slate-950/85 backdrop-blur-xl border-b border-purple-500/10 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
      {/* Page Title & Breadcrumb */}
      <div>
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          <span>Host Studio</span>
          <span>/</span>
          <span className="text-purple-400">{getPageTitle()}</span>
        </div>
        <h1 className="text-base sm:text-lg font-heading font-black text-white">
          {getPageTitle()}
        </h1>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Quick Check-in link */}
        <Link
          href="/organiser/bookings"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 hover:bg-white/5 text-slate-200 text-xs font-bold transition"
        >
          <Ticket className="w-3.5 h-3.5 text-amber-400" />
          <span>Guest Scanner</span>
        </Link>

        {/* Quick Add Venue CTA */}
        <Link
          href="/organiser/events/new"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold shadow-md shadow-purple-900/30 transition"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>List Venue</span>
        </Link>

        {/* Organiser Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 pl-3 rounded-full bg-slate-900 border border-white/10 hover:border-purple-500/40 transition text-left"
          >
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-white leading-tight truncate max-w-[120px]">
                {user?.companyName || user?.name}
              </div>
              <div className="text-[10px] text-purple-400 font-mono">Host Partner</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-pink-600 text-white font-bold flex items-center justify-center text-xs shadow-md">
              {user?.name?.charAt(0) || "H"}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-purple-500/20 rounded-2xl shadow-2xl p-2 z-50 text-xs space-y-1">
                <div className="p-2.5 border-b border-white/10">
                  <div className="font-bold text-white truncate">{user?.name}</div>
                  <div className="text-slate-400 text-[11px] truncate">{user?.email}</div>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold text-[10px] uppercase">
                    Venue Host Partner
                  </span>
                </div>

                <Link
                  href="/organiser/events"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition"
                >
                  <Building2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>My Listed Venues</span>
                </Link>

                <Link
                  href="/events"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition"
                >
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-3.5 h-3.5 text-pink-400" />
                    <span>View Public Marketplace</span>
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
