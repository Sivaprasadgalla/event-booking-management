"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Shield,
  Search,
  Bell,
  Sparkles,
  RotateCcw,
  LogOut,
  ExternalLink,
  ChevronDown,
  User,
} from "lucide-react";
import ThemeToggle from "@/components/common/ThemeToggle";

export default function AdminHeader() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getPageTitle = () => {
    if (pathname.includes("/admin/cms")) return "CMS & Visual Content Studio";
    if (pathname.includes("/admin/events")) return "Venue Approvals & Moderation";
    if (pathname.includes("/admin/users")) return "User & Host Directory";
    if (pathname.includes("/admin/refunds")) return "Disputes & Financial Refunds";
    if (pathname.includes("/admin/settings")) return "Platform Commission & Settings";
    return "Administrator Command Center";
  };

  return (
    <header className="sticky top-0 z-20 bg-slate-950/85 backdrop-blur-xl border-b border-amber-500/10 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
      {/* Page Title & Breadcrumb */}
      <div>
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          <span>Admin Portal</span>
          <span>/</span>
          <span className="text-amber-400">{getPageTitle()}</span>
        </div>
        <h1 className="text-base sm:text-lg font-heading font-black text-white">
          {getPageTitle()}
        </h1>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Theme Switcher */}
        <ThemeToggle />

        {/* Quick links to pending items */}
        <Link
          href="/admin/events"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-300 text-xs font-bold transition"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Moderation</span>
        </Link>

        <Link
          href="/admin/refunds"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 text-xs font-bold transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Disputes</span>
        </Link>

        {/* Admin Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 pl-3 rounded-full bg-slate-900 border border-white/10 hover:border-amber-500/30 transition text-left"
          >
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-white leading-tight">{user?.name || "Admin"}</div>
              <div className="text-[10px] text-amber-400 font-mono">Platform Lead</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 text-slate-950 font-bold flex items-center justify-center text-xs shadow-md">
              {user?.name?.charAt(0) || "A"}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-amber-500/20 rounded-2xl shadow-2xl p-2 z-50 text-xs space-y-1">
                <div className="p-2.5 border-b border-white/10">
                  <div className="font-bold text-white truncate">{user?.name}</div>
                  <div className="text-slate-400 text-[11px] truncate">{user?.email}</div>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px] uppercase">
                    Platform Administrator
                  </span>
                </div>

                <Link
                  href="/events"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition"
                >
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-3.5 h-3.5 text-purple-400" />
                    <span>View Customer Marketplace</span>
                  </div>
                </Link>

                <Link
                  href="/admin/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition"
                >
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span>Platform Settings</span>
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
